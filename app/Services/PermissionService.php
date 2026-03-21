<?php

namespace App\Services;

use App\Models\School;
use App\Models\StaffDirectPermission;
use App\Models\StaffRoleAssignment;
use App\Models\User;
use Illuminate\Support\Collection;

class PermissionService
{
    /**
     * Get all effective permissions for a user (alias matching architecture spec).
     * Returns the same result as getUserPermissions().
     */
    public function getUserEffectivePermissions(User $user, School $school): \Illuminate\Support\Collection
    {
        return $this->getUserPermissions($user, $school);
    }

    /**
     * Check if a user has a specific permission (alias matching architecture spec).
     */
    public function checkUserPermission(User $user, School $school, string $permission): bool
    {
        return $this->userHasPermission($user, $school, $permission);
    }

    /**
     * Sync all permissions for a Spatie role by name.
     *
     * @param  string   $roleName    Spatie role name
     * @param  string[] $permissions Array of permission names to assign
     */
    public function syncRolePermissions(string $roleName, array $permissions): void
    {
        $role = \Spatie\Permission\Models\Role::findByName($roleName);
        $role->syncPermissions($permissions);
    }

    /**
     * Get all permission names assigned to a user (via direct permissions and role assignments).
     */
    public function getUserPermissions(User $user, School $school): Collection
    {
        // Spatie role-based permissions
        $spatiePermissions = $user->getAllPermissions()->pluck('name');

        // Direct school-level permissions (via StaffDirectPermission)
        $directPermissions = StaffDirectPermission::with('permission')
            ->where('staff_id', $user->id)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get()
            ->pluck('permission.name')
            ->filter();

        // Role-based permissions (via StaffRoleAssignment → SchoolRole → permissions)
        $rolePermissions = StaffRoleAssignment::with('role.permissions')
            ->where('staff_id', $user->id)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get()
            ->flatMap(fn ($assignment) => $assignment->role?->permissions?->pluck('name') ?? collect());

        return $spatiePermissions->merge($directPermissions)->merge($rolePermissions)->unique()->values();
    }

    /**
     * Check if a user has a specific permission within a school context.
     */
    public function userHasPermission(User $user, School $school, string $permission): bool
    {
        return $user->hasPermissionTo($permission)
            || $this->getUserPermissions($user, $school)->contains($permission);
    }

    /**
     * Check if a user has any of the given permissions within a school context.
     */
    public function userHasAnyPermission(User $user, School $school, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->userHasPermission($user, $school, $permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Grant a direct Spatie permission to a user.
     */
    public function grantPermission(User $user, School $school, string $permission): void
    {
        $user->givePermissionTo($permission);
    }

    /**
     * Revoke a direct Spatie permission from a user.
     */
    public function revokePermission(User $user, School $school, string $permission): void
    {
        $user->revokePermissionTo($permission);
    }
}
