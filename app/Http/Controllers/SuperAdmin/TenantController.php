<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function __construct(private readonly TenantService $tenantService) {}

    /**
     * Display a listing of tenants (schools).
     */
    public function index(Request $request): Response
    {
        $query = School::query();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%")
                  ->orWhere('owner_name', 'like', "%{$request->search}%");
            });
        }

        $tenants = $query->withCount(['students', 'users'])
            ->with('subscriptionPlan')
            ->latest()
            ->paginate(15);

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new tenant.
     */
    public function create(): Response
    {
        $plans = SubscriptionPlan::active()->get();

        return Inertia::render('SuperAdmin/Tenants/Create', compact('plans'));
    }

    /**
     * Store a newly created tenant.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'location'   => 'required|string|max:255',
            'status'     => 'required|in:active,pending,suspended',
            'plan_id'    => 'nullable|exists:subscription_plans,id',
        ]);

        $school = School::create($validated);

        if (!empty($validated['plan_id'])) {
            $plan = SubscriptionPlan::find($validated['plan_id']);
            $this->tenantService->assignModulesToSchool($school, $plan?->code ?? 'basic');
        }

        return redirect()->route('super-admin.tenants.show', $school)
            ->with('success', 'Tenant created successfully.');
    }

    /**
     * Display the specified tenant.
     */
    public function show(School $tenant): Response
    {
        $tenant->load(['subscriptionPlan', 'enabledModules']);
        $tenant->loadCount(['students', 'users']);

        return Inertia::render('SuperAdmin/Tenants/Show', compact('tenant'));
    }

    /**
     * Show the edit form for a tenant.
     */
    public function edit(School $tenant): Response
    {
        $plans = SubscriptionPlan::active()->get();

        return Inertia::render('SuperAdmin/Tenants/Edit', compact('tenant', 'plans'));
    }

    /**
     * Update the specified tenant.
     */
    public function update(Request $request, School $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'location'   => 'required|string|max:255',
            'status'     => 'required|in:active,pending,suspended',
            'plan_id'    => 'nullable|exists:subscription_plans,id',
        ]);

        $tenant->update($validated);

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Tenant updated successfully.');
    }

    /**
     * Remove the specified tenant.
     */
    public function destroy(School $tenant): RedirectResponse
    {
        $tenant->delete();

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Tenant removed.');
    }
}
