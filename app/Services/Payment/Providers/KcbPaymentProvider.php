<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\SchoolApiCredential;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use App\Services\Payment\InvoiceAllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * KCB Bank Payment Provider
 *
 * Credentials are loaded per-school from SchoolApiCredential, with a
 * fallback to global config() values for backwards compatibility.
 */
class KcbPaymentProvider implements PaymentProviderInterface
{
    private string $apiKey;
    private string $apiSecret;
    private string $baseUrl;
    private string $accountNumber;
    private int $currentSchoolId = 0;

    public function __construct()
    {
        $this->apiKey        = config('services.kcb.api_key')        ?? '';
        $this->apiSecret     = config('services.kcb.api_secret')     ?? '';
        $this->baseUrl       = config('services.kcb.base_url')       ?? 'https://api.kcbgroup.com';
        $this->accountNumber = config('services.kcb.account_number') ?? '';
    }

    /**
     * Load per-school KCB credentials, overriding any global config defaults.
     */
    private function loadCredentialsForSchool(int $schoolId): void
    {
        $this->currentSchoolId = $schoolId;

        $cred = SchoolApiCredential::where('school_id', $schoolId)
            ->where('provider', 'kcb')
            ->where('enabled', true)
            ->first();

        if ($cred) {
            $this->apiKey        = $cred->credentials['api_key']        ?? $this->apiKey;
            $this->apiSecret     = $cred->credentials['api_secret']     ?? $this->apiSecret;
            $this->accountNumber = $cred->credentials['account_number'] ?? $this->accountNumber;
            $this->baseUrl       = $cred->credentials['base_url']       ?? $this->baseUrl;
        }
    }

    /**
     * Initiate payment via KCB Bank.
     */
    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        $this->loadCredentialsForSchool($transaction->school_id);

        if (!$this->validateConfiguration()) {
            return PaymentInitResult::failure('KCB Bank not configured');
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return PaymentInitResult::failure('Unable to authenticate with KCB Bank');
        }

        $callbackUrl = app('router')->has('api.payment.callback.school')
            ? route('api.payment.callback.school', ['provider' => 'kcb', 'school' => $transaction->school_id])
            : route('api.payment.callback', ['provider' => 'kcb']);

        // Build KCB payment request
        $payload = [
            'account_number' => $this->accountNumber,
            'amount' => $transaction->amount / 100, // Convert cents to KES
            'reference' => $transaction->reference,
            'customer_phone' => $transaction->phone_number,
            'description' => "School fees payment - {$transaction->school->name}",
            'callback_url' => $callbackUrl,
        ];

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->post("{$this->baseUrl}/payments/initiate", $payload);

            $data = $response->json();

            if ($response->successful() && ($data['status'] ?? '') === 'success') {
                $transaction->update([
                    'status' => 'processing',
                    'provider_reference' => $data['transaction_id'] ?? null,
                ]);

                return PaymentInitResult::success(
                    $transaction->id,
                    $data['transaction_id'] ?? $transaction->reference,
                    $data['message'] ?? 'Payment initiated. Please complete via KCB mobile banking.',
                    $data['payment_url'] ?? null
                );
            }

            Log::error('KCB payment initiation failed', [
                'transaction_id' => $transaction->id,
                'response' => $data,
            ]);

