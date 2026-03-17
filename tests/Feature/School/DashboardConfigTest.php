<?php

namespace Tests\Feature\School;

use App\Models\DashboardConfig;
use App\Models\School;
use App\Models\User;
use App\Models\UserDashboardOverride;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for School Admin – Dashboard Configuration (Phase 0).
 */
class DashboardConfigTest extends TestCase
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

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_view_dashboard_config(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->get('/school/dashboard-config');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/settings/DashboardVisibility')
                ->has('configs')
                ->has('userTypes')
                ->has('availableWidgets')
        );
    }

    public function test_dashboard_config_returns_defaults_when_none_saved(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->get('/school/dashboard-config');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->has('configs.parent')
                ->has('configs.student')
                ->has('configs.teacher')
                ->has('configs.staff')
                ->has('configs.principal')
        );
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_dashboard_config_for_user_type(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->put('/school/dashboard-config/parent', [
            'config' => [
                'show_fee_balance'        => true,
                'show_attendance_summary' => false,
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('dashboard_configs', [
            'tenant_id'    => $school->id,
            'user_type'    => 'parent',
            'config_key'   => 'show_fee_balance',
            'config_value' => true,
        ]);
        $this->assertDatabaseHas('dashboard_configs', [
            'tenant_id'    => $school->id,
            'user_type'    => 'parent',
            'config_key'   => 'show_attendance_summary',
            'config_value' => false,
        ]);
    }

    public function test_update_is_idempotent_for_same_config_key(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        // Update twice
        $this->actingAs($admin)->put('/school/dashboard-config/teacher', [
            'config' => ['show_timetable' => true],
        ]);
        $this->actingAs($admin)->put('/school/dashboard-config/teacher', [
            'config' => ['show_timetable' => false],
        ]);

        $this->assertSame(
            1,
            DashboardConfig::where('tenant_id', $school->id)
                ->where('user_type', 'teacher')
                ->where('config_key', 'show_timetable')
                ->count()
        );
        $this->assertDatabaseHas('dashboard_configs', [
            'tenant_id'    => $school->id,
            'user_type'    => 'teacher',
            'config_key'   => 'show_timetable',
            'config_value' => false,
        ]);
    }

    public function test_update_rejects_invalid_user_type(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->put('/school/dashboard-config/superuser', [
            'config' => ['show_timetable' => true],
        ]);

        $response->assertStatus(422);
    }

    public function test_update_ignores_unknown_config_keys(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->put('/school/dashboard-config/student', [
            'config' => [
                'show_timetable'       => true,
                'nonexistent_widget'   => true,   // should be ignored
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('dashboard_configs', [
            'config_key' => 'nonexistent_widget',
        ]);
    }

    // -------------------------------------------------------------------------
    // User Override
    // -------------------------------------------------------------------------

    public function test_school_admin_can_set_user_specific_override(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $user = User::factory()->create([
            'school_id'         => $school->id,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post("/school/dashboard-config/user/{$user->id}", [
            'config_key'   => 'show_notifications',
            'config_value' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('user_dashboard_overrides', [
            'user_id'      => $user->id,
            'config_key'   => 'show_notifications',
            'config_value' => false,
        ]);
    }

    public function test_cannot_override_for_user_in_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $otherSchool = School::factory()->create();
        $otherUser   = User::factory()->create([
            'school_id'         => $otherSchool->id,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post("/school/dashboard-config/user/{$otherUser->id}", [
            'config_key'   => 'show_notifications',
            'config_value' => false,
        ]);

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Reset to Default
    // -------------------------------------------------------------------------

    public function test_school_admin_can_reset_config_for_user_type(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        DashboardConfig::create([
            'tenant_id'    => $school->id,
            'user_type'    => 'student',
            'config_key'   => 'show_timetable',
            'config_value' => false,
            'created_by'   => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post('/school/dashboard-config/reset/student');

        $response->assertRedirect();
        $this->assertDatabaseMissing('dashboard_configs', [
            'tenant_id' => $school->id,
            'user_type' => 'student',
        ]);
    }
}
