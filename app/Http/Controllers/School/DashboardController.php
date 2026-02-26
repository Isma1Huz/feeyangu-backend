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

        // Calculate base metrics
        $totalStudents = $school->students()->count();
        $activeStudents = $school->students()->where('status', 'active')->count();
        $inactiveStudents = $school->students()->where('status', 'inactive')->count();
        
        $totalRevenue = $school->paymentTransactions()
            ->where('status', 'completed')
            ->sum('amount') / 100;
        
        $totalPending = $school->invoices()
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->sum('balance') / 100;
        
        $totalOverdue = $school->invoices()
            ->where('status', 'overdue')
            ->sum('balance') / 100;
        
        // Get total fees for collection rate
        $totalFees = $school->invoices()->sum('total_amount') / 100;
        $collectionRate = $totalFees > 0 ? round(($totalRevenue / $totalFees) * 100) : 0;
        
        $overdueCount = $school->invoices()
            ->where('status', 'overdue')
            ->count();

        // Calculate KPIs
        $kpi = [
            'total_students' => $totalStudents,
            'active_students' => $activeStudents,
            'inactive_students' => $inactiveStudents,
            'total_revenue' => $totalRevenue,
            'total_pending' => $totalPending,
            'total_overdue' => $totalOverdue,
            'collection_rate' => $collectionRate,
            'overdue_count' => $overdueCount,
        ];

        // Principal KPIs for KPICard component
        $principalKPIs = [
            [
                'title' => 'Total Revenue',
                'value' => 'KES ' . number_format($totalRevenue / 1000000, 1) . 'M',
                'change' => '+8.2%',
                'changeType' => 'positive',
                'icon' => 'DollarSign',
            ],
            [
                'title' => 'Outstanding Fees',
                'value' => 'KES ' . number_format($totalPending / 1000, 0) . 'K',
                'change' => '-3.1%',
                'changeType' => 'positive',
                'icon' => 'Clock',
            ],
            [
                'title' => 'Collection Rate',
                'value' => $collectionRate . '%',
                'change' => '+2.4%',
                'changeType' => 'positive',
                'icon' => 'TrendingUp',
            ],
            [
                'title' => 'Overdue Accounts',
                'value' => (string)$overdueCount,
                'change' => '+5',
                'changeType' => 'negative',
                'icon' => 'AlertTriangle',
            ],
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

        // Get recent activity (last 10 students enrolled)
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

        // Collection by payment method
        $collectionByMethod = [
            [
                'name' => 'M-Pesa',
                'value' => $school->paymentTransactions()
                    ->where('status', 'completed')
                    ->where('provider', 'mpesa')
                    ->sum('amount') / 100,
                'color' => 'hsl(142, 72%, 35%)',
            ],
            [
                'name' => 'Bank Transfer',
                'value' => $school->paymentTransactions()
                    ->where('status', 'completed')
                    ->where('provider', 'bank')
                    ->sum('amount') / 100,
                'color' => 'hsl(200, 72%, 45%)',
            ],
            [
                'name' => 'Cash',
                'value' => $school->paymentTransactions()
                    ->where('status', 'completed')
                    ->where('provider', 'cash')
                    ->sum('amount') / 100,
                'color' => 'hsl(45, 90%, 50%)',
            ],
            [
                'name' => 'Card',
                'value' => $school->paymentTransactions()
                    ->where('status', 'completed')
                    ->where('provider', 'card')
                    ->sum('amount') / 100,
                'color' => 'hsl(280, 60%, 50%)',
            ],
        ];

        // Monthly revenue for last 6 months
        $monthlyRevenue = \DB::table('payment_transactions')
            ->selectRaw("strftime('%Y-%m', completed_at) as month, SUM(amount) / 100 as revenue")
            ->where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                $date = \Carbon\Carbon::createFromFormat('Y-m', $item->month);
                return [
                    'month' => $date->format('M'),
                    'revenue' => (float)$item->revenue,
                    'target' => 2500000, // Static target, can be dynamic based on school settings
                ];
            })
            ->values()
            ->toArray();

        // Aging data - invoices by age range
        $now = now();
        $agingData = [
            [
                'range' => '0-30 days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->whereBetween('due_date', [$now->copy()->subDays(30), $now])
                    ->sum('balance') / 100,
                'students' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->whereBetween('due_date', [$now->copy()->subDays(30), $now])
                    ->distinct('student_id')
                    ->count('student_id'),
            ],
            [
                'range' => '31-60 days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->whereBetween('due_date', [$now->copy()->subDays(60), $now->copy()->subDays(31)])
                    ->sum('balance') / 100,
                'students' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->whereBetween('due_date', [$now->copy()->subDays(60), $now->copy()->subDays(31)])
                    ->distinct('student_id')
                    ->count('student_id'),
            ],
            [
                'range' => '61-90 days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->whereBetween('due_date', [$now->copy()->subDays(90), $now->copy()->subDays(61)])
                    ->sum('balance') / 100,
                'students' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->whereBetween('due_date', [$now->copy()->subDays(90), $now->copy()->subDays(61)])
                    ->distinct('student_id')
                    ->count('student_id'),
            ],
            [
                'range' => '90+ days',
                'amount' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', $now->copy()->subDays(90))
                    ->sum('balance') / 100,
                'students' => $school->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->where('due_date', '<', $now->copy()->subDays(90))
                    ->distinct('student_id')
                    ->count('student_id'),
            ],
        ];

        return Inertia::render('school/Dashboard', [
            'kpi' => $kpi,
            'recentPayments' => $recentPayments,
            'overdueInvoices' => $overdueInvoices,
            'studentsByGrade' => $studentsByGrade,
            'recentStudents' => $recentStudents,
            'collectionByMethod' => $collectionByMethod,
            'agingData' => $agingData,
            'monthlyRevenue' => $monthlyRevenue,
            'principalKPIs' => $principalKPIs,
        ]);
    }
}
