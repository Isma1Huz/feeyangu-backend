<?php

namespace App\Services;

use App\Models\MpesaTransaction;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentProviderFactory;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Support\Facades\Log;

/**
 * MpesaService
 *
 * Facade service for all M-Pesa operations.
 * Delegates to MpesaPaymentProvider via PaymentProviderFactory.
 *
 * This service is kept intact as part of the payment integration layer.
 */
class MpesaService
{
    public function __construct(
        private readonly PaymentProviderFactory $factory
    ) {}

    /**
     * Initiate an STK Push request to the customer's phone.
     *
     * @param  array{phone: string, amount: float|int, reference: string, school_id: int} $data
     */
    public function stkPush(array $data): array
    {
        try {
            $provider = $this->factory->make('mpesa');

            $transaction = PaymentTransaction::create([
                'student_id' => $data['student_id'] ?? null,
                'school_id'  => $data['school_id']  ?? null,
                'provider'   => 'mpesa',
                'amount'     => (int) round(($data['amount'] ?? 0) * 100),
                'reference'  => $data['reference'],
                'status'     => 'pending',
                'metadata'   => ['phone' => $data['phone']],
            ]);

            $result = $provider->initiatePayment($transaction);

            return [
                'success'        => $result->success,
                'transaction_id' => $transaction->id,
                'message'        => $result->message,
                'data'           => $result->data,
            ];
        } catch (\Throwable $e) {
            Log::error('MpesaService::stkPush failed', ['error' => $e->getMessage(), 'data' => $data]);
            return ['success' => false, 'message' => 'STK Push failed. Please try again.'];
        }
    }

    /**
     * Handle the M-Pesa callback/webhook payload.
     *
     * @param  array $payload Raw callback payload from Safaricom Daraja API
     */
    public function handleCallback(array $payload): bool
    {
        try {
            $provider = $this->factory->make('mpesa');
            $provider->handleCallback(request());
            return true;
        } catch (\Throwable $e) {
            Log::error('MpesaService::handleCallback failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Query the status of an M-Pesa transaction.
     *
     * @param  string $reference The transaction reference or CheckoutRequestID
     */
    public function queryStatus(string $reference): array
    {
        try {
            $provider = $this->factory->make('mpesa');
            $result   = $provider->checkStatus($reference);

            return [
                'success' => $result->success,
                'status'  => $result->status,
                'data'    => $result->data,
            ];
        } catch (\Throwable $e) {
            Log::error('MpesaService::queryStatus failed', ['reference' => $reference, 'error' => $e->getMessage()]);
            return ['success' => false, 'status' => 'unknown', 'message' => 'Status query failed.'];
        }
    }

    /**
     * Reverse an M-Pesa transaction.
     *
     * @param  string $reference  The M-Pesa transaction ID or receipt number
     * @param  string $reason     Reason for reversal
     */
    public function reverseTransaction(string $reference, string $reason = 'Customer request'): bool
    {
        try {
            $provider = $this->factory->make('mpesa');
            return $provider->reversePayment($reference, $reason);
        } catch (\Throwable $e) {
            Log::error('MpesaService::reverseTransaction failed', ['reference' => $reference, 'error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get recent M-Pesa transactions.
     */
    public function getRecentTransactions(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return MpesaTransaction::latest()->limit($limit)->get();
    }
}
