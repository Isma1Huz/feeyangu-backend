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

        // Financial KPIs
        $kpi = [
            'total_invoiced' => $school->invoices()->sum('total_amount') / 100,
            'total_paid' => $school->invoices()->sum('paid_amount') / 100,
            'total_balance' => $school->invoices()
                ->whereIn('status', ['sent', 'partial', 'overdue'])
                ->sum('balance') / 100,
            'overdue_amount' => $school->invoices()
                ->where('status', 'overdue')
                ->sum('balance') / 100,
            'completed_payments' => $school->paymentTransactions()
                ->where('status', 'completed')
                ->sum('amount') / 100,
            'pending_payments' => $school->paymentTransactions()
                ->whereIn('status', ['processing', 'initiating'])
                ->sum('amount') / 100,
            'total_expenses' => $school->expenseRecords()
                ->where('status', 'approved')
                ->sum('amount') / 100,
        ];

        // Revenue by month (last 6 months)
        $revenueByMonth = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(completed_at, "%Y-%m") as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'total' => $item->total / 100,
            ]);

        // Recent invoices
        $recentInvoices = $school->invoices()
            ->with('student')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'student_name' => $invoice->student->full_name,
                'total_amount' => $invoice->total_amount / 100,
                'paid_amount' => $invoice->paid_amount / 100,
                'balance' => $invoice->balance / 100,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date->format('M d, Y'),
            ]);

        // Recent payments
        $recentPayments = $school->paymentTransactions()
            ->with(['student', 'parent'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($payment) => [
                'id' => $payment->id,
                'student_name' => $payment->student->full_name,
                'parent_name' => $payment->parent->name,
                'amount' => $payment->amount / 100,
                'provider' => $payment->provider,
                'status' => $payment->status,
                'reference' => $payment->reference,
                'created_at' => $payment->created_at->format('M d, Y H:i'),
            ]);

        // Payment status distribution
        $paymentStatusDistribution = [
            ['status' => 'completed', 'count' => $school->paymentTransactions()->where('status', 'completed')->count()],
            ['status' => 'processing', 'count' => $school->paymentTransactions()->where('status', 'processing')->count()],
            ['status' => 'failed', 'count' => $school->paymentTransactions()->where('status', 'failed')->count()],
        ];

        return Inertia::render('accountant/Dashboard', [
            'kpi' => $kpi,
            'revenueByMonth' => $revenueByMonth,
            'recentInvoices' => $recentInvoices,
            'recentPayments' => $recentPayments,
            'paymentStatusDistribution' => $paymentStatusDistribution,
        ]);
    }
}
