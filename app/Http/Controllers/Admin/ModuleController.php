<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * Display all platform modules.
     */
    public function index(): Response
    {
        $modules = Module::orderBy('sort_order')->get();

        return Inertia::render('admin/Modules', [
            'modules' => $modules,
        ]);
    }

    /**
     * Toggle a module's active status (platform-wide).
     * Core modules cannot be deactivated.
     */
    public function update(Request $request, string $key): RedirectResponse
    {
        $module = Module::where('key', $key)->firstOrFail();

        if ($module->is_core) {
            return back()->with('error', 'Core modules cannot be deactivated.');
        }

        $module->update([
            'is_active' => $request->boolean('is_active'),
        ]);

        return back()->with('success', 'Module updated successfully.');
    }
}
