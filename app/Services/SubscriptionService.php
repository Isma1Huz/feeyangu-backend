<?php

namespace App\Services;

use App\Models\Module;
use App\Models\School;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Return all active subscription plans ordered by sort_order.
     */
    public function getAvailablePlans(): Collection
    {
        return SubscriptionPlan::active()->with('includedModules')->get();
    }

    /**
     * Return all modules included in a specific plan.
     */
    public function getPlanModules(int $planId): Collection
    {
        $plan = SubscriptionPlan::findOrFail($planId);

        return $plan->includedModules()->orderBy('sort_order')->get();
    }

    /**
     * Return modules that are available as add-ons (not core, not included in basic plan).
     */
    public function getAddonModules(): Collection
    {
        return Module::active()
            ->where('is_core', false)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Calculate the price for a plan with optional add-on modules.
     *
     * @param  int    $planId
     * @param  array  $addonModuleKeys  module keys purchased as add-ons
     * @param  string $billingCycle     'monthly' | 'yearly'
     * @return array{base: float, addons: float, total: float, currency: string}
     */
    public function calculatePrice(int $planId, array $addonModuleKeys = [], string $billingCycle = 'monthly'): array
    {
        $plan = SubscriptionPlan::findOrFail($planId);

        $base = $billingCycle === 'yearly' ? (float) $plan->price_yearly : (float) $plan->price_monthly;

        // Add-on pricing (hardcoded per spec, can be moved to DB if needed)
        $addonPricing = [
            'transport' => ['monthly' => 5000, 'yearly' => 50000],
            'store'     => ['monthly' => 3000, 'yearly' => 30000],
            'hostel'    => ['monthly' => 4000, 'yearly' => 40000],
            'alumni'    => ['monthly' => 2000, 'yearly' => 20000],
        ];

        $addonTotal = 0.0;
        foreach ($addonModuleKeys as $key) {
            $addonTotal += $addonPricing[$key][$billingCycle] ?? 0;
        }

        return [
            'base'     => $base,
            'addons'   => $addonTotal,
            'total'    => $base + $addonTotal,
            'currency' => 'KES',
        ];
    }

    /**
     * Check whether a school is within its subscription limits for a resource type.
     *
     * @param  School $school
     * @param  string $resourceType  'students' | 'staff' | 'storage'
     * @return bool   true = within limits (or unlimited), false = at/over limit
     */
    public function checkSubscriptionLimits(School $school, string $resourceType): bool
    {
        $limit = $this->getLimit($school, $resourceType);

        if ($limit === 0) {
            return true; // unlimited
        }

        $current = $this->getCurrentUsage($school, $resourceType);

        return $current < $limit;
    }

    /**
     * Return the number of remaining slots for a resource type.
     * Returns null when the limit is unlimited.
     */
    public function getRemainingSlots(School $school, string $resourceType): ?int
    {
        $limit = $this->getLimit($school, $resourceType);

        if ($limit === 0) {
            return null;
        }

        $current = $this->getCurrentUsage($school, $resourceType);

        return max(0, $limit - $current);
    }

    /**
     * Check whether a specific module is accessible for a school
     * (included in plan OR purchased as add-on, AND not overridden/globally disabled).
     */
    public function isModuleAccessible(School $school, string $moduleKey): bool
    {
        $module = Module::where('key', $moduleKey)->first();

        if (!$module || !$module->is_active) {
            return false;
        }

        // Core modules are always accessible
        if ($module->is_core) {
            return true;
        }

        // Check plan inclusion
        if ($school->subscriptionPlan) {
            $inPlan = $school->subscriptionPlan->includedModules()
                ->where('key', $moduleKey)
                ->exists();

            if ($inPlan) {
                return true;
            }
        }

        // Check add-on modules
        $addonModules = $school->addon_modules ?? [];

        return in_array($moduleKey, $addonModules, true);
    }

    /**
     * Upgrade a school to a new subscription plan.
     */
    public function upgradeSubscription(School $school, int $newPlanId, array $addonModules = []): void
    {
        DB::transaction(function () use ($school, $newPlanId, $addonModules) {
            $school->update([
                'plan_id'      => $newPlanId,
                'addon_modules' => $addonModules,
                'subscription_status' => 'active',
            ]);

            // Re-assign modules based on new plan
            app(TenantService::class)->assignModulesToSchoolByPlanId($school, $newPlanId, $addonModules);
        });
    }

    /**
     * Downgrade a school to a lower subscription plan.
     */
    public function downgradeSubscription(School $school, int $newPlanId): void
    {
        DB::transaction(function () use ($school, $newPlanId) {
            $school->update([
                'plan_id'      => $newPlanId,
                'addon_modules' => [],
                'subscription_status' => 'active',
            ]);

            app(TenantService::class)->assignModulesToSchoolByPlanId($school, $newPlanId, []);
        });
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function getLimit(School $school, string $resourceType): int
    {
        return match ($resourceType) {
            'students' => $school->getEffectiveStudentLimit(),
            'staff'    => $school->getEffectiveStaffLimit(),
            'storage'  => $school->getEffectiveStorageLimit(),
            default    => 0,
        };
    }

    private function getCurrentUsage(School $school, string $resourceType): int
    {
        return match ($resourceType) {
            'students' => $school->students()->count(),
            'staff'    => $school->users()->where('school_id', $school->id)->count(),
            'storage'  => 0, // TODO: implement storage tracking
            default    => 0,
        };
    }
}
