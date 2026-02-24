<?php

namespace App\Services;

use App\Models\School;
use App\Models\Student;
use App\Models\PaymentTransaction;
use App\Models\Invoice;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class KPICacheService
{
    protected int $cacheDuration = 300; // 5 minutes

    /**
     * Get school KPIs with caching.
     *
     * @param int $schoolId
     * @return array
     */
    public function getSchoolKPIs(int $schoolId): array
    {
        $cacheKey = "school_{$schoolId}_kpis";

        return Cache::remember($cacheKey, $this->cacheDuration, function () use ($schoolId) {
            return $this->calculateSchoolKPIs($schoolId);
        });
    }

    /**
     * Calculate school KPIs.
     *
     * @param int $schoolId
     * @return array
     */
    protected function calculateSchoolKPIs(int $schoolId): array
    {
        $totalStudents = Student::where('school_id', $schoolId)
            ->where('status', 'active')
            ->count();

        $invoiceStats = Invoice::where('school_id', $schoolId)
            ->selectRaw('
                SUM(total_amount) as total_invoiced,
                SUM(paid_amount) as total_paid,
                SUM(balance) as total_balance,
                COUNT(*) as invoice_count
            ')
            ->first();

        $overdueAmount = Invoice::where('school_id', $schoolId)
            ->where('status', 'overdue')
            ->sum('balance');

        $paymentStats = PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) as payment_count,
                SUM(amount) as total_collected
            ')
            ->first();

        return [
            'total_students' => $totalStudents,
            'total_invoiced' => $invoiceStats->total_invoiced ?? 0,
            'total_paid' => $invoiceStats->total_paid ?? 0,
            'total_balance' => $invoiceStats->total_balance ?? 0,
            'total_overdue' => $overdueAmount ?? 0,
            'invoice_count' => $invoiceStats->invoice_count ?? 0,
            'payment_count' => $paymentStats->payment_count ?? 0,
            'total_collected' => $paymentStats->total_collected ?? 0,
            'collection_rate' => $invoiceStats->total_invoiced > 0 
                ? ($invoiceStats->total_paid / $invoiceStats->total_invoiced) * 100 
                : 0,
        ];
    }

    /**
     * Invalidate school KPI cache.
     *
     * @param int $schoolId
     * @return void
     */
    public function invalidateSchoolKPIs(int $schoolId): void
    {
        Cache::forget("school_{$schoolId}_kpis");
    }

    /**
     * Get parent dashboard KPIs with caching.
     *
     * @param int $parentId
     * @return array
     */
    public function getParentKPIs(int $parentId): array
    {
        $cacheKey = "parent_{$parentId}_kpis";

        return Cache::remember($cacheKey, $this->cacheDuration, function () use ($parentId) {
            return $this->calculateParentKPIs($parentId);
        });
    }

    /**
     * Calculate parent KPIs.
     *
     * @param int $parentId
     * @return array
     */
    protected function calculateParentKPIs(int $parentId): array
    {
        $parent = \App\Models\User::find($parentId);
        $studentIds = $parent->students()->pluck('students.id');

        $invoiceStats = Invoice::whereIn('student_id', $studentIds)
            ->selectRaw('
                SUM(total_amount) as total_invoiced,
                SUM(paid_amount) as total_paid,
                SUM(balance) as total_balance
            ')
            ->first();

        $overdueCount = Invoice::whereIn('student_id', $studentIds)
            ->where('status', 'overdue')
            ->count();

        return [
            'total_children' => $studentIds->count(),
            'total_invoiced' => $invoiceStats->total_invoiced ?? 0,
            'total_paid' => $invoiceStats->total_paid ?? 0,
            'total_balance' => $invoiceStats->total_balance ?? 0,
            'overdue_invoices' => $overdueCount,
        ];
    }

    /**
     * Invalidate parent KPI cache.
     *
     * @param int $parentId
     * @return void
     */
    public function invalidateParentKPIs(int $parentId): void
    {
        Cache::forget("parent_{$parentId}_kpis");
    }

    /**
     * Invalidate all related caches when a payment is made.
     *
     * @param int $schoolId
     * @param int $parentId
     * @return void
     */
    public function invalidateOnPayment(int $schoolId, int $parentId): void
    {
        $this->invalidateSchoolKPIs($schoolId);
        $this->invalidateParentKPIs($parentId);
    }
}
