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

    /**
     * Confirm a suggested reconciliation match (change status to 'matched').
     */
    public function confirm(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'item_id' => 'required|string',
        ]);

        $item = ReconciliationItem::where('school_id', $school->id)
            ->findOrFail($validated['item_id']);

        $item->update([
            'status' => 'matched',
            'matched_by' => 'manual',
            'matched_at' => now(),
        ]);

        return redirect()->route('accountant.reconciliation.index')
            ->with('success', 'Match confirmed.');
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

    /**
     * Unmatch / reject a suggested or matched reconciliation item.
     */
    public function unmatch(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'item_id' => 'required|string',
        ]);

        // item_id could be the ReconciliationItem id
        $item = ReconciliationItem::where('school_id', $school->id)
            ->find($validated['item_id']);

        if ($item) {
            $item->delete();
        }

        return redirect()->route('accountant.reconciliation.index')
            ->with('success', 'Match removed.');
    }

    /**
     * Auto-match all high-confidence suggested items.
     */
    public function autoMatch(): RedirectResponse
    {
        $school = auth()->user()->school;

        $matched = ReconciliationItem::where('school_id', $school->id)
            ->where('status', 'suggested')
            ->where('confidence', 'high')
            ->update([
                'status' => 'matched',
                'matched_by' => 'auto',
                'matched_at' => now(),
            ]);

        return redirect()->route('accountant.reconciliation.index')
            ->with('success', "{$matched} items auto-matched.");
    }

    /**
     * Import a bank statement file.
     */
    public function importStatement(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'bank' => 'required|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $file = $request->file('file');
        $lines = array_filter(array_map('trim', explode("\n", file_get_contents($file->getPathname()))));
        $imported = 0;

        // Skip header row
        $rows = array_values(array_slice(array_values($lines), 1));

        foreach ($rows as $line) {
            $cols = str_getcsv($line);
            if (count($cols) < 3) continue;

            [$date, $description, $amount] = $cols;
            $reference = $cols[3] ?? 'IMPORT-' . uniqid();

            $bankTxn = BankTransaction::create([
                'school_id' => $school->id,
                'reference' => $reference,
                'description' => $description,
                'amount' => (int) round(abs((float) str_replace(',', '', $amount)) * 100),
                'date' => $date,
                'bank' => $request->bank,
                'type' => 'credit',
            ]);

            $imported++;
        }

        return redirect()->route('accountant.reconciliation.index')
            ->with('success', "{$imported} transactions imported from {$request->bank}.");
    }
}
