<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
use App\Models\Student;
use App\Models\ExpenseRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get financial summary report
     */
    public function financialSummary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        $schoolId = Auth::user()->school_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        
        // Total invoiced
        $totalInvoiced = Invoice::where('school_id', $schoolId)
            ->whereBetween('issued_date', [$startDate, $endDate])
            ->sum('total_amount');
        
        // Total collected
        $totalCollected = PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->sum('amount');
        
        // Total expenses
        $totalExpenses = ExpenseRecord::where('school_id', $schoolId)
            ->where('status', 'approved')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
        
        // Outstanding balance
        $outstanding = Invoice::where('school_id', $schoolId)
            ->whereBetween('issued_date', [$startDate, $endDate])
            ->sum('balance');
        
        // Payment methods breakdown
        $paymentsByMethod = PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->select('provider', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('provider')
            ->get()
            ->map(function ($item) {
                return [
                    'provider' => $item->provider,
                    'total' => $item->total / 100,
                    'count' => $item->count,
                ];
            });
        
        return response()->json([
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'days' => $startDate->diffInDays($endDate) + 1,
            ],
            'summary' => [
                'total_invoiced' => $totalInvoiced / 100,
                'total_collected' => $totalCollected / 100,
                'total_expenses' => $totalExpenses / 100,
                'outstanding_balance' => $outstanding / 100,
                'net_revenue' => ($totalCollected - $totalExpenses) / 100,
                'collection_rate' => $totalInvoiced > 0 ? round(($totalCollected / $totalInvoiced) * 100, 2) : 0,
            ],
            'payment_methods' => $paymentsByMethod,
        ]);
    }

    /**
     * Get student enrollment report
     */
    public function studentEnrollment(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        
        // Total students
        $totalStudents = Student::where('school_id', $schoolId)->count();
        $activeStudents = Student::where('school_id', $schoolId)->where('status', 'active')->count();
        $inactiveStudents = Student::where('school_id', $schoolId)->where('status', 'inactive')->count();
        
        // Students by grade
        $studentsByGrade = Student::where('school_id', $schoolId)
            ->select('grade_id', DB::raw('COUNT(*) as count'))
            ->with('grade:id,name')
            ->groupBy('grade_id')
            ->get()
            ->map(function ($item) {
                return [
                    'grade' => $item->grade->name ?? 'Unknown',
                    'count' => $item->count,
                ];
            });
        
        // Students by class
        $studentsByClass = Student::where('school_id', $schoolId)
            ->select('class_id', DB::raw('COUNT(*) as count'))
            ->with('gradeClass:id,name')
            ->groupBy('class_id')
            ->get()
            ->map(function ($item) {
                return [
                    'class' => $item->gradeClass->name ?? 'Unassigned',
                    'count' => $item->count,
                ];
            });
        
        return response()->json([
            'summary' => [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'inactive_students' => $inactiveStudents,
            ],
            'by_grade' => $studentsByGrade,
            'by_class' => $studentsByClass,
        ]);
    }

    /**
     * Get payment collection report
     */
    public function paymentCollection(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_by' => 'sometimes|in:day,week,month',
        ]);
        
        $schoolId = Auth::user()->school_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $groupBy = $request->input('group_by', 'day');
        
        // Determine SQL date format based on grouping
        $dateFormat = match($groupBy) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };
        
        $collections = PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(completed_at, '{$dateFormat}') as period"),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period,
                    'total' => $item->total / 100,
                    'count' => $item->count,
                ];
            });
        
        return response()->json([
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'group_by' => $groupBy,
            ],
            'collections' => $collections,
            'total_amount' => $collections->sum('total'),
            'total_transactions' => $collections->sum('count'),
        ]);
    }

    /**
     * Get fee arrears report
     */
    public function feeArrears(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        
        // Get all students with outstanding balance
        $students = Student::where('school_id', $schoolId)
            ->where('status', 'active')
            ->with(['grade', 'gradeClass', 'invoices'])
            ->get()
            ->map(function ($student) {
                $totalInvoiced = $student->invoices->sum('total_amount');
                $totalPaid = $student->invoices->sum('paid_amount');
                $balance = $totalInvoiced - $totalPaid;
                
                return [
                    'student_id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'grade' => $student->grade->name ?? null,
                    'class' => $student->gradeClass->name ?? null,
                    'total_invoiced' => $totalInvoiced / 100,
                    'total_paid' => $totalPaid / 100,
                    'balance' => $balance / 100,
                    'overdue_invoices' => $student->invoices->where('status', 'overdue')->count(),
                ];
            })
            ->filter(function ($student) {
                return $student['balance'] > 0;
            })
            ->sortByDesc('balance')
            ->values();
        
        $totalArrears = $students->sum('balance');
        $studentsWithArrears = $students->count();
        
        return response()->json([
            'summary' => [
                'total_arrears' => $totalArrears,
                'students_with_arrears' => $studentsWithArrears,
                'average_arrears' => $studentsWithArrears > 0 ? round($totalArrears / $studentsWithArrears, 2) : 0,
            ],
            'students' => $students,
        ]);
    }

    /**
     * Get expense report
     */
    public function expenses(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        $schoolId = Auth::user()->school_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        
        // Get expenses
        $expenses = ExpenseRecord::where('school_id', $schoolId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();
        
        // Group by category
        $byCategory = $expenses->groupBy('category')
            ->map(function ($items, $category) {
                return [
                    'category' => $category,
                    'total' => $items->sum('amount') / 100,
                    'count' => $items->count(),
                ];
            })
            ->values();
        
        // Group by status
        $byStatus = $expenses->groupBy('status')
            ->map(function ($items, $status) {
                return [
                    'status' => $status,
                    'total' => $items->sum('amount') / 100,
                    'count' => $items->count(),
                ];
            })
            ->values();
        
        $totalExpenses = $expenses->sum('amount') / 100;
        $approvedExpenses = $expenses->where('status', 'approved')->sum('amount') / 100;
        $pendingExpenses = $expenses->where('status', 'pending')->sum('amount') / 100;
        
        return response()->json([
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_expenses' => $totalExpenses,
                'approved_expenses' => $approvedExpenses,
                'pending_expenses' => $pendingExpenses,
                'total_count' => $expenses->count(),
            ],
            'by_category' => $byCategory,
            'by_status' => $byStatus,
        ]);
    }

    /**
     * Get dashboard KPIs
     */
    public function dashboardKPIs()
    {
        $schoolId = Auth::user()->school_id;
        
        // Current month
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        // This month's revenue
        $monthRevenue = PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        
        // Pending invoices
        $pendingInvoices = Invoice::where('school_id', $schoolId)
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->sum('balance');
        
        // Active students
        $activeStudents = Student::where('school_id', $schoolId)
            ->where('status', 'active')
            ->count();
        
        // Recent payments (last 7 days)
        $recentPayments = PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', Carbon::now()->subDays(7))
            ->count();
        
        return response()->json([
            'month_revenue' => $monthRevenue / 100,
            'pending_invoices' => $pendingInvoices / 100,
            'active_students' => $activeStudents,
            'recent_payments' => $recentPayments,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
