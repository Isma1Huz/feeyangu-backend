<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\SchoolApiCredential;
use App\Models\StudentPaymentAccount;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use App\Services\Payment\InvoiceAllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * M-Pesa Payment Provider
 *
 * Implements Safaricom Daraja API for M-Pesa payments.
 * Supports:
 *   - STK Push (Lipa Na M-Pesa Online)
 *   - C2B PayBill confirmation callbacks
 *
 * Credentials are loaded per-school from SchoolApiCredential, with a
 * fallback to global config() values for backwards compatibility.
 */
class MpesaPaymentProvider implements PaymentProviderInterface
{
    private ?string $consumerKey = null;
    private ?string $consumerSecret = null;
    private ?string $passkey = null;
    private ?string $shortcode = null;
    private string $environment = 'sandbox';
    private string $baseUrl = 'https://sandbox.safaricom.co.ke';

    public function __construct()
    {
        // Credentials are loaded lazily via loadCredentialsForSchool().
    }

    // -------------------------------------------------------------------------
    // Credential loading
    // -------------------------------------------------------------------------

    /**
     * Load per-school M-Pesa credentials from SchoolApiCredential.
     * Falls back to global config values if no DB entry exists.
     */
    private function loadCredentialsForSchool(int $schoolId): void
    {
        $cred = SchoolApiCredential::where('school_id', $schoolId)
            ->where('provider', 'mpesa')
            ->where('enabled', true)
            ->first();

        if ($cred) {
            $this->environment    = $cred->environment;
            $this->consumerKey    = $cred->credentials['consumer_key']    ?? null;
            $this->consumerSecret = $cred->credentials['consumer_secret'] ?? null;
            $this->passkey        = $cred->credentials['passkey']         ?? null;
            $this->shortcode      = $cred->credentials['shortcode']       ?? null;
        } else {
            // Fallback to global config for schools that haven't configured DB credentials
            $this->environment    = config('services.mpesa.environment', 'sandbox');
            $this->consumerKey    = config('services.mpesa.consumer_key');
            $this->consumerSecret = config('services.mpesa.consumer_secret');
            $this->passkey        = config('services.mpesa.passkey');
            $this->shortcode      = config('services.mpesa.shortcode');
        }

        $this->baseUrl = $this->environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    // -------------------------------------------------------------------------
    // OAuth / helpers
    // -------------------------------------------------------------------------

    /**
     * Get OAuth access token from Daraja API.
     * Cached per school+environment to minimise API calls.
     */
    private function getAccessToken(int $schoolId): ?string
    {
        $cacheKey = "mpesa_access_token_{$this->environment}_{$schoolId}";

        return Cache::remember($cacheKey, 3500, function () {
            try {
                $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                    ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

                if ($response->successful()) {
                    return $response->json('access_token');
                }

                Log::error('M-Pesa OAuth failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                return null;
            } catch (\Exception $e) {
                Log::error('M-Pesa OAuth exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    /**
     * Generate STK Push password and populate $timestamp by reference.
     */
    private function generatePassword(string &$timestamp): string
    {
        $timestamp = now()->format('YmdHis');
        return base64_encode($this->shortcode . $this->passkey . $timestamp);
    }

    /**
     * Normalise phone number to 254XXXXXXXXX format.
     */
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }
        return $phone;
    }

    /**
     * Build the callback URL for this school, including the school ID so that
     * webhooks can be routed without relying on subdomain routing.
     */
    private function callbackUrl(int $schoolId): string
    {
        if (app('router')->has('api.payment.callback.school')) {
            return route('api.payment.callback.school', [
                'provider' => 'mpesa',
                'school'   => $schoolId,
            ]);
        }

        return route('api.payment.callback', ['provider' => 'mpesa']);
    }

    // -------------------------------------------------------------------------
    // Interface implementation
    // -------------------------------------------------------------------------

    /**
     * Initiate an STK Push payment.
     */
    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        $this->loadCredentialsForSchool($transaction->school_id);

        if (!$this->validateConfiguration()) {
            return PaymentInitResult::failure('M-Pesa not configured for this school', 'NOT_CONFIGURED');
        }

        $token = $this->getAccessToken($transaction->school_id);

        if (!$token) {
            return PaymentInitResult::failure('Failed to obtain M-Pesa access token', 'AUTH_FAILED');
        }

        $timestamp = '';
        $password  = $this->generatePassword($timestamp);
        $phone     = $this->normalizePhone($transaction->phone_number ?? '');

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password'          => $password,
            'Timestamp'         => $timestamp,
            'TransactionType'   => 'CustomerPayBillOnline',
            'Amount'            => (int) ($transaction->amount / 100), // cents → KES
            'PartyA'            => $phone,
            'PartyB'            => $this->shortcode,
            'PhoneNumber'       => $phone,
            'CallBackURL'       => $this->callbackUrl($transaction->school_id),
            'AccountReference'  => $transaction->reference,
            'TransactionDesc'   => "School fees - {$transaction->reference}",
        ];

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

            $data = $response->json();

            if ($response->successful() && ($data['ResponseCode'] ?? '') === '0') {
                $checkoutRequestId = $data['CheckoutRequestID']  ?? null;
                $merchantRequestId = $data['MerchantRequestID']  ?? null;

                $transaction->update([
                    'status'             => 'processing',
                    'provider_reference' => $checkoutRequestId,
                    'metadata'           => array_merge($transaction->metadata ?? [], [
                        'CheckoutRequestID' => $checkoutRequestId,
                        'MerchantRequestID' => $merchantRequestId,
                        'stk_initiated_at'  => now()->toISOString(),
                    ]),
                ]);

                return PaymentInitResult::success(
                    (string) $transaction->id,
                    $checkoutRequestId,
                    $data['CustomerMessage'] ?? 'Payment request sent. Please complete on your phone.',
                    $checkoutRequestId
                );
            }

            Log::error('M-Pesa STK Push failed', [
                'transaction_id' => $transaction->id,
                'response'       => $data,
            ]);

            return PaymentInitResult::failure(
                $data['errorMessage'] ?? $data['CustomerMessage'] ?? 'Failed to initiate payment',
                $data['ResponseCode'] ?? $data['errorCode'] ?? 'UNKNOWN'
            );
        } catch (\Exception $e) {
            Log::error('M-Pesa STK Push exception', [
                'transaction_id' => $transaction->id,
                'message'        => $e->getMessage(),
            ]);

            return PaymentInitResult::failure('An error occurred while initiating payment', 'EXCEPTION');
        }
    }

    /**
     * Check payment status via Daraja STK Push Query API.
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
                (string) $transaction->id,
                $transaction->provider_reference,
                $transaction->amount / 100,
                $transaction->completed_at ?? now(),
                'Payment completed'
            );
        }

        $this->loadCredentialsForSchool($transaction->school_id);
        $token = $this->getAccessToken($transaction->school_id);

        if (!$token) {
            return PaymentStatusResult::processing((string) $transaction->id, 'Unable to check status at this time');
        }

        $timestamp = '';
        $password  = $this->generatePassword($timestamp);

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password'          => $password,
            'Timestamp'         => $timestamp,
            'CheckoutRequestID' => $transaction->provider_reference,
        ];

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/mpesa/stkpushquery/v1/query", $payload);

            $data = $response->json();

            if ($response->successful() && isset($data['ResultCode'])) {
                if ($data['ResultCode'] === '0') {
                    $this->completeTransaction($transaction, []);
                    return PaymentStatusResult::completed(
                        (string) $transaction->id,
                        $transaction->provider_reference,
                        $transaction->amount / 100,
                        now(),
                        'Payment completed successfully'
                    );
                }

                if ($data['ResultCode'] === '1032') {
                    $transaction->update(['status' => 'failed']);
                    return PaymentStatusResult::failed((string) $transaction->id, 'Payment cancelled by user', $data['ResultCode']);
                }

                $transaction->update(['status' => 'failed']);
                return PaymentStatusResult::failed(
                    (string) $transaction->id,
                    $data['ResultDesc'] ?? 'Payment failed',
                    $data['ResultCode']
                );
            }

            return PaymentStatusResult::processing((string) $transaction->id, 'Payment is being processed');
        } catch (\Exception $e) {
            Log::error('M-Pesa status check exception', ['reference' => $reference, 'message' => $e->getMessage()]);
            return PaymentStatusResult::processing((string) $transaction->id, 'Unable to check status');
        }
    }

    /**
     * Handle incoming M-Pesa callback.
     *
     * Supports both STK Push callbacks and C2B PayBill confirmation callbacks.
     */
    public function handleCallback(Request $request): void
    {
        $payload = $request->all();

        if (isset($payload['Body']['stkCallback'])) {
            $this->handleStkCallback($payload);
        } elseif (isset($payload['TransID'])) {
            $this->handleC2BCallback($payload);
        } else {
            Log::warning('M-Pesa callback: unrecognised payload structure', $payload);
        }
    }

    // -------------------------------------------------------------------------
    // STK Push callback
    // -------------------------------------------------------------------------

    private function handleStkCallback(array $payload): void
    {
        $resultCode        = $payload['Body']['stkCallback']['ResultCode']        ?? null;
        $resultDesc        = $payload['Body']['stkCallback']['ResultDesc']        ?? '';
        $checkoutRequestId = $payload['Body']['stkCallback']['CheckoutRequestID'] ?? null;

        if (!$checkoutRequestId) {
            Log::error('M-Pesa STK callback missing CheckoutRequestID', $payload);
            return;
        }

        $transaction = PaymentTransaction::where('provider_reference', $checkoutRequestId)->first();

        if (!$transaction) {
            Log::error('M-Pesa STK callback: transaction not found', [
                'checkoutRequestId' => $checkoutRequestId,
            ]);
            return;
        }

        if ($resultCode === 0) {
            $items = $payload['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];
            $meta  = $this->parseCallbackMetadata($items);
            $this->completeTransaction($transaction, $meta);
        } else {
            $transaction->update(['status' => 'failed']);
            Log::info('M-Pesa STK payment failed', [
                'transaction_id' => $transaction->id,
                'result_code'    => $resultCode,
                'result_desc'    => $resultDesc,
            ]);
        }
    }

    /**
     * Parse the key/value Item array from the STK Push CallbackMetadata.
     */
    private function parseCallbackMetadata(array $items): array
    {
        $meta = [];
        foreach ($items as $item) {
            if (isset($item['Name'], $item['Value'])) {
                $meta[$item['Name']] = $item['Value'];
            }
        }
        return $meta;
    }

    // -------------------------------------------------------------------------
    // C2B PayBill confirmation callback
    // -------------------------------------------------------------------------

    /**
     * Handle Daraja C2B PayBill confirmation callback.
     *
     * Each C2B confirmation creates a NEW completed PaymentTransaction so that
     * partial payments (multiple PayBill payments for the same student/reference)
     * are all recorded individually.
     *
     * Idempotency is enforced via the unique(provider, provider_reference) DB
     * constraint: if the same TransID arrives twice it will silently be ignored.
     *
     * The BillRefNumber must match a StudentPaymentAccount.reference so we can
     * resolve the school_id and student_id without relying on subdomain routing.
     */
    private function handleC2BCallback(array $payload): void
    {
        $billRefNumber = $payload['BillRefNumber'] ?? null;
        $transId       = $payload['TransID']       ?? null;
        $rawAmount     = $payload['TransAmount']   ?? null;

        if (!$billRefNumber || !$transId) {
            Log::error('M-Pesa C2B callback missing required fields', $payload);
            return;
        }

        // Idempotency check: has this TransID already been processed?
        if (PaymentTransaction::where('provider', 'mpesa')
            ->where('provider_reference', $transId)
            ->exists()
        ) {
            Log::info('M-Pesa C2B callback already processed (idempotent)', [
                'TransID' => $transId,
            ]);
            return;
        }

        // Resolve student via stable payment account reference.
        $account = StudentPaymentAccount::where('reference', $billRefNumber)->first();

        if (!$account) {
            Log::error('M-Pesa C2B callback: no StudentPaymentAccount matches BillRefNumber', [
                'BillRefNumber' => $billRefNumber,
            ]);
            return;
        }

        // Convert amount to cents (TransAmount is a decimal string like "5000.00").
        $amountInCents = (int) round((float) $rawAmount * 100);

        if ($amountInCents <= 0) {
            Log::error('M-Pesa C2B callback: invalid amount', ['TransAmount' => $rawAmount]);
            return;
        }

        DB::transaction(function () use ($account, $billRefNumber, $transId, $amountInCents, $payload) {
            // Create a new completed PaymentTransaction for this specific payment.
            $tx = PaymentTransaction::create([
                'school_id'          => $account->school_id,
                'student_id'         => $account->student_id,
                'parent_id'          => null,
                'amount'             => $amountInCents,
                'provider'           => 'mpesa',
                'status'             => 'completed',
                'reference'          => $billRefNumber,
                'phone_number'       => $payload['MSISDN'] ?? null,
                'provider_reference' => $transId,
                'completed_at'       => now(),
                'metadata'           => [
                    'MpesaReceiptNumber' => $transId,
                    'TransAmount'        => $payload['TransAmount'] ?? null,
                    'MSISDN'             => $payload['MSISDN']      ?? null,
                    'TransactionType'    => $payload['TransactionType'] ?? 'Pay Bill',
                    'completed_at'       => now()->toISOString(),
                ],
            ]);

            $receiptNumber = 'RCT-' . date('Y') . '-'
                . str_pad($tx->school_id, 3, '0', STR_PAD_LEFT) . '-'
                . str_pad($tx->id, 6, '0', STR_PAD_LEFT);

            Receipt::create([
                'school_id'         => $tx->school_id,
                'payment_transaction_id' => $tx->id,
                'receipt_number'    => $receiptNumber,
                'student_id'        => $tx->student_id,
                'amount'            => $tx->amount,
                'payment_method'    => 'M-Pesa',
                'payment_reference' => $transId,
                'issued_at'         => now(),
            ]);

            // Allocate to open invoices.
            app(InvoiceAllocationService::class)->allocate($tx);

            Log::info('M-Pesa C2B payment recorded', [
                'transaction_id' => $tx->id,
                'TransID'        => $transId,
                'amount_kes'     => $amountInCents / 100,
            ]);
        });
    }

    // -------------------------------------------------------------------------
    // Shared completion logic
    // -------------------------------------------------------------------------

    /**
     * Mark a transaction as completed and create a receipt (idempotent).
     *
     * Uses a DB transaction + Receipt.firstOrCreate to ensure exactly-once receipt
     * creation even if the callback arrives multiple times.
     */
    private function completeTransaction(PaymentTransaction $transaction, array $callbackMeta): void
    {
        DB::transaction(function () use ($transaction, $callbackMeta) {
            // Reload with a lock to prevent concurrent duplicate processing
            $tx = PaymentTransaction::lockForUpdate()->find($transaction->id);

            if (!$tx || $tx->status === 'completed') {
                return; // Already completed – idempotent guard
            }

            $mergedMeta = array_merge($tx->metadata ?? [], $callbackMeta, [
                'completed_at' => now()->toISOString(),
            ]);

            $mpesaReceipt = $callbackMeta['MpesaReceiptNumber'] ?? null;

            $tx->update([
                'status'             => 'completed',
                'completed_at'       => now(),
                'provider_reference' => $mpesaReceipt ?? $tx->provider_reference,
                'metadata'           => $mergedMeta,
            ]);

            $receiptNumber = 'RCT-' . date('Y') . '-'
                . str_pad($tx->school_id, 3, '0', STR_PAD_LEFT) . '-'
                . str_pad($tx->id, 6, '0', STR_PAD_LEFT);

            Receipt::firstOrCreate(
                ['payment_transaction_id' => $tx->id],
                [
                    'school_id'        => $tx->school_id,
                    'receipt_number'   => $receiptNumber,
                    'student_id'       => $tx->student_id,
                    'amount'           => $tx->amount,
                    'payment_method'   => 'M-Pesa',
                    'payment_reference' => $mpesaReceipt ?? $tx->provider_reference,
                    'issued_at'        => now(),
                ]
            );

            // Allocate payment to open invoices.
            app(InvoiceAllocationService::class)->allocate($tx);

            Log::info('M-Pesa payment completed', [
                'transaction_id' => $tx->id,
                'receipt_number' => $receiptNumber,
                'mpesa_receipt'  => $mpesaReceipt,
            ]);
        });
    }

    /**
     * Reverse a payment (not yet implemented for M-Pesa Daraja).
     */
    public function reversePayment(string $reference, string $reason = ''): bool
    {
        Log::warning('M-Pesa reversal requested but not implemented', [
            'reference' => $reference,
            'reason'    => $reason,
        ]);

        return false;
    }

    public function getProviderName(): string
    {
        return 'mpesa';
    }

    public function validateConfiguration(): bool
    {
        return !empty($this->consumerKey)
            && !empty($this->consumerSecret)
            && !empty($this->passkey)
            && !empty($this->shortcode);
    }
}
