<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\ReconciliationItem;
use App\Models\BankTransaction;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ReconciliationController extends Controller
{
    /**
     * Display the reconciliation dashboard.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;

        // Build reconciliation items array matching frontend ReconciliationItem type
        $reconciliationItems = [];

        // Get matched items
        $matchedItems = ReconciliationItem::where('school_id', $school->id)
            ->where('status', 'matched')
            ->with(['bankTransaction', 'systemPayment.student'])
            ->latest('matched_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (string) $item->id,
                    'status' => 'matched',
                    'bankTransaction' => $item->bankTransaction ? [
                        'reference' => $item->bankTransaction->reference,
                        'description' => $item->bankTransaction->description,
                        'amount' => $item->bankTransaction->amount / 100,
                        'date' => $item->bankTransaction->date->format('M d, Y'),
                    ] : null,
                    'systemPaymentRef' => $item->systemPayment?->reference ?? null,
                    'systemAmount' => $item->systemPayment ? $item->systemPayment->amount / 100 : null,
                    'systemStudentName' => $item->systemPayment?->student?->full_name ?? null,
                    'confidence' => $item->confidence ?? 'high',
                    'matchedAt' => $item->matched_at?->format('M d, Y H:i'),
                    'matchedBy' => $item->matched_by,
                ];
            });

        // Get suggested matches
        $suggestedItems = ReconciliationItem::where('school_id', $school->id)
            ->where('status', 'suggested')
            ->with(['bankTransaction', 'systemPayment.student'])
            ->latest('created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (string) $item->id,
                    'status' => 'suggested',
                    'bankTransaction' => $item->bankTransaction ? [
                        'reference' => $item->bankTransaction->reference,
                        'description' => $item->bankTransaction->description,
                        'amount' => $item->bankTransaction->amount / 100,
                        'date' => $item->bankTransaction->date->format('M d, Y'),
                    ] : null,
                    'systemPaymentRef' => $item->systemPayment?->reference ?? null,
                    'systemAmount' => $item->systemPayment ? $item->systemPayment->amount / 100 : null,
                    'systemStudentName' => $item->systemPayment?->student?->full_name ?? null,
                    'confidence' => $item->confidence ?? 'medium',
                ];
            });

        // Get unmatched system payments
        $unmatchedSystemItems = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereDoesntHave('reconciliationItem')
            ->with('student')
            ->latest()
            ->take(50)
            ->get()
            ->map(fn($payment) => [
                'id' => 'system-' . $payment->id,
                'status' => 'unmatched_system',
                'systemPaymentId' => (string) $payment->id,
                'systemPaymentRef' => $payment->reference,
                'systemAmount' => $payment->amount / 100,
                'systemStudentName' => $payment->student->full_name,
            ]);

        // Get unmatched bank transactions
        $unmatchedBankItems = BankTransaction::where('school_id', $school->id)
            ->whereDoesntHave('reconciliationItem')
            ->latest('date')
            ->take(50)
            ->get()
            ->map(fn($bank) => [
                'id' => 'bank-' . $bank->id,
                'status' => 'unmatched_bank',
                'bankTransaction' => [
                    'reference' => $bank->reference,
                    'description' => $bank->description,
                    'amount' => $bank->amount / 100,
                    'date' => $bank->date->format('M d, Y'),
                ],
            ]);

        // Combine all items
        $reconciliationItems = array_merge(
            $matchedItems->toArray(),
            $suggestedItems->toArray(),
            $unmatchedSystemItems->toArray(),
            $unmatchedBankItems->toArray()
        );

        // Get system payments for manual matching modal
        $systemPayments = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->with('student')
            ->latest()
            ->take(100)
            ->get()
            ->map(fn($payment) => [
                'id' => (string) $payment->id,
                'reference' => $payment->reference,
                'studentName' => $payment->student->full_name,
                'amount' => $payment->amount / 100,
                'method' => $payment->provider,
                'date' => $payment->completed_at?->format('M d, Y'),
                'status' => 'completed',
            ]);

        return Inertia::render('accountant/Reconciliation', [
            'reconciliationItems' => $reconciliationItems,
            'systemPayments' => $systemPayments,
        ]);
    }
    }

    /**
     * Match a bank transaction with a system payment.
     */
    public function match(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'bank_transaction_id' => 'required|exists:bank_transactions,id',
            'system_payment_id' => 'required|exists:payment_transactions,id',
            'confidence' => 'required|in:high,medium,low',
        ]);

        // Verify both belong to this school
        $bankTransaction = BankTransaction::where('school_id', $school->id)
            ->findOrFail($validated['bank_transaction_id']);
        
        $systemPayment = PaymentTransaction::where('school_id', $school->id)
            ->findOrFail($validated['system_payment_id']);

        // Create reconciliation item
        ReconciliationItem::create([
            'school_id' => $school->id,
            'bank_transaction_id' => $validated['bank_transaction_id'],
            'system_payment_id' => $validated['system_payment_id'],
            'status' => 'matched',
            'confidence' => $validated['confidence'],
            'matched_at' => now(),
            'matched_by' => auth()->id(),
        ]);

        return redirect()->route('accountant.reconciliation.index')
            ->with('success', 'Transaction matched successfully.');
    }
}
