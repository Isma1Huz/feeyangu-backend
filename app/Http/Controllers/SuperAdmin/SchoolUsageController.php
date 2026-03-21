<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SchoolUsageController extends Controller
{
    public function __construct(private readonly SubscriptionService $subscriptionService) {}

    /**
     * Overview of all schools with usage metrics.
     */
    public function index(): InertiaResponse
    {
        $schools = School::with('subscriptionPlan')
            ->withCount('students', 'users')
            ->orderBy('name')
            ->get()
            ->map(fn (School $school) => $this->buildUsageSummary($school));

        return Inertia::render('SuperAdmin/Schools/Usage', compact('schools'));
    }

    /**
     * Detailed usage for a specific school with near-limit warnings.
     */
    public function show(int $tenantId): InertiaResponse
    {
        $school = School::with('subscriptionPlan')
            ->withCount('students', 'users')
            ->findOrFail($tenantId);

        $usage = $this->buildUsageSummary($school);

        return Inertia::render('SuperAdmin/Schools/UsageDetail', ['school' => $usage]);
    }

    /**
     * Export usage report as CSV.
     */
    public function exportUsage(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $schools = School::with('subscriptionPlan')
            ->withCount('students', 'users')
            ->orderBy('name')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="school_usage_' . now()->format('Y-m-d') . '.csv"',
        ];

        return Response::stream(function () use ($schools) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'School Name', 'Plan', 'Status',
                'Students', 'Student Limit', 'Student Usage %',
                'Staff', 'Staff Limit', 'Staff Usage %',
                'Subscription End',
            ]);

            foreach ($schools as $school) {
                $usage = $this->buildUsageSummary($school);

                fputcsv($handle, [
                    $usage['name'],
                    $usage['plan_name'],
                    $usage['subscription_status'],
                    $usage['students']['current'],
                    $usage['students']['limit'] === 0 ? 'Unlimited' : $usage['students']['limit'],
                    $usage['students']['limit'] === 0 ? 'N/A' : $usage['students']['percent'] . '%',
                    $usage['staff']['current'],
                    $usage['staff']['limit'] === 0 ? 'Unlimited' : $usage['staff']['limit'],
                    $usage['staff']['limit'] === 0 ? 'N/A' : $usage['staff']['percent'] . '%',
                    $usage['subscription_end_date'] ?? 'N/A',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    private function buildUsageSummary(School $school): array
    {
        $studentLimit = $school->getEffectiveStudentLimit();
        $staffLimit   = $school->getEffectiveStaffLimit();
        $studentCount = $school->students_count ?? $school->students()->count();
        $staffCount   = $school->users_count ?? $school->users()->count();

        return [
            'id'                    => $school->id,
            'name'                  => $school->name,
            'plan_name'             => $school->subscriptionPlan?->name ?? 'None',
            'subscription_status'   => $school->subscription_status,
            'subscription_end_date' => $school->subscription_end_date?->toDateString(),
            'students'              => [
                'current'    => $studentCount,
                'limit'      => $studentLimit,
                'percent'    => $studentLimit > 0 ? (int) round(($studentCount / $studentLimit) * 100) : 0,
                'near_limit' => $studentLimit > 0 && $studentCount >= ($studentLimit * 0.80),
                'at_limit'   => $studentLimit > 0 && $studentCount >= $studentLimit,
            ],
            'staff'                 => [
                'current'    => $staffCount,
                'limit'      => $staffLimit,
                'percent'    => $staffLimit > 0 ? (int) round(($staffCount / $staffLimit) * 100) : 0,
                'near_limit' => $staffLimit > 0 && $staffCount >= ($staffLimit * 0.80),
                'at_limit'   => $staffLimit > 0 && $staffCount >= $staffLimit,
            ],
        ];
    }
}