            return PaymentInitResult::failure(
                $data['message'] ?? 'Failed to initiate KCB payment',
                $data['error_code'] ?? 'KCB_ERROR'
            );
        } catch (\Exception $e) {
            Log::error('KCB payment exception', [
                'transaction_id' => $transaction->id,
                'message' => $e->getMessage(),
            ]);

            return PaymentInitResult::failure(
                'An error occurred while initiating KCB payment',
                'EXCEPTION'
            );
        }
    }

    /**
     * Check payment status with KCB Bank.
     */
    public function checkStatus(string $reference): PaymentStatusResult
    {
        $transaction = PaymentTransaction::where('reference', $reference)
            ->orWhere('provider_reference', $reference)
            ->first();

        if (!$transaction) {
            return PaymentStatusResult::failed($reference, 'Transaction not found');
        }

        if ($transaction->status === 'completed') {
            return PaymentStatusResult::completed(
                $transaction->id,
                $transaction->provider_reference,
                $transaction->amount / 100,
                $transaction->completed_at ?? now(),
                'Payment completed'
            );
        }

        $this->loadCredentialsForSchool($transaction->school_id);

        if (!$this->validateConfiguration()) {
            return PaymentStatusResult::processing($transaction->id, 'KCB Bank not configured');
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return PaymentStatusResult::processing($transaction->id, 'Unable to check status');
        }

        try {
            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/payments/status/{$transaction->provider_reference}");

            $data = $response->json();

            if ($response->successful()) {
                $status = $data['status'] ?? 'unknown';

                return match($status) {
                    'completed', 'success' => $this->markAsCompleted($transaction, $data),
                    'failed', 'cancelled' => PaymentStatusResult::failed(
                        $transaction->id,
                        $data['message'] ?? 'Payment failed',
                        $data['error_code'] ?? null
                    ),
                    default => PaymentStatusResult::processing(
                        $transaction->id,
                        'Payment is being processed'
                    ),
                };
            }

            return PaymentStatusResult::processing($transaction->id, 'Checking status...');
        } catch (\Exception $e) {
            Log::error('KCB status check exception', [
                'reference' => $reference,
                'message' => $e->getMessage(),
            ]);

            return PaymentStatusResult::processing($transaction->id, 'Unable to check status');
        }
    }

    /**
     * Handle KCB Bank callback.
     */
    public function handleCallback(Request $request): void
    {
        $payload = $request->all();
        Log::info('KCB callback received', $payload);

        $transactionId = $payload['transaction_id'] ?? $payload['reference'] ?? null;
        $status = $payload['status'] ?? 'unknown';

        if (!$transactionId) {
            Log::error('KCB callback missing transaction ID', $payload);
            return;
        }

        $transaction = PaymentTransaction::where('provider_reference', $transactionId)
            ->orWhere('reference', $transactionId)
            ->first();

        if (!$transaction) {
            Log::error('Transaction not found for KCB callback', ['transaction_id' => $transactionId]);
            return;
        }

        if (in_array($status, ['completed', 'success'])) {
            $this->markAsCompleted($transaction, $payload);
        } else {
            $transaction->update(['status' => 'failed']);
            Log::info('KCB payment failed', ['transaction_id' => $transaction->id, 'reason' => $payload['message'] ?? 'Unknown']);
        }
    }

    /**
     * Reverse a KCB payment.
     */
    public function reversePayment(string $reference, string $reason = ''): bool
    {
        $transaction = PaymentTransaction::where('provider_reference', $reference)->first();
        if (!$transaction) {
            return false;
        }

        $this->loadCredentialsForSchool($transaction->school_id);

        if (!$this->validateConfiguration()) {
            return false;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return false;
        }

        try {
            $response = Http::withToken($token)->post("{$this->baseUrl}/payments/reverse", [
                'transaction_id' => $transaction->provider_reference,
                'reason' => $reason ?: 'Payment reversal requested',
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('KCB reversal failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function getProviderName(): string
    {
        return 'kcb';
    }

    public function validateConfiguration(): bool
    {
        return !empty($this->apiKey) && !empty($this->apiSecret) && !empty($this->accountNumber);
    }

    /**
     * Get OAuth access token, cached per school to avoid credential cross-contamination.
     */
    private function getAccessToken(): ?string
    {
        $cacheKey = "kcb_access_token_{$this->currentSchoolId}";
        return Cache::remember($cacheKey, 3500, function () {
            try {
                $response = Http::asForm()->post("{$this->baseUrl}/oauth/token", [
                    'grant_type' => 'client_credentials',
                    'client_id' => $this->apiKey,
                    'client_secret' => $this->apiSecret,
                ]);

                if ($response->successful()) {
                    return $response->json()['access_token'] ?? null;
                }

                Log::error('KCB OAuth failed', ['response' => $response->json()]);
                return null;
            } catch (\Exception $e) {
                Log::error('KCB OAuth exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    /**
     * Mark transaction as completed and generate receipt.
     */
    private function markAsCompleted(PaymentTransaction $transaction, array $data): PaymentStatusResult
    {
        $transaction->update([
            'status' => 'completed',
            'completed_at' => now(),
            'provider_reference' => $data['transaction_id'] ?? $transaction->provider_reference,
        ]);

        // Generate receipt
        $receiptNumber = 'RCT-' . date('Y') . '-' . str_pad($transaction->school_id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);

        Receipt::firstOrCreate(
            ['payment_transaction_id' => $transaction->id],
            [
                'school_id' => $transaction->school_id,
                'receipt_number' => $receiptNumber,
                'student_id' => $transaction->student_id,
                'amount' => $transaction->amount,
                'payment_method' => 'kcb',
                'payment_reference' => $transaction->provider_reference,
                'issued_at' => now(),
            ]
        );

        Log::info('KCB payment completed', ['transaction_id' => $transaction->id]);

        // Allocate payment to open invoices.
        app(InvoiceAllocationService::class)->allocate($transaction);

        return PaymentStatusResult::completed(
            $transaction->id,
            $transaction->provider_reference,
            $transaction->amount / 100,
            $transaction->completed_at,
            'Payment completed successfully'
        );
    }
}
