<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolRole;
use App\Services\ModuleService;
use Database\Seeders\SchoolRolesSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function __construct(private readonly ModuleService $moduleService) {}

    /**
     * List all roles for the current school (system + custom), with member counts.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $roles = SchoolRole::where('tenant_id', $school->id)
            ->withCount('staffAssignments')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return Inertia::render('school/roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the role creation form with permission tree (only for enabled modules).
     */
    public function create(): Response
    {
        $school      = auth()->user()->school;
        $enabledModules = $this->moduleService->getEnabledModulesForTenant($school);
        $allRoles    = SchoolRole::where('tenant_id', $school->id)->get(['id', 'name']);

        return Inertia::render('school/roles/Create', [
            'enabledModules'   => $enabledModules,
            'allPermissions'   => $this->groupedPermissions($enabledModules->pluck('key')->toArray()),
            'availableParents' => $allRoles,
        ]);
    }

    /**
     * Store a new custom role.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'name'           => "required|string|max:100|unique:school_roles,name,NULL,id,tenant_id,{$school->id}",
            'description'    => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
            'parent_role_ids' => 'nullable|array',
            'parent_role_ids.*' => "integer|exists:school_roles,id,tenant_id,{$school->id}",
        ]);

        DB::transaction(function () use ($validated, $school, $request) {
            $role = SchoolRole::create([
                'tenant_id'   => $school->id,
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_system'   => false,
                'created_by'  => auth()->id(),
            ]);

            if (!empty($validated['permission_ids'])) {
                $role->permissions()->sync($validated['permission_ids']);
            }

            if (!empty($validated['parent_role_ids'])) {
                foreach ($validated['parent_role_ids'] as $parentId) {
                    DB::table('role_hierarchy')->insertOrIgnore([
                        'parent_role_id' => $parentId,
                        'child_role_id'  => $role->id,
                        'created_at'     => now(),
                    ]);
                }
            }
        });

        return redirect()->route('school.roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Show a role with its assigned staff.
     */
    public function show(int $id): Response
    {
        $school = auth()->user()->school;
        $role   = SchoolRole::where('tenant_id', $school->id)
            ->with(['permissions', 'staff', 'parentRoles', 'childRoles'])
            ->findOrFail($id);

        return Inertia::render('school/roles/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Show the edit form for a role.
     */
    public function edit(int $id): Response
    {
        $school = auth()->user()->school;
        $role   = SchoolRole::where('tenant_id', $school->id)
            ->with(['permissions', 'parentRoles'])
            ->findOrFail($id);

        $enabledModules = $this->moduleService->getEnabledModulesForTenant($school);
        $allRoles       = SchoolRole::where('tenant_id', $school->id)
            ->where('id', '!=', $id)
            ->get(['id', 'name']);

        return Inertia::render('school/roles/Edit', [
            'role'             => $role,
            'enabledModules'   => $enabledModules,
            'allPermissions'   => $this->groupedPermissions($enabledModules->pluck('key')->toArray()),
            'availableParents' => $allRoles,
        ]);
    }

    /**
     * Update a role's permissions.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $role   = SchoolRole::where('tenant_id', $school->id)->findOrFail($id);

        if ($role->is_system) {
            // System roles can only have permissions updated, not renamed/deleted
            $validated = $request->validate([
                'permission_ids'   => 'nullable|array',
                'permission_ids.*' => 'integer|exists:permissions,id',
            ]);
        } else {
            $validated = $request->validate([
                'name'             => "required|string|max:100|unique:school_roles,name,{$id},id,tenant_id,{$school->id}",
                'description'      => 'nullable|string',
                'permission_ids'   => 'nullable|array',
                'permission_ids.*' => 'integer|exists:permissions,id',
                'parent_role_ids'  => 'nullable|array',
                'parent_role_ids.*' => "integer|exists:school_roles,id,tenant_id,{$school->id}",
            ]);

            $role->update([
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            // Update hierarchy
            DB::table('role_hierarchy')->where('child_role_id', $id)->delete();
            foreach ($validated['parent_role_ids'] ?? [] as $parentId) {
                DB::table('role_hierarchy')->insertOrIgnore([
                    'parent_role_id' => $parentId,
                    'child_role_id'  => $id,
                    'created_at'     => now(),
                ]);
            }
        }

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        return redirect()->route('school.roles.show', $id)
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Delete a custom role (system roles cannot be deleted; must have no assignments).
     */
    public function destroy(int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $role   = SchoolRole::where('tenant_id', $school->id)->withCount('staffAssignments')->findOrFail($id);

        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        if ($role->staff_assignments_count > 0) {
            return back()->with('error', "Cannot delete role: {$role->staff_assignments_count} staff member(s) are assigned to it.");
        }

        DB::table('role_hierarchy')
            ->where('parent_role_id', $id)
            ->orWhere('child_role_id', $id)
            ->delete();

        $role->delete();

        return redirect()->route('school.roles.index')
            ->with('success', 'Role deleted.');
    }

    /**
     * Duplicate a role with all its permissions.
     */
    public function duplicate(int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $role   = SchoolRole::where('tenant_id', $school->id)->with('permissions')->findOrFail($id);

        DB::transaction(function () use ($role, $school) {
            $newRole = SchoolRole::create([
                'tenant_id'   => $school->id,
                'name'        => $role->name . ' (Copy)',
                'description' => $role->description,
                'is_system'   => false,
                'created_by'  => auth()->id(),
            ]);

            $newRole->permissions()->sync($role->permissions->pluck('id')->toArray());
        });

        return redirect()->route('school.roles.index')
            ->with('success', 'Role duplicated successfully.');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function groupedPermissions(array $enabledModuleKeys): array
    {
        $permissions = Permission::whereIn('guard_name', ['web', 'api'])
            ->orderBy('name')
            ->get()
            ->groupBy(function ($permission) {
                // Group by module prefix (e.g., "academics:view_classes" => "academics")
                return explode(':', $permission->name)[0] ?? 'other';
            })
            ->filter(function ($group, $moduleKey) use ($enabledModuleKeys) {
                return in_array($moduleKey, $enabledModuleKeys, true) || $moduleKey === 'core';
            });

        return $permissions->map(fn ($group) => $group->values())->toArray();
    }
}
