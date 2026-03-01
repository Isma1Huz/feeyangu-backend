<?php

namespace App\Services\Payment;

use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Invoice Allocation Service
 *
 * Allocates a completed PaymentTransaction across the student's open invoices,
 * oldest due-date first (FIFO). Supports both partial and full payments.
 *
 * For each completed transaction this service:
 *  1. Finds all open invoices (status: sent, partial, overdue) for the student,
 *     ordered by due_date ASC.
 *  2. Applies the payment amount to each invoice in turn until the amount is
 *     exhausted or all invoices are settled.
 *  3. Creates an InvoicePayment record for every allocation.
 *  4. Updates invoice.paid_amount, invoice.balance, and invoice.status.
 */
class InvoiceAllocationService
{
    /**
     * Allocate a completed transaction to the student's open invoices.
     *
     * Safe to call multiple times for the same transaction (idempotent):
     * existing InvoicePayment rows are skipped to avoid double-allocation.
     */
    public function allocate(PaymentTransaction $transaction): void
    {
        if ($transaction->status !== 'completed') {
            return;
        }

        DB::transaction(function () use ($transaction) {
            // Determine remaining unallocated amount for this transaction.
            $alreadyAllocated = InvoicePayment::where('payment_transaction_id', $transaction->id)
                ->sum('amount_applied');

            $remaining = $transaction->amount - $alreadyAllocated;

            if ($remaining <= 0) {
                return; // Fully allocated already
            }

            // Fetch open invoices for this student in this school, oldest first.
            $invoices = Invoice::where('student_id', $transaction->student_id)
                ->where('school_id', $transaction->school_id)
                ->whereIn('status', ['sent', 'partial', 'overdue'])
                ->where('balance', '>', 0)
                ->orderBy('due_date')
                ->lockForUpdate()
                ->get();

            foreach ($invoices as $invoice) {
                if ($remaining <= 0) {
                    break;
                }

                $apply = min($remaining, $invoice->balance);

                InvoicePayment::create([
                    'invoice_id'             => $invoice->id,
                    'payment_transaction_id' => $transaction->id,
                    'amount_applied'         => $apply,
                ]);

                $newPaidAmount = $invoice->paid_amount + $apply;
                $newBalance    = $invoice->total_amount - $newPaidAmount;
                $newStatus     = $newBalance <= 0 ? 'paid' : 'partial';

                $invoice->update([
                    'paid_amount' => $newPaidAmount,
                    'balance'     => max(0, $newBalance),
                    'status'      => $newStatus,
                ]);

                $remaining -= $apply;
            }

            Log::info('Invoice allocation completed', [
                'transaction_id' => $transaction->id,
                'student_id'     => $transaction->student_id,
                'amount'         => $transaction->amount,
            ]);
        });
    }
}
