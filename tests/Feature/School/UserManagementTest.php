<?php

namespace Tests\Feature\School;

use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Feature tests for School Admin – User (Accountant) management.
 */
class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSchoolAdmin(): array
    {
        $school = School::factory()->create();
        $admin = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('school_admin');
        return [$school, $admin];
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_users(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/school/users');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/Users')
                ->has('users')
        );
    }

    public function test_users_are_scoped_to_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        // Our school: 1 additional user (+ admin = 2 total)
        User::factory()->create(['school_id' => $school->id, 'email_verified_at' => now()]);

        // Another school's users (must NOT appear)
        $otherSchool = School::factory()->create();
        User::factory()->count(3)->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->get('/school/users');

        $response->assertOk();
        // 2 users total (admin + 1 extra) for this school
        $response->assertInertia(fn ($page) => $page->has('users', 2));
    }

    // -------------------------------------------------------------------------
    // Store (create accountant)
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_accountant(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/users', [
            'name' => 'New Accountant',
            'email' => 'accountant@school.test',
            'password' => 'Password123!',
        ]);

        $response->assertRedirect('/school/users');
        $this->assertDatabaseHas('users', [
            'name' => 'New Accountant',
            'email' => 'accountant@school.test',
            'school_id' => $school->id,
        ]);

        $newUser = User::where('email', 'accountant@school.test')->first();
        $this->assertTrue($newUser->hasRole('accountant'));
    }

    public function test_user_store_fails_without_required_fields(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/users', []);

        $response->assertSessionHasErrors(['name', 'email', 'password']);
    }

    public function test_user_store_fails_with_duplicate_email(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->actingAs($admin)->post('/school/users', [
            'name' => 'Another User',
            'email' => 'existing@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_user_store_fails_with_short_password(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/users', [
            'name' => 'Test User',
            'email' => 'test@school.test',
            'password' => 'short', // less than 8 chars
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_user(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $accountant = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $accountant->assignRole('accountant');

        $response = $this->actingAs($admin)->put("/school/users/{$accountant->id}", [
            'name' => 'Updated Name',
            'email' => 'updated@school.test',
            'status' => 'active',
        ]);

        $response->assertRedirect('/school/users');
        $this->assertDatabaseHas('users', [
            'id' => $accountant->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_school_admin_cannot_update_user_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignUser = User::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->put("/school/users/{$foreignUser->id}", [
            'name' => 'Hacked',
            'email' => 'hacked@test.com',
            'status' => 'active',
        ]);

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_accountant(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $accountant = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $accountant->assignRole('accountant');

        $response = $this->actingAs($admin)->delete("/school/users/{$accountant->id}");

        $response->assertRedirect('/school/users');
        $this->assertDatabaseMissing('users', ['id' => $accountant->id]);
    }

    public function test_school_admin_cannot_delete_another_school_admin(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $anotherAdmin = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $anotherAdmin->assignRole('school_admin');

        $response = $this->actingAs($admin)->delete("/school/users/{$anotherAdmin->id}");

        // Should redirect with error, not actually delete
        $response->assertRedirect('/school/users');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $anotherAdmin->id]);
    }

    public function test_school_admin_cannot_delete_user_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignUser = User::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->delete("/school/users/{$foreignUser->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $foreignUser->id]);
    }

    public function test_delete_nonexistent_user_returns_404(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->delete('/school/users/999999');

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    public function test_accountant_cannot_manage_users(): void
    {
        $school = School::factory()->create();
        $accountant = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $accountant->assignRole('accountant');

        $response = $this->actingAs($accountant)->get('/school/users');

        $response->assertForbidden();
    }
}
