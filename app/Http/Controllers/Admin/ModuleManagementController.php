<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleTenantOverride;
use App\Models\School;
use App\Services\ModuleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleManagementController extends Controller
{
    public function __construct(private readonly ModuleService $moduleService) {}

    /**
     * Show all modules with global status and per-tenant override summary.
     */
    public function index(): Response
    {
        $modules = Module::withCount([
            'schools as enabled_schools_count' => fn ($q) => $q->wherePivot('is_enabled', true),
        ])->orderBy('sort_order')->get()->map(function (Module $module) {
            $module->tenant_override_count = ModuleTenantOverride::where('module_id', $module->id)
                ->whereIn('status', ['enabled', 'disabled'])
                ->count();

            return $module;
        });

        return Inertia::render('admin/modules/Index', [
            'modules' => $modules,
        ]);
    }

    /**
     * Toggle a module globally (enable/disable for ALL schools).
     */
    public function toggleGlobal(Request $request, string $moduleKey): RedirectResponse
    {
        $module = Module::where('key', $moduleKey)->firstOrFail();

        if ($module->is_core) {
            return back()->with('error', 'Core modules cannot be globally disabled.');
        }

        $disable = $request->boolean('disabled', !$module->is_globally_disabled);

        $success = $this->moduleService->setGlobalOverride($moduleKey, $disable);

        if (!$success) {
            return back()->with('error', 'Failed to update module.');
        }

        $action = $disable ? 'disabled globally' : 'enabled globally';

        return back()->with('success', "Module '{$module->name}' has been {$action}.");
    }

    /**
     * List tenants (schools) with their override status for a specific module.
     */
    public function showTenantOverrides(string $moduleKey): Response
    {
        $module = Module::where('key', $moduleKey)->firstOrFail();

        $schools = School::with(['subscriptionPlan'])
            ->orderBy('name')
            ->get()
            ->map(function (School $school) use ($module) {
                $override = ModuleTenantOverride::where('module_id', $module->id)
                    ->where('school_id', $school->id)
                    ->first();

                $school->override_status  = $override?->status ?? 'inherit';
                $school->module_is_enabled = $school->isModuleEnabled($module->key);

                return $school;
            });

        return Inertia::render('admin/modules/TenantOverrides', [
            'module'  => $module,
            'schools' => $schools,
        ]);
    }

    /**
     * Set a per-tenant module override via API.
     */
    public function setTenantOverride(Request $request, int $tenantId, string $moduleKey): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:enabled,disabled,inherit',
        ]);

        $school = School::findOrFail($tenantId);
        $success = $this->moduleService->setTenantOverride($school, $moduleKey, $request->status);

        if (!$success) {
            return response()->json(['message' => 'Module not found.'], 404);
        }

        return response()->json([
            'message' => "Override set to '{$request->status}' for school '{$school->name}'.",
        ]);
    }

    /**
     * Reset all tenant overrides for a module (everyone reverts to plan-based).
     */
    public function resetAllTenantOverrides(string $moduleKey): RedirectResponse
    {
        $module = Module::where('key', $moduleKey)->firstOrFail();

        $this->moduleService->resetAllTenantOverrides($moduleKey);

        return back()->with('success', "All tenant overrides for '{$module->name}' have been reset.");
    }
}
