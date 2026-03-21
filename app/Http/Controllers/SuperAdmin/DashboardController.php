<?php

namespace App\Http\Controllers\SuperAdmin;

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
        $totalSchools   = School::count();
        $activeSchools  = School::where('status', 'active')->count();
        $pendingSchools = School::where('status', 'pending')->count();
        $totalUsers     = User::count();
        $totalStudents  = Student::count();
        $totalRevenue   = PaymentTransaction::where('status', 'completed')->sum('amount') / 100;

        $kpis = [
            ['label' => 'Total Schools',   'value' => $totalSchools],
            ['label' => 'Active Schools',  'value' => $activeSchools],
            ['label' => 'Pending Schools', 'value' => $pendingSchools],
            ['label' => 'Total Users',     'value' => $totalUsers],
            ['label' => 'Total Students',  'value' => $totalStudents],
            ['label' => 'Total Revenue',   'value' => $totalRevenue],
        ];

        return Inertia::render('SuperAdmin/Dashboard', compact('kpis'));
    }
}
