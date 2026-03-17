<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolRole;
use App\Models\StaffDirectPermission;
use App\Models\StaffRoleAssignment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class StaffPermissionController extends Controller
{
    /**
     * Show the permission matrix for a staff member (roles + direct permissions).
     */
    public function index(int $staffId): Response
    {
        $school = auth()->user()->school;
        $staff  = User::where('school_id', $school->id)->findOrFail($staffId);

        $roleAssignments = StaffRoleAssignment::with(['role.permissions', 'assignedBy'])
            ->where('staff_id', $staffId)
            ->get();

        $directPermissions = StaffDirectPermission::with(['permission', 'assignedBy'])
            ->where('staff_id', $staffId)
            ->get();

        $availableRoles = SchoolRole::where('tenant_id', $school->id)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'is_system']);

        $allPermissions = Permission::orderBy('name')->get()->groupBy(function ($p) {
            return explode(':', $p->name)[0] ?? 'other';
        });

        return Inertia::render('school/staff/Permissions', [
            'staff'              => $staff,
            'roleAssignments'    => $roleAssignments,
            'directPermissions'  => $directPermissions,
            'availableRoles'     => $availableRoles,
            'allPermissions'     => $allPermissions,
        ]);
    }

    /**
     * Assign a school role to a staff member.
     */
    public function assignRole(Request $request, int $staffId, int $roleId): RedirectResponse
    {
        $school = auth()->user()->school;
        $staff  = User::where('school_id', $school->id)->findOrFail($staffId);
        $role   = SchoolRole::where('tenant_id', $school->id)->findOrFail($roleId);

        $validated = $request->validate([
            'expires_at' => 'nullable|date|after:today',
        ]);

        StaffRoleAssignment::updateOrCreate(
            ['staff_id' => $staffId, 'role_id' => $roleId],
            [
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
                'expires_at'  => $validated['expires_at'] ?? null,
            ]
        );

        return back()->with('success', "Role '{$role->name}' assigned to {$staff->name}.");
    }

    /**
     * Remove a school role from a staff member.
     */
    public function removeRole(int $staffId, int $roleId): RedirectResponse
    {
        $school = auth()->user()->school;
        User::where('school_id', $school->id)->findOrFail($staffId);
        $role = SchoolRole::where('tenant_id', $school->id)->findOrFail($roleId);

        StaffRoleAssignment::where('staff_id', $staffId)
            ->where('role_id', $roleId)
            ->delete();

        return back()->with('success', "Role '{$role->name}' removed.");
    }

    /**
     * Grant a direct permission to a staff member.
     */
    public function addDirectPermission(Request $request, int $staffId, int $permissionId): RedirectResponse
    {
        $school = auth()->user()->school;
        $staff  = User::where('school_id', $school->id)->findOrFail($staffId);
        $perm   = Permission::findOrFail($permissionId);

        $validated = $request->validate([
            'expires_at' => 'nullable|date|after:today',
        ]);

        StaffDirectPermission::updateOrCreate(
            ['staff_id' => $staffId, 'permission_id' => $permissionId],
            [
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
                'expires_at'  => $validated['expires_at'] ?? null,
            ]
        );

        return back()->with('success', "Permission '{$perm->name}' granted to {$staff->name}.");
    }

    /**
     * Revoke a direct permission from a staff member.
     */
    public function removeDirectPermission(int $staffId, int $permissionId): RedirectResponse
    {
        $school = auth()->user()->school;
        User::where('school_id', $school->id)->findOrFail($staffId);
        $perm = Permission::findOrFail($permissionId);

        StaffDirectPermission::where('staff_id', $staffId)
            ->where('permission_id', $permissionId)
            ->delete();

        return back()->with('success', "Permission '{$perm->name}' revoked.");
    }

    /**
     * API endpoint: Get the effective permissions for a staff member
     * (union of role permissions + direct permissions, minus expired ones).
     */
    public function getEffectivePermissions(int $staffId): JsonResponse
    {
        $school = auth()->user()->school;
        User::where('school_id', $school->id)->findOrFail($staffId);

        // Role-based permissions (non-expired)
        $rolePermissions = StaffRoleAssignment::with('role.permissions')
            ->where('staff_id', $staffId)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get()
            ->flatMap(fn ($assignment) => $assignment->role->getEffectivePermissions());

        // Direct permissions (non-expired)
        $directPermissions = StaffDirectPermission::with('permission')
            ->where('staff_id', $staffId)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get()
            ->pluck('permission');

        $all = $rolePermissions->merge($directPermissions)->unique('id')->values();

        return response()->json([
            'permissions' => $all->pluck('name'),
        ]);
    }
}
