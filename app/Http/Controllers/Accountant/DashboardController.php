<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
use App\Models\ExpenseRecord;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the accountant dashboard with financial KPIs.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Get unmatched counts for reconciliation
        $unmatchedSystemPayments = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereDoesntHave('reconciliationItem')
            ->count();

        $unmatchedBankTransactions = \App\Models\BankTransaction::where('school_id', $school->id)
            ->whereDoesntHave('reconciliationItem')
            ->count();

        // Get completed and total payments for success rate
        $completedPayments = $school->paymentTransactions()->where('status', 'completed')->count();
        $totalPayments = $school->paymentTransactions()->whereIn('status', ['completed', 'failed'])->count();
        $successRate = $totalPayments > 0 ? round(($completedPayments / $totalPayments) * 100, 1) : 0;

        // Get petty cash balance from approved expenses
        $pettyCashBalance = $school->expenseRecords()
            ->where('status', 'approved')
            ->where('category', 'Petty Cash')
            ->sum('amount') / 100;

        // Financial KPIs matching frontend structure
        $kpiData = [
            'dailyCollections' => 'KES ' . number_format($school->paymentTransactions()
                ->where('status', 'completed')
                ->whereDate('completed_at', now())
                ->sum('amount') / 100, 2),
            'pendingReconciliation' => $unmatchedSystemPayments,
            'unmatchedTransactions' => $unmatchedBankTransactions,
            'outstandingInvoices' => $school->invoices()
                ->whereIn('status', ['sent', 'partial', 'overdue'])
                ->count(),
            'paymentSuccessRate' => $successRate . '%',
            'pettyCashBalance' => 'KES ' . number_format($pettyCashBalance, 2),
        ];

        // Monthly collections (last 6 months) - showing both invoiced and collected
        $monthlyCollections = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $invoiced = $school->invoices()
                ->whereBetween('issued_date', [$monthStart, $monthEnd])
                ->sum('total_amount') / 100;
            
            $collected = PaymentTransaction::where('school_id', $school->id)
                ->where('status', 'completed')
                ->whereBetween('completed_at', [$monthStart, $monthEnd])
                ->sum('amount') / 100;
            
            $monthlyCollections[] = [
                'month' => $monthStart->format('M Y'),
                'invoiced' => $invoiced,
                'collected' => $collected,
            ];
        }

        // Payment method distribution – group all bank-transfer providers into one bucket
        $bankProviders = ['kcb', 'equity', 'ncba', 'coop', 'bank'];
        $mpesaCount = $school->paymentTransactions()->where('provider', 'mpesa')->where('status', 'completed')->count();
        $bankCount  = $school->paymentTransactions()->whereIn('provider', $bankProviders)->where('status', 'completed')->count();
        $cashCount  = $school->paymentTransactions()->where('provider', 'cash')->where('status', 'completed')->count();
        $cardCount  = $school->paymentTransactions()->where('provider', 'card')->where('status', 'completed')->count();
        
        $totalCount = $mpesaCount + $bankCount + $cashCount + $cardCount;
        
        $paymentMethodDistribution = [];
        if ($totalCount > 0) {
            $paymentMethodDistribution = [
                ['method' => 'M-Pesa', 'value' => round(($mpesaCount / $totalCount) * 100, 1), 'color' => 'hsl(142, 72%, 35%)'],
                ['method' => 'Bank', 'value' => round(($bankCount / $totalCount) * 100, 1), 'color' => 'hsl(200, 72%, 45%)'],
                ['method' => 'Cash', 'value' => round(($cashCount / $totalCount) * 100, 1), 'color' => 'hsl(45, 90%, 50%)'],
                ['method' => 'Card', 'value' => round(($cardCount / $totalCount) * 100, 1), 'color' => 'hsl(280, 60%, 50%)'],
            ];
            $paymentMethodDistribution = array_filter($paymentMethodDistribution, fn($item) => $item['value'] > 0);
        }

        // Receivables Aging
        $receivablesAging = [
            [
                'range' => '0-30 days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '>=', now()->subDays(30))
                    ->sum('balance') / 100,
                'count' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '>=', now()->subDays(30))
                    ->count(),
            ],
            [
                'range' => '31-60 days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', now()->subDays(30))
                    ->where('due_date', '>=', now()->subDays(60))
                    ->sum('balance') / 100,
                'count' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', now()->subDays(30))
                    ->where('due_date', '>=', now()->subDays(60))
                    ->count(),
            ],
            [
                'range' => '61-90 days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', now()->subDays(60))
                    ->where('due_date', '>=', now()->subDays(90))
                    ->sum('balance') / 100,
                'count' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', now()->subDays(60))
                    ->where('due_date', '>=', now()->subDays(90))
                    ->count(),
            ],
            [
                'range' => '90+ days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', now()->subDays(90))
                    ->sum('balance') / 100,
                'count' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', now()->subDays(90))
                    ->count(),
            ],
        ];

        // Recent payments with camelCase fields
        $recentPayments = $school->paymentTransactions()
            ->with(['student', 'parent'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($payment) => [
                'id' => (string) $payment->id,
                'studentName' => $payment->student->full_name,
                'parentName' => $payment->parent?->name ?? 'N/A',
                'amount' => $payment->amount / 100,
                'provider' => $payment->provider,
                'status' => $payment->status,
                'reference' => $payment->reference,
                'date' => $payment->created_at->format('M d, Y'),
            ]);

        // Reconciliation queue - get unmatched items
        $reconciliationQueue = [];
        
        // Add unmatched system payments
        $unmatchedSystemPaymentsData = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereDoesntHave('reconciliationItem')
            ->with('student')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($payment) => [
                'id' => 'system-' . $payment->id,
                'status' => 'unmatched_system',
                'systemPaymentRef' => $payment->reference,
                'systemAmount' => $payment->amount / 100,
                'systemStudentName' => $payment->student->full_name,
            ]);

        // Add unmatched bank transactions
        $unmatchedBankTransactionsData = \App\Models\BankTransaction::where('school_id', $school->id)
            ->whereDoesntHave('reconciliationItem')
            ->latest('date')
            ->take(5)
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

        $reconciliationQueue = array_merge($unmatchedSystemPaymentsData->toArray(), $unmatchedBankTransactionsData->toArray());

        return Inertia::render('accountant/Dashboard', [
            'kpiData' => $kpiData,
            'monthlyCollections' => $monthlyCollections,
            'paymentMethodDistribution' => array_values($paymentMethodDistribution),
            'receivablesAging' => $receivablesAging,
            'recentPayments' => $recentPayments,
            'reconciliationQueue' => $reconciliationQueue,
        ]);
    }
}
