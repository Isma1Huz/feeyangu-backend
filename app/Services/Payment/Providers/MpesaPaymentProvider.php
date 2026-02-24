<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * M-Pesa Payment Provider
 * 
 * Implements Safaricom Daraja API for M-Pesa payments.
 * Supports STK Push (Lipa Na M-Pesa Online) and C2B callbacks.
 */
class MpesaPaymentProvider implements PaymentProviderInterface
{
    private string $consumerKey;
    private string $consumerSecret;
    private string $passkey;
    private string $shortcode;
    private string $environment;
    private string $baseUrl;

    public function __construct()
    {
        $this->environment = config('services.mpesa.environment', 'sandbox');
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->shortcode = config('services.mpesa.shortcode');
        
        $this->baseUrl = $this->environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Get OAuth access token from Daraja API.
     */
    private function getAccessToken(): ?string
    {
        $cacheKey = 'mpesa_access_token_' . $this->environment;
        
        return Cache::remember($cacheKey, 3500, function () {
            try {
                $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                    ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

                if ($response->successful()) {
                    return $response->json('access_token');
                }

                Log::error('M-Pesa OAuth failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            } catch (\Exception $e) {
                Log::error('M-Pesa OAuth exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    /**
     * Generate password for STK Push request.
     */
    private function generatePassword(): string
    {
        $timestamp = now()->format('YmdHis');
        return base64_encode($this->shortcode . $this->passkey . $timestamp);
    }

    /**
     * Initiate STK Push payment.
     */
    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return PaymentInitResult::failure(
                'Failed to obtain M-Pesa access token',
                'AUTH_FAILED'
            );
        }

        $timestamp = now()->format('YmdHis');
        $password = $this->generatePassword();
        
        // Format phone number (remove + and ensure it starts with 254)
        $phoneNumber = $transaction->phone_number;
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (substr($phoneNumber, 0, 1) === '0') {
            $phoneNumber = '254' . substr($phoneNumber, 1);
        }

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int)($transaction->amount / 100), // Convert cents to KES
            'PartyA' => $phoneNumber,
            'PartyB' => $this->shortcode,
            'PhoneNumber' => $phoneNumber,
            'CallBackURL' => route('api.payment.callback.mpesa'),
            'AccountReference' => $transaction->reference,
            'TransactionDesc' => "Payment for {$transaction->student->full_name} - {$transaction->school->name}",
        ];

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

            $data = $response->json();

            if ($response->successful() && $data['ResponseCode'] === '0') {
                // Update transaction with checkout request ID
                $transaction->update([
                    'status' => 'processing',
                    'provider_reference' => $data['CheckoutRequestID'] ?? null,
                ]);

                return PaymentInitResult::success(
                    $transaction->id,
                    $data['CheckoutRequestID'],
                    $data['CustomerMessage'] ?? 'Payment request sent. Please complete on your phone.',
                    $data['CheckoutRequestID']
                );
            }

            Log::error('M-Pesa STK Push failed', [
                'transaction_id' => $transaction->id,
                'response' => $data,
            ]);

            return PaymentInitResult::failure(
                $data['errorMessage'] ?? $data['CustomerMessage'] ?? 'Failed to initiate payment',
                $data['ResponseCode'] ?? $data['errorCode'] ?? 'UNKNOWN'
            );
        } catch (\Exception $e) {
            Log::error('M-Pesa STK Push exception', [
                'transaction_id' => $transaction->id,
                'message' => $e->getMessage(),
            ]);

            return PaymentInitResult::failure(
                'An error occurred while initiating payment',
                'EXCEPTION'
            );
        }
    }

    /**
     * Check payment status.
     */
    public function checkStatus(string $reference): PaymentStatusResult
    {
        $transaction = PaymentTransaction::where('reference', $reference)
            ->orWhere('provider_reference', $reference)
            ->first();

        if (!$transaction) {
            return PaymentStatusResult::failed(
                $reference,
                'Transaction not found'
            );
        }

        // If already completed, return completed status
        if ($transaction->status === 'completed') {
            return PaymentStatusResult::completed(
                $transaction->id,
                $transaction->provider_reference,
                $transaction->amount / 100,
                $transaction->completed_at ?? now(),
                'Payment completed'
            );
        }

        // Otherwise, query Daraja API for status
        $token = $this->getAccessToken();
        
        if (!$token) {
            return PaymentStatusResult::processing(
                $transaction->id,
                'Unable to check status at this time'
            );
        }

        $timestamp = now()->format('YmdHis');
        $password = $this->generatePassword();

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'CheckoutRequestID' => $transaction->provider_reference,
        ];

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/mpesa/stkpushquery/v1/query", $payload);

            $data = $response->json();

            if ($response->successful() && isset($data['ResultCode'])) {
                if ($data['ResultCode'] === '0') {
                    // Payment successful
                    $this->markAsCompleted($transaction, $data);
                    
                    return PaymentStatusResult::completed(
                        $transaction->id,
                        $transaction->provider_reference,
                        $transaction->amount / 100,
                        now(),
                        'Payment completed successfully'
                    );
                } elseif ($data['ResultCode'] === '1032') {
                    // User cancelled
                    $transaction->update(['status' => 'failed']);
                    
                    return PaymentStatusResult::failed(
                        $transaction->id,
                        'Payment cancelled by user',
                        $data['ResultCode']
                    );
                } else {
                    // Other failure
                    $transaction->update(['status' => 'failed']);
                    
                    return PaymentStatusResult::failed(
                        $transaction->id,
                        $data['ResultDesc'] ?? 'Payment failed',
                        $data['ResultCode']
                    );
                }
            }

            return PaymentStatusResult::processing(
                $transaction->id,
                'Payment is being processed'
            );
        } catch (\Exception $e) {
            Log::error('M-Pesa status check exception', [
                'reference' => $reference,
                'message' => $e->getMessage(),
            ]);

            return PaymentStatusResult::processing(
                $transaction->id,
                'Unable to check status'
            );
        }
    }

