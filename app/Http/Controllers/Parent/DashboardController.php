<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
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

        // Get all children for this parent
        $children = $user->students()
            ->with(['grade', 'class', 'school'])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'grade' => $student->grade ? [
                        'id' => $student->grade->id,
                        'name' => $student->grade->name,
                    ] : null,
                    'class' => $student->class ? [
                        'id' => $student->class->id,
                        'name' => $student->class->name,
                    ] : null,
                    'school' => [
                        'id' => $student->school->id,
                        'name' => $student->school->name,
                    ],
                    'status' => $student->status,
                    'balance' => $this->calculateBalance($student),
                ];
            });

        // Get recent notifications (unread)
        $notifications = $user->notifications()
            ->where('read', false)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'created_at' => $notification->created_at->diffForHumans(),
                ];
            });

        // Get recent payments
        $recentPayments = PaymentTransaction::whereIn('student_id', $children->pluck('id'))
            ->where('parent_id', $user->id)
            ->with(['student', 'receipt'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'student_name' => $payment->student->full_name,
                    'amount' => $payment->amount / 100, // Convert from cents to KES
                    'provider' => $payment->provider,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                    'created_at' => $payment->created_at->format('M d, Y'),
                    'has_receipt' => $payment->receipt !== null,
                ];
            });

        // Calculate summary statistics
        $summary = [
            'total_children' => $children->count(),
            'total_balance' => $children->sum('balance'),
            'unread_notifications' => $notifications->count(),
            'recent_payment_count' => $recentPayments->count(),
        ];

        return Inertia::render('parent/Dashboard', [
            'children' => $children,
            'notifications' => $notifications,
            'recentPayments' => $recentPayments,
            'summary' => $summary,
        ]);
    }

    /**
     * Calculate the balance (unpaid fees) for a student.
     */
    private function calculateBalance(Student $student): float
    {
        // Get all invoices for this student
        $totalInvoiced = Invoice::where('student_id', $student->id)
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->sum('balance');

        // Return balance in KES (convert from cents)
        return $totalInvoiced / 100;
    }
}
