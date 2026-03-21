<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of all users across the platform.
     */
    public function index(Request $request): Response
    {
        $query = User::with(['school', 'roles']);

        // Filter by role if provided
        if ($request->has('role') && $request->role !== 'all') {
            $query->role($request->role);
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()
            ->paginate(20)
            ->through(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first() ?? 'N/A',
                    'school' => $user->school->name ?? 'N/A',
                    'school_id' => $user->school_id ? (string) $user->school_id : null,
                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                    'lastLogin' => $user->updated_at ? $user->updated_at->diffForHumans() : 'Never',
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        $schools = School::orderBy('name')->get()->map(fn ($s) => [
            'id' => (string) $s->id,
            'name' => $s->name,
        ]);

        // Get all assignable roles (excluding super_admin)
        $availableRoles = Role::where('name', '!=', 'super_admin')
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]);

        $availablePermissions = Permission::orderBy('name')->get()
            ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]);

        return Inertia::render('admin/Users', [
            'users' => $users->items(),
            'filters' => $request->only(['role', 'search']),
            'schools' => $schools,
            'availableRoles' => $availableRoles,
            'availablePermissions' => $availablePermissions,
        ]);
    }

    /**
     * Store a newly created user (accountant/school_admin).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role' => ['required', 'string', Rule::notIn(['super_admin']), Rule::exists('roles', 'name')],
            'school_id' => 'nullable|exists:schools,id',
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'school_id' => $validated['school_id'] ?? null,
            'email_verified_at' => now(), // Auto-verify admin-created users
        ]);

        $user->assignRole($role);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'role' => ['required', 'string', Rule::notIn(['super_admin']), Rule::exists('roles', 'name')],
            'school_id' => 'nullable|exists:schools,id',
            'status' => 'required|in:active,inactive',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'school_id' => $validated['school_id'] ?? null,
            'email_verified_at' => $validated['status'] === 'active' ? ($user->email_verified_at ?? now()) : null,
        ]);

        // Sync role (fetch existing role - validated it exists above)
        $role = Role::where('name', $validated['role'])->firstOrFail();
        $user->syncRoles([$role]);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deleting super admins
        if ($user->hasRole('super_admin')) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Cannot delete super admin accounts.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Get a user's roles and direct permissions.
     */
    public function getUserRoles(User $user): JsonResponse
    {
        return response()->json([
            'roles' => $user->roles->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]),
            'directPermissions' => $user->getDirectPermissions()->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
            'allPermissions' => $user->getAllPermissions()->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'via' => $user->getDirectPermissions()->contains('id', $p->id) ? 'direct' : 'role']),
        ]);
    }

    /**
     * Attach a role to a user.
     */
    public function attachRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::notIn(['super_admin']), Rule::exists('roles', 'name')],
        ]);

        if (!$user->hasRole($validated['role'])) {
            $user->assignRole($validated['role']);
        }

        return response()->json([
            'message' => 'Role attached successfully.',
            'roles' => $user->roles->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]),
        ]);
    }

    /**
     * Detach a role from a user.
     */
    public function detachRole(Request $request, User $user, string $roleName): JsonResponse
    {
        if ($roleName === 'super_admin') {
            return response()->json(['message' => 'Cannot remove super_admin role.'], 403);
        }

        $user->removeRole($roleName);

        return response()->json([
            'message' => 'Role detached successfully.',
            'roles' => $user->roles->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]),
        ]);
    }

    /**
     * Attach a direct permission to a user.
     */
    public function attachPermission(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'permission' => ['required', 'string', Rule::exists('permissions', 'name')],
        ]);

        $user->givePermissionTo($validated['permission']);

        return response()->json([
            'message' => 'Permission attached successfully.',
            'directPermissions' => $user->getDirectPermissions()->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
        ]);
    }

    /**
     * Detach a direct permission from a user.
     */
    public function detachPermission(Request $request, User $user, string $permissionName): JsonResponse
    {
        $user->revokePermissionTo($permissionName);

        return response()->json([
            'message' => 'Permission detached successfully.',
            'directPermissions' => $user->getDirectPermissions()->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
        ]);
    }
}
