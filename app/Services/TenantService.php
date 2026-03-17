<?php

namespace App\Services;

use App\Models\Module;
use App\Models\School;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

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
    }
}
