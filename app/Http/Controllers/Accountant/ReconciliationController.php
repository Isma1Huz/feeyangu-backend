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

        // Get unmatched system payments
        $unmatchedSystemPayments = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereDoesntHave('reconciliationItem')
            ->with('student')
            ->latest()
            ->take(50)
            ->get()
            ->map(fn($payment) => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'student_name' => $payment->student->full_name,
                'amount' => $payment->amount / 100,
                'provider' => $payment->provider,
                'completed_at' => $payment->completed_at?->format('M d, Y H:i'),
            ]);

        // Get unmatched bank transactions
        $unmatchedBankTransactions = BankTransaction::where('school_id', $school->id)
            ->whereDoesntHave('reconciliationItem')
            ->latest('date')
            ->take(50)
            ->get()
            ->map(fn($bank) => [
                'id' => $bank->id,
                'reference' => $bank->reference,
                'description' => $bank->description,
                'amount' => $bank->amount / 100,
                'balance' => $bank->balance / 100,
                'date' => $bank->date->format('M d, Y'),
            ]);

        // Get matched items
        $matchedItems = ReconciliationItem::where('school_id', $school->id)
            ->where('status', 'matched')
            ->with(['bankTransaction', 'systemPayment'])
            ->latest('matched_at')
            ->paginate(20)
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'bank_reference' => $item->bankTransaction->reference ?? 'N/A',
                    'system_reference' => $item->systemPayment->reference ?? 'N/A',
                    'amount' => $item->bankTransaction->amount ?? $item->systemPayment->amount ?? 0,
                    'confidence' => $item->confidence,
                    'matched_at' => $item->matched_at?->format('M d, Y H:i'),
                    'matched_by' => $item->matched_by,
                ];
            });

        // Summary stats
        $summary = [
            'unmatched_system' => PaymentTransaction::where('school_id', $school->id)
                ->where('status', 'completed')
                ->whereDoesntHave('reconciliationItem')
                ->count(),
            'unmatched_bank' => BankTransaction::where('school_id', $school->id)
                ->whereDoesntHave('reconciliationItem')
                ->count(),
            'matched' => ReconciliationItem::where('school_id', $school->id)
                ->where('status', 'matched')
                ->count(),
            'suggested' => ReconciliationItem::where('school_id', $school->id)
                ->where('status', 'suggested')
                ->count(),
        ];

        return Inertia::render('accountant/Reconciliation', [
            'unmatchedSystemPayments' => $unmatchedSystemPayments,
            'unmatchedBankTransactions' => $unmatchedBankTransactions,
            'matchedItems' => $matchedItems,
            'summary' => $summary,
        ]);
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
