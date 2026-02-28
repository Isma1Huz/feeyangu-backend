<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the parent dashboard with children and financial summary.
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get all children for this parent with their invoice totals
        $children = $user->students()
            ->with(['grade', 'class', 'school', 'invoices'])
            ->get()
            ->map(function ($student) {
                $invoices = $student->invoices;
                $totalFees = $invoices->sum('total_amount') / 100;
                $paidFees = $invoices->sum('paid_amount') / 100;

                return [
                    'studentId' => (string) $student->id,
                    'name' => $student->full_name,
                    'grade' => $student->grade ? $student->grade->name : '',
                    'className' => $student->class ? $student->class->name : '',
                    'status' => $student->status,
                    'paidFees' => $paidFees,
                    'totalFees' => $totalFees,
                ];
            });

        // Get recent payments formatted for the dashboard table
        $studentIds = $user->students()->pluck('students.id');
        $recentPayments = PaymentTransaction::whereIn('student_id', $studentIds)
            ->where('parent_id', $user->id)
            ->with('student')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => (string) $payment->id,
                    'date' => $payment->created_at->format('M d, Y'),
                    'amount' => $payment->amount / 100,
                    'method' => $payment->provider,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                ];
            });

        // Get recent receipts
        $recentReceipts = Receipt::whereIn('student_id', $studentIds)
            ->latest('issued_at')
            ->take(5)
            ->get()
            ->map(function ($receipt) {
                return [
                    'id' => (string) $receipt->id,
                    'receiptNumber' => $receipt->receipt_number,
                    'date' => $receipt->issued_at->format('M d, Y'),
                    'amount' => $receipt->amount / 100,
                    'studentId' => (string) $receipt->student_id,
                ];
            });

        // Calculate overall financial totals
        $allInvoices = Invoice::whereIn('student_id', $studentIds)->get();
        $totalFees = $allInvoices->sum('total_amount') / 100;
        $totalPaid = $allInvoices->sum('paid_amount') / 100;
        $totalOutstanding = $allInvoices->whereIn('status', ['sent', 'partial', 'overdue'])->sum('balance') / 100;

        return Inertia::render('parent/Dashboard', [
            'children' => $children,
            'recentPayments' => $recentPayments,
            'recentReceipts' => $recentReceipts,
            'totalFees' => $totalFees,
            'totalPaid' => $totalPaid,
            'totalOutstanding' => $totalOutstanding,
        ]);
    }
}
