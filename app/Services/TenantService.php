<?php

namespace App\Services;

use App\Models\Module;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantService
{
    /**
     * Default modules assigned to each subscription plan.
     * Core modules are always enabled regardless of plan.
     */
    protected array $planModules = [
        'basic'      => ['academics', 'finance', 'attendance'],
        'standard'   => ['academics', 'finance', 'attendance', 'communication', 'parent_portal', 'student_portal'],
        'premium'    => ['academics', 'finance', 'attendance', 'communication', 'parent_portal',
                         'student_portal', 'transport', 'health', 'examination', 'tasks'],
        'enterprise' => [], // all modules
    ];

    /**
     * Create a new tenant (school) with an admin user and default module assignments.
     *
     * @param  array{name: string, owner_name: string, email: string, phone?: string, location?: string, plan?: string} $data
     */
    public function createTenant(array $data): School
    {
        return DB::transaction(function () use ($data) {
            $plan = $data['plan'] ?? 'basic';

            $school = School::create([
                'name'        => $data['name'],
                'owner_name'  => $data['owner_name'],
                'email'       => $data['email'],
                'phone'       => $data['phone'] ?? null,
                'location'    => $data['location'] ?? null,
                'status'      => 'active',
                'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
            ]);

            $this->assignModulesToTenant($school, $plan);

            return $school->fresh();
        });
    }

    /**
     * Assign default modules to a tenant (school) based on its subscription plan.
     * Alias for assignModulesToSchool() to match the architecture naming convention.
     */
    public function assignModulesToTenant(School $school, string $plan = 'basic'): void
    {
        $this->assignModulesToSchool($school, $plan);
    }

    /**
     * Assign default modules to a school based on its subscription plan.
     */
    public function assignModulesToSchool(School $school, string $plan = 'basic'): void
    {
        $activeModules  = Module::active()->get();
        $coreModules  = $activeModules->where('is_core', true)->pluck('id')->toArray();
        $planKeys     = $this->planModules[$plan] ?? $this->planModules['basic'];

        // Enterprise plan gets everything
        if ($plan === 'enterprise') {
            $enabledIds = $activeModules->pluck('id')->toArray();
        } else {
            $planModuleIds = $activeModules->whereIn('key', $planKeys)->pluck('id')->toArray();
            $enabledIds    = array_unique(array_merge($coreModules, $planModuleIds));
        }

        $syncData = [];
        foreach ($activeModules as $module) {
            $syncData[$module->id] = [
                'is_enabled' => in_array($module->id, $enabledIds),
                'settings'   => null,
                'permissions_override' => null,
            ];
        }

        DB::transaction(function () use ($school, $syncData) {
            $school->modules()->sync($syncData);
        });

        $this->clearModuleCache($school->id);
    }

    /**
     * Enable a module for a school, including its dependencies.
     */
    public function enableModule(School $school, string $moduleKey): bool
    {
        $module = Module::where('key', $moduleKey)->first();

        if (!$module) {
            return false;
        }

        // Enable dependencies first
        foreach ($module->getDependencyModules() as $dependency) {
            if (!$school->isModuleEnabled($dependency->key)) {
                $this->enableModule($school, $dependency->key);
            }
        }

        $school->modules()->syncWithoutDetaching([
            $module->id => ['is_enabled' => true],
        ]);

        $this->clearModuleCache($school->id);

        return true;
    }

    /**
     * Disable a module for a school (core modules cannot be disabled).
     */
    public function disableModule(School $school, string $moduleKey): bool
    {
        $module = Module::where('key', $moduleKey)->first();

        if (!$module || $module->is_core) {
            return false;
        }

        // Check if any enabled module depends on this one
        $dependents = Module::active()
            ->whereJsonContains('dependencies', $moduleKey)
            ->get()
            ->filter(fn ($m) => $school->isModuleEnabled($m->key));

        if ($dependents->isNotEmpty()) {
            return false;
        }

        $school->modules()->updateExistingPivot($module->id, ['is_enabled' => false]);

        $this->clearModuleCache($school->id);

        return true;
    }

    /**
     * Get all enabled modules for a school (cached).
     */
    public function getEnabledModules(School $school): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember(
            "school:{$school->id}:enabled_modules",
            now()->addMinutes(30),
            fn () => $school->enabledModules()->orderBy('sort_order')->get()
        );
    }

    /**
     * Clear the module cache for a school.
     */
    public function clearModuleCache(int $schoolId): void
    {
        Cache::forget("school:{$schoolId}:enabled_modules");
        Cache::forget("school:{$schoolId}:accessible_modules");
    }

    /**
     * Assign modules based on a SubscriptionPlan ID (and optional add-on module keys).
     */
    public function assignModulesToSchoolByPlanId(School $school, int $planId, array $addonModuleKeys = []): void
    {
        $plan = SubscriptionPlan::with('includedModules')->find($planId);

        if (!$plan) {
            return;
        }

        $activeModules   = Module::active()->get();
        $coreModuleIds   = $activeModules->where('is_core', true)->pluck('id')->toArray();
        $planModuleIds   = $plan->includedModules->pluck('id')->toArray();
        $addonModuleIds  = $activeModules->whereIn('key', $addonModuleKeys)->pluck('id')->toArray();

        $enabledIds = array_unique(array_merge($coreModuleIds, $planModuleIds, $addonModuleIds));

        $syncData = [];
        foreach ($activeModules as $module) {
            $syncData[$module->id] = [
                'is_enabled' => in_array($module->id, $enabledIds),
                'settings'   => null,
                'permissions_override' => null,
            ];
        }

        DB::transaction(function () use ($school, $syncData) {
            $school->modules()->sync($syncData);
        });

        $this->clearModuleCache($school->id);
    }
}
