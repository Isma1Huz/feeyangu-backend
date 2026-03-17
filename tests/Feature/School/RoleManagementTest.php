<?php

namespace Tests\Feature\School;

use App\Models\School;
use App\Models\SchoolRole;
use App\Models\User;
use App\Services\ModuleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Feature tests for School Admin – Role Management (Phase 0).
 */
class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSchoolAdmin(): array
    {
        $school = School::factory()->create();
        $admin  = User::factory()->create([
            'school_id'          => $school->id,
            'email_verified_at'  => now(),
        ]);
        $admin->assignRole('school_admin');
        return [$school, $admin];
    }

    private function seedModules(): void
    {
        app(ModuleService::class)->registerModules();
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_roles(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        SchoolRole::factory()->forSchool($school)->count(2)->create();

        $response = $this->actingAs($admin)->get('/school/roles');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/roles/Index')
                ->has('roles')
        );
    }

    public function test_roles_are_scoped_to_authenticated_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        SchoolRole::factory()->forSchool($school)->count(2)->create();

        // Roles for another school — must not appear
        $otherSchool = School::factory()->create();
        SchoolRole::factory()->forSchool($otherSchool)->count(3)->create();

        $response = $this->actingAs($admin)->get('/school/roles');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page->has('roles', 2)
        );
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_school_admin_can_view_create_role_form(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $this->seedModules();

        $response = $this->actingAs($admin)->get('/school/roles/create');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/roles/Create')
                ->has('enabledModules')
                ->has('allPermissions')
                ->has('availableParents')
        );
    }

    public function test_school_admin_can_create_role(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $this->seedModules();

        $response = $this->actingAs($admin)->post('/school/roles', [
            'name'        => 'Librarian',
            'description' => 'Manages the school library.',
        ]);

        $response->assertRedirect('/school/roles');
        $this->assertDatabaseHas('school_roles', [
            'tenant_id' => $school->id,
            'name'      => 'Librarian',
        ]);
    }

    public function test_create_role_with_permissions_saves_to_pivot(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $this->seedModules();

        $permission = Permission::firstOrCreate(['name' => 'finance:view_fees', 'guard_name' => 'web']);

        $this->actingAs($admin)->post('/school/roles', [
            'name'           => 'Finance Viewer',
            'permission_ids' => [$permission->id],
        ]);

        $role = SchoolRole::where('tenant_id', $school->id)->where('name', 'Finance Viewer')->first();
        $this->assertNotNull($role);
        $this->assertDatabaseHas('school_role_permissions', [
            'role_id'       => $role->id,
            'permission_id' => $permission->id,
        ]);
    }

    public function test_create_role_fails_with_duplicate_name_in_same_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        SchoolRole::factory()->forSchool($school)->create(['name' => 'Librarian']);

        $response = $this->actingAs($admin)->post('/school/roles', ['name' => 'Librarian']);

        $response->assertSessionHasErrors('name');
    }

    public function test_create_role_fails_without_name(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/roles', []);

        $response->assertSessionHasErrors('name');
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_school_admin_can_view_role_detail(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role = SchoolRole::factory()->forSchool($school)->create();

        $response = $this->actingAs($admin)->get("/school/roles/{$role->id}");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/roles/Show')
                ->has('role')
                ->has('role.permissions')
                ->has('role.staff')
        );
    }

    public function test_cannot_view_role_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $otherSchool = School::factory()->create();
        $otherRole   = SchoolRole::factory()->forSchool($otherSchool)->create();

        $response = $this->actingAs($admin)->get("/school/roles/{$otherRole->id}");

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Edit / Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_view_edit_form(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $this->seedModules();
        $role = SchoolRole::factory()->forSchool($school)->create();

        $response = $this->actingAs($admin)->get("/school/roles/{$role->id}/edit");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/roles/Edit')
                ->has('role')
                ->has('enabledModules')
                ->has('allPermissions')
        );
    }

    public function test_school_admin_can_update_role(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role = SchoolRole::factory()->forSchool($school)->create(['name' => 'Old Name']);

        $response = $this->actingAs($admin)->put("/school/roles/{$role->id}", [
            'name'           => 'New Name',
            'description'    => 'Updated description',
            'permission_ids' => [],
        ]);

        $response->assertRedirect("/school/roles/{$role->id}");
        $this->assertDatabaseHas('school_roles', [
            'id'   => $role->id,
            'name' => 'New Name',
        ]);
    }

    public function test_system_role_name_cannot_be_changed(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role = SchoolRole::factory()->forSchool($school)->create([
            'name'      => 'Principal',
            'is_system' => true,
        ]);

        $this->actingAs($admin)->put("/school/roles/{$role->id}", [
            'permission_ids' => [],
        ]);

        // Name should remain unchanged
        $this->assertDatabaseHas('school_roles', [
            'id'   => $role->id,
            'name' => 'Principal',
        ]);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_custom_role_with_no_assignments(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role = SchoolRole::factory()->forSchool($school)->create();

        $response = $this->actingAs($admin)->delete("/school/roles/{$role->id}");

        $response->assertRedirect('/school/roles');
        $this->assertDatabaseMissing('school_roles', ['id' => $role->id]);
    }

    public function test_system_role_cannot_be_deleted(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role = SchoolRole::factory()->forSchool($school)->create(['is_system' => true]);

        $response = $this->actingAs($admin)->delete("/school/roles/{$role->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('school_roles', ['id' => $role->id]);
    }

    public function test_role_with_assignments_cannot_be_deleted(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role  = SchoolRole::factory()->forSchool($school)->create();
        $staff = User::factory()->create([
            'school_id'         => $school->id,
            'email_verified_at' => now(),
        ]);

        DB::table('staff_role_assignments')->insert([
            'staff_id'    => $staff->id,
            'role_id'     => $role->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($admin)->delete("/school/roles/{$role->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('school_roles', ['id' => $role->id]);
    }

    // -------------------------------------------------------------------------
    // Duplicate
    // -------------------------------------------------------------------------

    public function test_school_admin_can_duplicate_role(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $role = SchoolRole::factory()->forSchool($school)->create(['name' => 'Librarian']);

        $before   = SchoolRole::where('tenant_id', $school->id)->count();
        $response = $this->actingAs($admin)->post("/school/roles/{$role->id}/duplicate");

        $response->assertRedirect('/school/roles');
        $this->assertSame($before + 1, SchoolRole::where('tenant_id', $school->id)->count());
        $this->assertDatabaseHas('school_roles', [
            'tenant_id' => $school->id,
            'name'      => 'Librarian (Copy)',
        ]);
    }
}