    /**
     * Handle M-Pesa callback.
     */
    public function handleCallback(Request $request): void
    {
        $payload = $request->all();
        
        Log::info('M-Pesa callback received', $payload);

        // Extract callback data
        $resultCode = $payload['Body']['stkCallback']['ResultCode'] ?? null;
        $resultDesc = $payload['Body']['stkCallback']['ResultDesc'] ?? '';
        $checkoutRequestId = $payload['Body']['stkCallback']['CheckoutRequestID'] ?? null;

        if (!$checkoutRequestId) {
            Log::error('M-Pesa callback missing CheckoutRequestID', $payload);
            return;
        }

        $transaction = PaymentTransaction::where('provider_reference', $checkoutRequestId)->first();

        if (!$transaction) {
            Log::error('Transaction not found for M-Pesa callback', ['checkoutRequestId' => $checkoutRequestId]);
            return;
        }

        if ($resultCode === 0) {
            // Success
            $callbackMetadata = $payload['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];
            $this->markAsCompleted($transaction, ['CallbackMetadata' => $callbackMetadata]);
        } else {
            // Failed
            $transaction->update([
                'status' => 'failed',
            ]);
            
            Log::info('M-Pesa payment failed', [
                'transaction_id' => $transaction->id,
                'result_code' => $resultCode,
                'result_desc' => $resultDesc,
            ]);
        }
    }

    /**
     * Mark transaction as completed and generate receipt.
     */
    private function markAsCompleted(PaymentTransaction $transaction, array $metadata): void
    {
        $transaction->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Generate receipt
        $receiptNumber = 'RCT-' . date('Y') . '-' . str_pad($transaction->school_id, 3, '0', STR_PAD_LEFT) . '-' . uniqid();
        
        Receipt::create([
            'school_id' => $transaction->school_id,
            'payment_transaction_id' => $transaction->id,
            'receipt_number' => $receiptNumber,
            'student_id' => $transaction->student_id,
            'amount' => $transaction->amount,
            'payment_method' => 'M-Pesa',
            'payment_reference' => $transaction->provider_reference,
            'issued_at' => now(),
        ]);

        Log::info('M-Pesa payment completed', [
            'transaction_id' => $transaction->id,
            'receipt_number' => $receiptNumber,
        ]);
    }

    /**
     * Reverse a payment.
     */
    public function reversePayment(string $reference, string $reason = ''): bool
    {
        // M-Pesa reversal API implementation
        // This would require additional Daraja API calls
        Log::warning('M-Pesa reversal requested but not implemented', [
            'reference' => $reference,
            'reason' => $reason,
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
