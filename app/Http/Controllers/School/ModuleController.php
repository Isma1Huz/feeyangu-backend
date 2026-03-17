<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function __construct(private readonly TenantService $tenantService)
    {
    }

    /**
     * Show all modules and their enabled/disabled status for the current school.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $modules = Module::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function (Module $module) use ($school) {
                $pivot = $school->modules()->where('module_id', $module->id)->first();

                return [
                    'id'           => $module->id,
                    'name'         => $module->name,
                    'key'          => $module->key,
                    'icon'         => $module->icon,
                    'description'  => $module->description,
                    'dependencies' => $module->dependencies ?? [],
                    'is_core'      => $module->is_core,
                    'is_enabled'   => $pivot ? (bool) $pivot->pivot->is_enabled : false,
                ];
            });

        return Inertia::render('school/Modules', [
            'schoolModules' => $modules,
        ]);
    }

    /**
     * Enable or disable a module for the current school.
     */
    public function update(Request $request, string $key): RedirectResponse
    {
        $school = auth()->user()->school;
        $enable = $request->boolean('is_enabled');

        if ($enable) {
            $success = $this->tenantService->enableModule($school, $key);
            $message = $success ? 'Module enabled successfully.' : 'Failed to enable module. Check dependencies.';
        } else {
            $success = $this->tenantService->disableModule($school, $key);
            $message = $success ? 'Module disabled successfully.' : 'Cannot disable this module. It may be a core module or have dependents.';
        }

        return back()->with($success ? 'success' : 'error', $message);
    }
}
