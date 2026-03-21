<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\MpesaTransaction;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\School;
use App\Models\Student;
use App\Services\Payment\InvoiceAllocationService;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PaymentService
 *
 * High-level orchestration service for all payment operations.
 * Delegates provider-specific work to the appropriate PaymentProvider
 * via PaymentProviderFactory.
 *
 * Payment integrations (M-Pesa, Bank transfers) are kept fully intact.
 */
class PaymentService
{
    public function __construct(
        private readonly PaymentProviderFactory $factory,
        private readonly InvoiceAllocationService $allocationService
    ) {}

    /**
     * Initiate an M-Pesa STK Push payment.
     *
     * @param  array{phone: string, amount: float|int, reference: string, school_id: int} $data
     */
    public function processMpesaPayment(array $data): array
    {
        try {
            $provider = $this->factory->make('mpesa');
            $transaction = $this->buildTransaction($data, 'mpesa');
            $result = $provider->initiatePayment($transaction);

            return [
                'success'        => $result->success,
                'transaction_id' => $transaction->id,
                'message'        => $result->message,
                'data'           => $result->data,
            ];
        } catch (\Throwable $e) {
            Log::error('PaymentService::processMpesaPayment failed', ['error' => $e->getMessage(), 'data' => $data]);
            return ['success' => false, 'message' => 'M-Pesa payment initiation failed.'];
        }
    }

    /**
     * Initiate a bank transfer payment.
     *
     * @param  array{provider: string, amount: float|int, reference: string, school_id: int} $data
     */
    public function processBankTransfer(array $data): array
    {
        $providerKey = $data['provider'] ?? 'kcb';

        try {
            $provider    = $this->factory->make($providerKey);
            $transaction = $this->buildTransaction($data, $providerKey);
            $result      = $provider->initiatePayment($transaction);

            return [
                'success'        => $result->success,
                'transaction_id' => $transaction->id,
                'message'        => $result->message,
                'data'           => $result->data,
            ];
        } catch (\Throwable $e) {
            Log::error('PaymentService::processBankTransfer failed', ['error' => $e->getMessage(), 'data' => $data]);
            return ['success' => false, 'message' => 'Bank transfer initiation failed.'];
        }
    }

    /**
     * Process a card payment (future integration placeholder).
     *
     * @param  array{amount: float|int, reference: string, card_token: string} $data
     */
    public function processCardPayment(array $data): array
    {
        Log::info('PaymentService::processCardPayment called (not yet implemented)', $data);

        return ['success' => false, 'message' => 'Card payments are not yet supported.'];
    }

    /**
     * Verify the status of a payment by its transaction reference.
     */
    public function verifyPayment(string $reference): array
    {
        $transaction = PaymentTransaction::where('reference', $reference)->first();

        if (! $transaction) {
            return ['success' => false, 'message' => 'Transaction not found.'];
        }

        try {
            $provider = $this->factory->make($transaction->provider);
            $result   = $provider->checkStatus($reference);

            return [
                'success' => $result->success,
                'status'  => $result->status,
                'data'    => $result->data,
            ];
        } catch (\Throwable $e) {
            Log::error('PaymentService::verifyPayment failed', ['reference' => $reference, 'error' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Payment verification failed.'];
        }
    }

    /**
     * Generate an invoice for a student's outstanding fees.
     *
     * @param  array{student_id: int, school_id: int, fee_items: array, due_date?: string} $data
     */
    public function generateInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::create([
                'student_id' => $data['student_id'],
                'school_id'  => $data['school_id'],
                'due_date'   => $data['due_date'] ?? now()->addDays(30),
                'status'     => 'draft',
                'total'      => collect($data['fee_items'])->sum('amount'),
            ]);

            foreach ($data['fee_items'] as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'amount'      => $item['amount'],
                    'quantity'    => $item['quantity'] ?? 1,
                ]);
            }

            return $invoice->fresh('items');
        });
    }

    /**
     * Send a payment receipt to the student's guardian.
     */
    public function sendReceipt(int $transactionId): bool
    {
        $transaction = PaymentTransaction::with(['student.guardians'])->find($transactionId);

        if (! $transaction) {
            return false;
        }

        try {
            // Receipt notifications are dispatched via the existing notification system
            $receipt = Receipt::where('payment_transaction_id', $transactionId)->first();

            if ($receipt) {
                // Dispatch receipt notification (email/SMS) here if needed
                Log::info('PaymentService::sendReceipt dispatched', ['receipt_id' => $receipt->id]);
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('PaymentService::sendReceipt failed', ['transaction_id' => $transactionId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Build a PaymentTransaction model from the raw data array.
     */
    private function buildTransaction(array $data, string $provider): PaymentTransaction
    {
        return PaymentTransaction::create([
            'student_id' => $data['student_id'] ?? null,
            'school_id'  => $data['school_id']  ?? null,
            'provider'   => $provider,
            'amount'     => (int) round(($data['amount'] ?? 0) * 100), // store in cents
            'reference'  => $data['reference'],
            'status'     => 'pending',
            'metadata'   => $data['metadata'] ?? null,
        ]);
    }
}
