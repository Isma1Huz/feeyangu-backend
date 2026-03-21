<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanController extends Controller
{
    /**
     * List all subscription plans with module assignments and subscriber counts.
     */
    public function index(): Response
    {
        $plans = SubscriptionPlan::with('includedModules')
            ->withCount('schools')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('SuperAdmin/SubscriptionPlans/Index', compact('plans'));
    }

    /**
     * Show the plan creation form.
     */
    public function create(): Response
    {
        $modules = Module::active()->orderBy('sort_order')->get();

        return Inertia::render('SuperAdmin/SubscriptionPlans/Create', compact('modules'));
    }

    /**
     * Store a new subscription plan.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'code'             => 'required|string|max:50|unique:subscription_plans,code',
            'description'      => 'nullable|string',
            'price_monthly'    => 'required|numeric|min:0',
            'price_yearly'     => 'required|numeric|min:0',
            'student_limit'    => 'required|integer|min:0',
            'staff_limit'      => 'required|integer|min:0',
            'storage_limit_mb' => 'required|integer|min:0',
            'features'         => 'nullable|array',
            'is_active'        => 'boolean',
            'sort_order'       => 'integer|min:0',
            'module_ids'       => 'nullable|array',
            'module_ids.*'     => 'integer|exists:modules,id',
        ]);

        $moduleIds = $request->input('module_ids', []);

        DB::transaction(function () use ($validated, $moduleIds) {
            $plan = SubscriptionPlan::create(collect($validated)->except('module_ids')->toArray());

            $syncData = collect($moduleIds)->mapWithKeys(fn ($id) => [$id => ['is_included' => true]])->all();
            $plan->modules()->sync($syncData);
        });

        return redirect()->route('super-admin.subscription-plans.index')
            ->with('success', 'Subscription plan created successfully.');
    }

    /**
     * Show the edit form for an existing plan.
     */
    public function edit(int $id): Response
    {
        $plan    = SubscriptionPlan::with('modules')->findOrFail($id);
        $modules = Module::active()->orderBy('sort_order')->get();

        return Inertia::render('SuperAdmin/SubscriptionPlans/Edit', compact('plan', 'modules'));
    }

    /**
     * Update an existing plan.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'code'             => "required|string|max:50|unique:subscription_plans,code,{$id}",
            'description'      => 'nullable|string',
            'price_monthly'    => 'required|numeric|min:0',
            'price_yearly'     => 'required|numeric|min:0',
            'student_limit'    => 'required|integer|min:0',
            'staff_limit'      => 'required|integer|min:0',
            'storage_limit_mb' => 'required|integer|min:0',
            'features'         => 'nullable|array',
            'is_active'        => 'boolean',
            'sort_order'       => 'integer|min:0',
            'module_ids'       => 'nullable|array',
            'module_ids.*'     => 'integer|exists:modules,id',
        ]);

        $moduleIds = $request->input('module_ids', []);

        DB::transaction(function () use ($plan, $validated, $moduleIds) {
            $plan->update(collect($validated)->except('module_ids')->toArray());

            $syncData = collect($moduleIds)->mapWithKeys(fn ($id) => [$id => ['is_included' => true]])->all();
            $plan->modules()->sync($syncData);
        });

        return redirect()->route('super-admin.subscription-plans.index')
            ->with('success', 'Subscription plan updated successfully.');
    }

    /**
     * Delete a plan (only if no active subscribers).
     */
    public function destroy(int $id): RedirectResponse
    {
        $plan = SubscriptionPlan::withCount('schools')->findOrFail($id);

        if ($plan->schools_count > 0) {
            return back()->with('error', "Cannot delete plan '{$plan->name}': {$plan->schools_count} school(s) are subscribed.");
        }

        $plan->delete();

        return redirect()->route('super-admin.subscription-plans.index')
            ->with('success', 'Subscription plan deleted.');
    }

    /**
     * Duplicate an existing plan.
     */
    public function duplicate(int $id): RedirectResponse
    {
        $plan = SubscriptionPlan::with('modules')->findOrFail($id);

        DB::transaction(function () use ($plan) {
            $newPlan             = $plan->replicate(['code']);
            $newPlan->name       = $plan->name . ' (Copy)';
            $newPlan->code       = $plan->code . '_copy_' . time();
            $newPlan->is_active  = false;
            $newPlan->save();

            $syncData = $plan->modules->mapWithKeys(
                fn ($module) => [$module->id => ['is_included' => $module->pivot->is_included]]
            )->all();
            $newPlan->modules()->sync($syncData);
        });

        return redirect()->route('super-admin.subscription-plans.index')
            ->with('success', 'Plan duplicated. Remember to update the name and code before activating.');
    }

    /**
     * Preview the impact of updating a plan (affected schools, modules added/removed).
     */
    public function previewChanges(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $plan             = SubscriptionPlan::with('includedModules')->findOrFail($id);
        $newModuleIds     = $request->input('module_ids', []);
        $currentModuleIds = $plan->includedModules->pluck('id')->toArray();

        return response()->json([
            'affected_schools' => $plan->schools()->count(),
            'modules_added'    => Module::whereIn('id', array_diff($newModuleIds, $currentModuleIds))->pluck('name'),
            'modules_removed'  => Module::whereIn('id', array_diff($currentModuleIds, $newModuleIds))->pluck('name'),
        ]);
    }
}
