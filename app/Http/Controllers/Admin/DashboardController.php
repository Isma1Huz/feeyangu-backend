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
        $kpi = [
            'total_schools' => School::count(),
            'active_schools' => School::where('status', 'active')->count(),
            'pending_schools' => School::where('status', 'pending')->count(),
            'suspended_schools' => School::where('status', 'suspended')->count(),
            'total_users' => User::count(),
            'total_students' => Student::count(),
            'total_revenue' => PaymentTransaction::where('status', 'completed')
                ->sum('amount') / 100, // Convert from cents to KES
        ];

        // Recent schools (last 10 registered)
        $recentSchools = School::latest()
            ->take(10)
            ->get()
            ->map(function ($school) {
                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'owner_name' => $school->owner_name,
                    'location' => $school->location,
                    'status' => $school->status,
                    'created_at' => $school->created_at->format('M d, Y'),
                    'students_count' => $school->students()->count(),
                    'users_count' => $school->users()->count(),
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
            'recentSchools' => $recentSchools,
            'schoolsByStatus' => $schoolsByStatus,
            'revenueBySchool' => $revenueBySchool,
            'recentActivity' => $recentActivity,
        ]);
    }
}
