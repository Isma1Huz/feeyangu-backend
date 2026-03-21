<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of platform roles with their permissions.
     */
    public function index(): Response
    {
        $roles = Role::with('permissions')
            ->orderBy('name')
            ->get()
            ->map(fn ($role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'guard_name'  => $role->guard_name,
                'permissions' => $role->permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
                'users_count' => $role->users()->count(),
            ]);

        $permissions = Permission::orderBy('name')
            ->get()
            ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]);

        return Inertia::render('admin/Roles', [
            'roles'       => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created platform role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:125', Rule::notIn(['super_admin']), Rule::unique('roles', 'name')],
            'permissions' => 'nullable|array',
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', "Role '{$role->name}' created successfully.");
    }

    /**
     * Update the specified platform role.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:125', Rule::notIn(['super_admin']), Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => 'nullable|array',
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        // Prevent renaming the super_admin role
        if ($role->name === 'super_admin') {
            return redirect()->route('admin.roles.index')
                ->with('error', 'Cannot modify the super_admin role.');
        }

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('admin.roles.index')
            ->with('success', "Role '{$role->name}' updated successfully.");
    }

    /**
     * Delete a platform role (cannot delete super_admin or roles with active users).
     */
    public function destroy(int $id): RedirectResponse
    {
        $role = Role::findOrFail($id);

        if ($role->name === 'super_admin') {
            return redirect()->route('admin.roles.index')
                ->with('error', 'Cannot delete the super_admin role.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->route('admin.roles.index')
                ->with('error', "Cannot delete role '{$role->name}' because it has active users assigned to it.");
        }

        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', "Role deleted successfully.");
    }

    /**
     * Sync permissions for a role (JSON response for inline updates from Users page).
     */
    public function syncPermissions(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->name === 'super_admin') {
            return response()->json(['message' => 'Cannot modify super_admin permissions.'], 403);
        }

        $validated = $request->validate([
            'permissions'   => 'nullable|array',
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return response()->json([
            'message'     => 'Permissions updated successfully.',
            'permissions' => $role->permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
        ]);
    }

    /**
     * Store a new permission (for creating permissions from the UI).
     */
    public function storePermission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:125', Rule::unique('permissions', 'name')],
        ]);

        $permission = Permission::create(['name' => $validated['name'], 'guard_name' => 'web']);

        return response()->json([
            'message'    => "Permission '{$permission->name}' created successfully.",
            'permission' => ['id' => $permission->id, 'name' => $permission->name],
        ], 201);
    }

    /**
     * Delete a permission.
     */
    public function destroyPermission(int $id): JsonResponse
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();

        return response()->json(['message' => "Permission deleted successfully."]);
    }
}
