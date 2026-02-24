<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\PaymentTransaction;
use App\Models\Invoice;
use App\Models\Grade;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the school admin dashboard with KPIs and recent activity.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Calculate KPIs
        $kpi = [
            'total_students' => $school->students()->count(),
            'active_students' => $school->students()->where('status', 'active')->count(),
            'inactive_students' => $school->students()->where('status', 'inactive')->count(),
            'total_revenue' => $school->paymentTransactions()
                ->where('status', 'completed')
                ->sum('amount') / 100, // Convert from cents to KES
            'total_pending' => $school->invoices()
                ->whereIn('status', ['sent', 'partial', 'overdue'])
                ->sum('balance') / 100,
            'total_overdue' => $school->invoices()
                ->where('status', 'overdue')
                ->sum('balance') / 100,
        ];

        // Get recent payments
        $recentPayments = $school->paymentTransactions()
            ->with(['student', 'parent'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'student_name' => $payment->student->full_name,
                    'parent_name' => $payment->parent->name,
                    'amount' => $payment->amount / 100,
                    'provider' => $payment->provider,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                    'created_at' => $payment->created_at->format('M d, Y H:i'),
                ];
            });

        // Get overdue invoices
        $overdueInvoices = $school->invoices()
            ->where('status', 'overdue')
            ->with('student')
            ->latest('due_date')
            ->take(10)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'student_name' => $invoice->student->full_name,
                    'total_amount' => $invoice->total_amount / 100,
                    'paid_amount' => $invoice->paid_amount / 100,
                    'balance' => $invoice->balance / 100,
                    'due_date' => $invoice->due_date->format('M d, Y'),
                    'days_overdue' => now()->diffInDays($invoice->due_date, false),
                ];
            });

        // Get students by grade distribution
        $studentsByGrade = $school->grades()
            ->withCount('students')
            ->get()
            ->map(function ($grade) {
                return [
                    'grade' => $grade->name,
                    'count' => $grade->students_count,
                ];
            });

        // Recent activity (last 10 students enrolled)
        $recentStudents = $school->students()
            ->with(['grade', 'class'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'admission_number' => $student->admission_number,
                    'grade' => $student->grade->name,
                    'class' => $student->class->name,
                    'enrolled_at' => $student->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('school/Dashboard', [
            'kpi' => $kpi,
            'recentPayments' => $recentPayments,
            'overdueInvoices' => $overdueInvoices,
            'studentsByGrade' => $studentsByGrade,
            'recentStudents' => $recentStudents,
        ]);
    }
}
