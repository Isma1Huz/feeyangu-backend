<?php

namespace Tests\Feature\School;

use App\Models\School;
use App\Models\SchoolRole;
use App\Models\StaffDirectPermission;
use App\Models\StaffRoleAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Feature tests for School Admin – Staff Permission assignment (Phase 0).
 */
class StaffPermissionTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSchoolAdmin(): array
    {
        $school = School::factory()->create();
        $admin  = User::factory()->create([
            'school_id'         => $school->id,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('school_admin');
        return [$school, $admin];
    }

    private function createStaff(School $school): User
    {
        return User::factory()->create([
            'school_id'         => $school->id,
            'email_verified_at' => now(),
        ]);
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_view_staff_permissions_page(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);

        $response = $this->actingAs($admin)->get("/school/staff/{$staff->id}/permissions");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/staff/Permissions')
                ->has('staff')
                ->has('roleAssignments')
                ->has('directPermissions')
                ->has('availableRoles')
                ->has('allPermissions')
        );
    }

    public function test_cannot_view_permissions_for_staff_in_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $otherSchool = School::factory()->create();
        $otherStaff  = $this->createStaff($otherSchool);

        $response = $this->actingAs($admin)->get("/school/staff/{$otherStaff->id}/permissions");

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Assign Role
    // -------------------------------------------------------------------------

    public function test_school_admin_can_assign_role_to_staff(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);
        $role  = SchoolRole::factory()->forSchool($school)->create();

        $response = $this->actingAs($admin)
            ->post("/school/staff/{$staff->id}/roles/{$role->id}");

        $response->assertRedirect();
        $this->assertDatabaseHas('staff_role_assignments', [
            'staff_id' => $staff->id,
            'role_id'  => $role->id,
        ]);
    }

    public function test_assigning_role_from_another_school_is_rejected(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff       = $this->createStaff($school);
        $otherSchool = School::factory()->create();
        $otherRole   = SchoolRole::factory()->forSchool($otherSchool)->create();

        $response = $this->actingAs($admin)
            ->post("/school/staff/{$staff->id}/roles/{$otherRole->id}");

        $response->assertNotFound();
        $this->assertDatabaseMissing('staff_role_assignments', [
            'staff_id' => $staff->id,
            'role_id'  => $otherRole->id,
        ]);
    }

    public function test_assign_role_with_expiry_date(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);
        $role  = SchoolRole::factory()->forSchool($school)->create();

        $expiresAt = now()->addDays(30)->format('Y-m-d');
        $this->actingAs($admin)->post("/school/staff/{$staff->id}/roles/{$role->id}", [
            'expires_at' => $expiresAt,
        ]);

        $this->assertDatabaseHas('staff_role_assignments', [
            'staff_id' => $staff->id,
            'role_id'  => $role->id,
        ]);
    }

    // -------------------------------------------------------------------------
    // Remove Role
    // -------------------------------------------------------------------------

    public function test_school_admin_can_remove_role_from_staff(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);
        $role  = SchoolRole::factory()->forSchool($school)->create();

        StaffRoleAssignment::create([
            'staff_id'    => $staff->id,
            'role_id'     => $role->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->delete("/school/staff/{$staff->id}/roles/{$role->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('staff_role_assignments', [
            'staff_id' => $staff->id,
            'role_id'  => $role->id,
        ]);
    }

    // -------------------------------------------------------------------------
    // Direct Permissions
    // -------------------------------------------------------------------------

    public function test_school_admin_can_add_direct_permission_to_staff(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);
        $perm  = Permission::firstOrCreate(['name' => 'finance:view_fees', 'guard_name' => 'web']);

        $response = $this->actingAs($admin)
            ->post("/school/staff/{$staff->id}/permissions/{$perm->id}");

        $response->assertRedirect();
        $this->assertDatabaseHas('staff_direct_permissions', [
            'staff_id'      => $staff->id,
            'permission_id' => $perm->id,
        ]);
    }

    public function test_school_admin_can_remove_direct_permission_from_staff(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);
        $perm  = Permission::firstOrCreate(['name' => 'academics:view_classes', 'guard_name' => 'web']);

        StaffDirectPermission::create([
            'staff_id'      => $staff->id,
            'permission_id' => $perm->id,
            'assigned_at'   => now(),
        ]);

        $response = $this->actingAs($admin)
            ->delete("/school/staff/{$staff->id}/permissions/{$perm->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('staff_direct_permissions', [
            'staff_id'      => $staff->id,
            'permission_id' => $perm->id,
        ]);
    }

    // -------------------------------------------------------------------------
    // Effective Permissions (API)
    // -------------------------------------------------------------------------

    public function test_effective_permissions_returns_union_of_roles_and_direct(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);

        $role  = SchoolRole::factory()->forSchool($school)->create();
        $perm1 = Permission::firstOrCreate(['name' => 'academics:view', 'guard_name' => 'web']);
        $perm2 = Permission::firstOrCreate(['name' => 'finance:view', 'guard_name' => 'web']);

        // Assign perm1 via role
        $role->permissions()->sync([$perm1->id]);
        StaffRoleAssignment::create(['staff_id' => $staff->id, 'role_id' => $role->id, 'assigned_at' => now()]);

        // Assign perm2 as direct
        StaffDirectPermission::create([
            'staff_id'      => $staff->id,
            'permission_id' => $perm2->id,
            'assigned_at'   => now(),
        ]);

        $response = $this->actingAs($admin)
            ->getJson("/school/staff/{$staff->id}/permissions/effective");

        $response->assertOk();
        $response->assertJsonStructure(['permissions']);
        $permissions = $response->json('permissions');
        $this->assertContains('academics:view', $permissions);
        $this->assertContains('finance:view', $permissions);
    }

    public function test_effective_permissions_excludes_expired_assignments(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $staff = $this->createStaff($school);
        $role  = SchoolRole::factory()->forSchool($school)->create();
        $perm  = Permission::firstOrCreate(['name' => 'transport:view', 'guard_name' => 'web']);

        $role->permissions()->sync([$perm->id]);

        // Assign expired role
        StaffRoleAssignment::create([
            'staff_id'    => $staff->id,
            'role_id'     => $role->id,
            'assigned_at' => now()->subDays(10),
            'expires_at'  => now()->subDays(1), // already expired
        ]);

        $response = $this->actingAs($admin)
            ->getJson("/school/staff/{$staff->id}/permissions/effective");

        $response->assertOk();
        $this->assertNotContains('transport:view', $response->json('permissions'));
    }
}
