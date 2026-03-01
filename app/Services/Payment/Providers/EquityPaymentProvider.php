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
 * Equity Bank Payment Provider (Jenga API)
 *
 * Credentials are loaded per-school from SchoolApiCredential, with a
 * fallback to global config() values for backwards compatibility.
 */
class EquityPaymentProvider implements PaymentProviderInterface
{
    private string $apiKey;
    private string $merchantCode;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey       = config('services.equity.api_key')       ?? '';
        $this->merchantCode = config('services.equity.merchant_code') ?? '';
        $this->baseUrl      = config('services.equity.base_url')      ?? 'https://api.jengaapi.io';
    }

    /**
     * Load per-school Equity credentials, overriding any global config defaults.
     */
    private function loadCredentialsForSchool(int $schoolId): void
    {
        $cred = SchoolApiCredential::where('school_id', $schoolId)
            ->where('provider', 'equity')
            ->where('enabled', true)
            ->first();

        if ($cred) {
            $this->apiKey       = $cred->credentials['api_key']       ?? $this->apiKey;
            $this->merchantCode = $cred->credentials['merchant_code'] ?? $this->merchantCode;
            $this->baseUrl      = $cred->credentials['base_url']      ?? $this->baseUrl;
        }
    }

    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        $this->loadCredentialsForSchool($transaction->school_id);

        if (!$this->validateConfiguration()) {
            return PaymentInitResult::failure('Equity Bank not configured');
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return PaymentInitResult::failure('Unable to authenticate with Equity Bank');
        }

        $callbackUrl = app('router')->has('api.payment.callback.school')
            ? route('api.payment.callback.school', ['provider' => 'equity', 'school' => $transaction->school_id])
            : route('api.payment.callback', ['provider' => 'equity']);

        $payload = [
            'merchant_code'  => $this->merchantCode,
            'amount'         => $transaction->amount / 100,
            'reference'      => $transaction->reference,
            'customer_phone' => $transaction->phone_number,
            'description'    => "School fees - {$transaction->school->name}",
            'callback_url'   => $callbackUrl,
        ];

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->post("{$this->baseUrl}/payments/v1/initiate", $payload);

            $data = $response->json();

            if ($response->successful() && ($data['status'] ?? '') === 'PENDING') {
                $transaction->update([
                    'status' => 'processing',
                    'provider_reference' => $data['transaction_reference'] ?? null,
                ]);

                return PaymentInitResult::success(
                    $transaction->id,
                    $data['transaction_reference'] ?? $transaction->reference,
                    $data['message'] ?? 'Payment initiated via Equity Bank',
                    $data['payment_url'] ?? null
                );
            }

            Log::error('Equity payment initiation failed', ['transaction_id' => $transaction->id, 'response' => $data]);
            return PaymentInitResult::failure($data['message'] ?? 'Failed to initiate Equity payment', $data['error_code'] ?? 'EQUITY_ERROR');
        } catch (\Exception $e) {
            Log::error('Equity payment exception', ['transaction_id' => $transaction->id, 'message' => $e->getMessage()]);
            return PaymentInitResult::failure('Error initiating Equity payment', 'EXCEPTION');
        }
    }

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

        if (!$this->validateConfiguration()) {
            return PaymentStatusResult::processing($transaction->id, 'Equity Bank not configured');
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return PaymentStatusResult::processing($transaction->id, 'Unable to check status');
        }

        try {
            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/payments/v1/status/{$transaction->provider_reference}");

            $data = $response->json();

            if ($response->successful()) {
                $status = $data['status'] ?? 'UNKNOWN';
                return match($status) {
                    'COMPLETED', 'SUCCESS' => $this->markAsCompleted($transaction, $data),
                    'FAILED', 'CANCELLED' => PaymentStatusResult::failed($transaction->id, $data['message'] ?? 'Payment failed'),
                    default => PaymentStatusResult::processing($transaction->id, 'Processing payment'),
                };
            }

            return PaymentStatusResult::processing($transaction->id, 'Checking status...');
        } catch (\Exception $e) {
            Log::error('Equity status check exception', ['reference' => $reference, 'message' => $e->getMessage()]);
            return PaymentStatusResult::processing($transaction->id, 'Unable to check status');
        }
    }

    public function handleCallback(Request $request): void
    {
        $payload = $request->all();
        Log::info('Equity callback received', $payload);

        $transactionRef = $payload['transaction_reference'] ?? $payload['reference'] ?? null;
        $status = $payload['status'] ?? 'UNKNOWN';

        if (!$transactionRef) {
            Log::error('Equity callback missing transaction reference', $payload);
            return;
        }

        $transaction = PaymentTransaction::where('provider_reference', $transactionRef)
            ->orWhere('reference', $transactionRef)->first();

        if (!$transaction) {
            Log::error('Transaction not found for Equity callback', ['reference' => $transactionRef]);
            return;
        }

        if (in_array($status, ['COMPLETED', 'SUCCESS'])) {
            $this->markAsCompleted($transaction, $payload);
        } else {
            $transaction->update(['status' => 'failed']);
            Log::info('Equity payment failed', ['transaction_id' => $transaction->id]);
        }
    }

    public function reversePayment(string $reference, string $reason = ''): bool
    {
        if (!$this->validateConfiguration()) {
            return false;
        }

        $transaction = PaymentTransaction::where('provider_reference', $reference)->first();
        if (!$transaction) {
            return false;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return false;
        }

        try {
            $response = Http::withToken($token)->post("{$this->baseUrl}/payments/v1/reverse", [
                'transaction_reference' => $transaction->provider_reference,
                'reason' => $reason ?: 'Payment reversal requested',
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Equity reversal failed', ['reference' => $reference, 'error' => $e->getMessage()]);
            return false;
        }
    }

    public function getProviderName(): string
    {
        return 'equity';
    }

    public function validateConfiguration(): bool
    {
        return !empty($this->apiKey) && !empty($this->merchantCode);
    }

    private function getAccessToken(): ?string
    {
        return Cache::remember('equity_access_token', 3500, function () {
            try {
                $response = Http::asForm()->post("{$this->baseUrl}/identity/v2/token", [
                    'api_key' => $this->apiKey,
                    'merchant_code' => $this->merchantCode,
                ]);

                if ($response->successful()) {
                    return $response->json()['access_token'] ?? null;
                }

                Log::error('Equity OAuth failed', ['response' => $response->json()]);
                return null;
            } catch (\Exception $e) {
                Log::error('Equity OAuth exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    private function markAsCompleted(PaymentTransaction $transaction, array $data): PaymentStatusResult
    {
        $transaction->update([
            'status' => 'completed',
            'completed_at' => now(),
            'provider_reference' => $data['transaction_reference'] ?? $transaction->provider_reference,
        ]);

        $receiptNumber = 'RCT-' . date('Y') . '-' . str_pad($transaction->school_id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);

        Receipt::firstOrCreate(
            ['payment_transaction_id' => $transaction->id],
            [
                'school_id' => $transaction->school_id,
                'receipt_number' => $receiptNumber,
                'student_id' => $transaction->student_id,
                'amount' => $transaction->amount,
                'payment_method' => 'equity',
                'payment_reference' => $transaction->provider_reference,
                'issued_at' => now(),
            ]
        );

        Log::info('Equity payment completed', ['transaction_id' => $transaction->id]);

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
