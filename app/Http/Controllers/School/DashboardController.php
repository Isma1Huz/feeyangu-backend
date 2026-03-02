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
    // Constants for data conversion
    private const CENTS_TO_KES = 100;
    private const KES_TO_THOUSANDS = 1000;
    private const KES_TO_MILLIONS = 1000000;
    private const DEFAULT_REVENUE_TARGET = 2500000; // Default monthly target in KES

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
            ->sum('amount') / self::CENTS_TO_KES;
        
        $totalPending = $school->invoices()
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->sum('balance') / self::CENTS_TO_KES;
        
        $totalOverdue = $school->invoices()
            ->where('status', 'overdue')
            ->sum('balance') / self::CENTS_TO_KES;
        
        // Get total fees for collection rate
        $totalFees = $school->invoices()->sum('total_amount') / self::CENTS_TO_KES;
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
        // Note: Change percentages are placeholders - implement period-over-period calculation for actual trends
        $principalKPIs = [
            [
                'title' => 'Total Revenue',
                'value' => 'KES ' . number_format($totalRevenue / self::KES_TO_MILLIONS, 1) . 'M',
                'change' => '+8.2%', // TODO: Calculate actual month-over-month change
                'changeType' => 'positive',
                'icon' => 'DollarSign',
            ],
            [
                'title' => 'Outstanding Fees',
                'value' => 'KES ' . number_format($totalPending / self::KES_TO_THOUSANDS, 0) . 'K',
                'change' => '-3.1%', // TODO: Calculate actual month-over-month change
                'changeType' => 'positive',
                'icon' => 'Clock',
            ],
            [
                'title' => 'Collection Rate',
                'value' => $collectionRate . '%',
                'change' => '+2.4%', // TODO: Calculate actual month-over-month change
                'changeType' => 'positive',
                'icon' => 'TrendingUp',
            ],
            [
                'title' => 'Overdue Accounts',
                'value' => (string)$overdueCount,
                'change' => '+5', // TODO: Calculate actual month-over-month change
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
                    'parent_name' => $payment->parent?->name ?? 'N/A',
                    'amount' => $payment->amount / self::CENTS_TO_KES,
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
                    'total_amount' => $invoice->total_amount / self::CENTS_TO_KES,
                    'paid_amount' => $invoice->paid_amount / self::CENTS_TO_KES,
                    'balance' => $invoice->balance / self::CENTS_TO_KES,
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

        // Group all bank-transfer providers (online and manual) under one "Bank Transfer" bucket
        $bankProviders = ['kcb', 'equity', 'ncba', 'coop', 'bank'];
        $methodSums = $school->paymentTransactions()
            ->selectRaw('provider, SUM(amount) as total_amount')
            ->where('status', 'completed')
            ->whereIn('provider', array_merge(['mpesa', 'cash', 'card'], $bankProviders))
            ->groupBy('provider')
            ->pluck('total_amount', 'provider');
        $bankTransferTotal = collect($bankProviders)->sum(fn($p) => $methodSums[$p] ?? 0);
        $collectionByMethod = [
            [
                'name' => 'M-Pesa',
                'value' => ($methodSums['mpesa'] ?? 0) / self::CENTS_TO_KES,
                'color' => 'hsl(142, 72%, 35%)',
            ],
            [
                'name' => 'Bank Transfer',
                'value' => $bankTransferTotal / self::CENTS_TO_KES,
                'color' => 'hsl(200, 72%, 45%)',
            ],
            [
                'name' => 'Cash',
                'value' => ($methodSums['cash'] ?? 0) / self::CENTS_TO_KES,
                'color' => 'hsl(45, 90%, 50%)',
            ],
            [
                'name' => 'Card',
                'value' => ($methodSums['card'] ?? 0) / self::CENTS_TO_KES,
                'color' => 'hsl(280, 60%, 50%)',
            ],
        ];

         // Build a fixed 6-month window ending this month, and fill missing months with zero revenue
        $endOfCurrentMonth = now()->startOfMonth();
        $startDate = $endOfCurrentMonth->copy()->subMonths(5);
        
        // Database-agnostic date formatting using DB facade
        $dateFormat = match (config('database.default')) {
            'mysql' => "DATE_FORMAT(completed_at, '%Y-%m')",
            'pgsql' => "TO_CHAR(completed_at, 'YYYY-MM')",
            default => "strftime('%Y-%m', completed_at)", // SQLite
        };
        
        $rawMonthlyRevenue = $school->paymentTransactions()
            ->selectRaw("{$dateFormat} as month, SUM(amount) / ? as revenue", [self::CENTS_TO_KES])
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $startDate)
            ->groupByRaw($dateFormat)
            ->orderByRaw($dateFormat)
            ->get()
            ->keyBy('month');
        $monthlyRevenue = [];
        for ($i = 0; $i < 6; $i++) {
            $currentMonthDate = $startDate->copy()->addMonths($i);
            $monthKey = $currentMonthDate->format('Y-m');
            $item = $rawMonthlyRevenue->get($monthKey);
            $revenue = $item ? (float)$item->revenue : 0.0;
            $monthlyRevenue[] = [
                'month' => $currentMonthDate->format('M'),
                'revenue' => $revenue,
                'target' => self::DEFAULT_REVENUE_TARGET, // TODO: Make configurable per school
            ];
        }

        // Aging data - invoices by how long they're overdue (past due date)
        // Measures receivables by how many days past the due date
        $now = now();
          // Fetch all overdue invoices once and aggregate into aging buckets in PHP
        $agingInvoices = $school->invoices()
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->where('due_date', '<', $now)
            ->get(['due_date', 'balance', 'student_id']);
        $buckets = [
            '0-30' => ['amount_cents' => 0, 'students' => []],
            '31-60' => ['amount_cents' => 0, 'students' => []],
            '61-90' => ['amount_cents' => 0, 'students' => []],
            '90+' => ['amount_cents' => 0, 'students' => []],
        ];
        foreach ($agingInvoices as $invoice) {
            // Number of days the invoice is overdue
            $daysOverdue = $now->diffInDays($invoice->due_date);
            if ($daysOverdue <= 30) {
                $key = '0-30';
            } elseif ($daysOverdue <= 60) {
                $key = '31-60';
            } elseif ($daysOverdue <= 90) {
                $key = '61-90';
            } else {
                $key = '90+';
            }
            $buckets[$key]['amount_cents'] += $invoice->balance;
            $buckets[$key]['students'][$invoice->student_id] = true;
        }
        $agingData = [
            [
                'range' => '0-30 days',
                'amount' => $buckets['0-30']['amount_cents'] / self::CENTS_TO_KES,
                'students' => count($buckets['0-30']['students']),
            ],
            [
                'range' => '31-60 days',
                'amount' => $buckets['31-60']['amount_cents'] / self::CENTS_TO_KES,
                'students' => count($buckets['31-60']['students']),
            ],
            [
                'range' => '61-90 days',
                'amount' => $buckets['61-90']['amount_cents'] / self::CENTS_TO_KES,
                'students' => count($buckets['61-90']['students']),
            ],
            [
                'range' => '90+ days',
                'amount' => $buckets['90+']['amount_cents'] / self::CENTS_TO_KES,
                'students' => count($buckets['90+']['students']),
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
