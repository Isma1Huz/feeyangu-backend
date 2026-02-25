<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use App\Models\Student;
use App\Models\PaymentTransaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the super admin dashboard with platform-wide KPIs.
     */
    public function index(): Response
    {
        // Platform-wide KPIs
        $totalSchools = School::count();
        $activeSchools = School::where('status', 'active')->count();
        $pendingSchools = School::where('status', 'pending')->count();
        $totalUsers = User::count();
        $totalStudents = Student::count();
        $totalRevenue = PaymentTransaction::where('status', 'completed')
            ->sum('amount') / 100; // Convert from cents to KES
        
        $kpi = [
            [
                'title' => 'Total Schools',
                'value' => (string) $totalSchools,
                'change' => '+5',
                'changeType' => 'positive',
                'icon' => 'building'
            ],
            [
                'title' => 'Active Schools',
                'value' => (string) $activeSchools,
                'change' => '+3',
                'changeType' => 'positive',
                'icon' => 'check-circle'
            ],
            [
                'title' => 'Pending Schools',
                'value' => (string) $pendingSchools,
                'change' => '-1',
                'changeType' => 'positive',
                'icon' => 'clock'
            ],
            [
                'title' => 'Total Users',
                'value' => (string) $totalUsers,
                'change' => '+15',
                'changeType' => 'positive',
                'icon' => 'users'
            ],
            [
                'title' => 'Total Students',
                'value' => (string) $totalStudents,
                'change' => '+20',
                'changeType' => 'positive',
                'icon' => 'graduation-cap'
            ],
            [
                'title' => 'Total Revenue',
                'value' => 'KES ' . number_format($totalRevenue, 2),
                'change' => '+12%',
                'changeType' => 'positive',
                'icon' => 'dollar-sign'
            ],
        ];

        // Recent schools (last 10 registered)
        $recentSchools = School::latest()
            ->take(10)
            ->get()
            ->map(function ($school) {
                return [
                    'id' => (string) $school->id,
                    'name' => $school->name,
                    'owner' => $school->owner_name ?? 'N/A',
                    'location' => $school->location ?? 'N/A',
                    'status' => $school->status,
                    'created_at' => $school->created_at->format('M d, Y'),
                    'studentCount' => $school->students()->count(),
                    'feesCollected' => PaymentTransaction::where('school_id', $school->id)
                        ->where('status', 'completed')
                        ->sum('amount') / 100,
                ];
            });

        // Schools by status
        $schoolsByStatus = [
            [
                'status' => 'active',
                'count' => School::where('status', 'active')->count(),
                'color' => 'green',
            ],
            [
                'status' => 'pending',
                'count' => School::where('status', 'pending')->count(),
                'color' => 'yellow',
            ],
            [
                'status' => 'suspended',
                'count' => School::where('status', 'suspended')->count(),
                'color' => 'red',
            ],
        ];

        // Revenue by school (top 10)
        $revenueBySchool = School::withCount([
            'paymentTransactions as total_revenue' => function ($query) {
                $query->where('status', 'completed')
                    ->selectRaw('SUM(amount) / 100');
            }
        ])
        ->orderBy('total_revenue', 'desc')
        ->take(10)
        ->get()
        ->map(function ($school) {
            return [
                'school_name' => $school->name,
                'revenue' => $school->total_revenue ?? 0,
            ];
        });

        // Recent activity - Latest payments across all schools
        $recentActivity = PaymentTransaction::with(['school', 'student', 'parent'])
            ->latest()
            ->take(15)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'school_name' => $payment->school->name,
                    'student_name' => $payment->student->full_name,
                    'parent_name' => $payment->parent->name,
                    'amount' => $payment->amount / 100,
                    'status' => $payment->status,
                    'provider' => $payment->provider,
                    'created_at' => $payment->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('admin/Dashboard', [
            'kpi' => $kpi,
            'schools' => $recentSchools,
            'schoolsByStatus' => $schoolsByStatus,
            'revenueBySchool' => $revenueBySchool,
            'recentActivity' => $recentActivity,
        ]);
    }
}
