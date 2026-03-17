<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(private readonly SubscriptionService $subscriptionService) {}

    /**
     * Show current plan, usage meters, add-on modules, and invoice history.
     */
    public function index(): Response
    {
        $school = auth()->user()->school->loadCount('students', 'users')->load('subscriptionPlan');

        $studentLimit  = $school->getEffectiveStudentLimit();
        $staffLimit    = $school->getEffectiveStaffLimit();
        $storageLimit  = $school->getEffectiveStorageLimit();

        $studentCount  = $school->students_count;
        $staffCount    = $school->users_count;

        $availablePlans = $this->subscriptionService->getAvailablePlans();
        $addonModules   = $this->subscriptionService->getAddonModules();

        return Inertia::render('school/subscription/Overview', [
            'school'         => $school,
            'currentPlan'    => $school->subscriptionPlan,
            'usage'          => [
                'students' => [
                    'current'   => $studentCount,
                    'limit'     => $studentLimit,
                    'percent'   => $studentLimit > 0 ? round(($studentCount / $studentLimit) * 100) : 0,
                    'unlimited' => $studentLimit === 0,
                ],
                'staff'    => [
                    'current'   => $staffCount,
                    'limit'     => $staffLimit,
                    'percent'   => $staffLimit > 0 ? round(($staffCount / $staffLimit) * 100) : 0,
                    'unlimited' => $staffLimit === 0,
                ],
                'storage'  => [
                    'current'   => 0, // TODO
                    'limit'     => $storageLimit,
                    'percent'   => 0,
                    'unlimited' => $storageLimit === 0,
                ],
            ],
            'addonModules'   => $addonModules,
            'currentAddons'  => $school->addon_modules ?? [],
            'availablePlans' => $availablePlans,
        ]);
    }

    /**
     * Show the upgrade/plan comparison page.
     */
    public function upgrade(): Response
    {
        $school         = auth()->user()->school->load('subscriptionPlan');
        $availablePlans = $this->subscriptionService->getAvailablePlans();
        $addonModules   = $this->subscriptionService->getAddonModules();

        return Inertia::render('school/subscription/Upgrade', [
            'currentPlan'    => $school->subscriptionPlan,
            'availablePlans' => $availablePlans,
            'addonModules'   => $addonModules,
        ]);
    }

    /**
     * Process a subscription upgrade.
     */
    public function processUpgrade(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id'       => 'required|integer|exists:subscription_plans,id',
            'addon_modules' => 'nullable|array',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $school = auth()->user()->school;

        $this->subscriptionService->upgradeSubscription(
            $school,
            $validated['plan_id'],
            $validated['addon_modules'] ?? []
        );

        $school->update(['billing_cycle' => $validated['billing_cycle']]);

        return redirect()->route('school.subscription.index')
            ->with('success', 'Subscription upgraded successfully.');
    }

    /**
     * API: Get available subscription plans (JSON).
     */
    public function availablePlans(): \Illuminate\Http\JsonResponse
    {
        $plans = $this->subscriptionService->getAvailablePlans();

        return response()->json(['plans' => $plans]);
    }

    /**
     * API: Get remaining subscription slots.
     */
    public function limits(): \Illuminate\Http\JsonResponse
    {
        $school = auth()->user()->school->loadCount('students', 'users');

        return response()->json([
            'students' => [
                'remaining' => $this->subscriptionService->getRemainingSlots($school, 'students'),
                'limit'     => $school->getEffectiveStudentLimit(),
                'current'   => $school->students_count,
            ],
            'staff' => [
                'remaining' => $this->subscriptionService->getRemainingSlots($school, 'staff'),
                'limit'     => $school->getEffectiveStaffLimit(),
                'current'   => $school->users_count,
            ],
        ]);
    }
}
