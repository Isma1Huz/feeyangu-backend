<?php

namespace Tests\Feature\Admin;

use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\School;
use App\Models\Student;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Super Admin – School Usage monitoring and export.
 */
class SchoolUsageTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSuperAdmin(): User
    {
        $admin = User::factory()->create(['email_verified_at' => now()]);
        $admin->assignRole('super_admin');
        return $admin;
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_super_admin_can_view_school_usage_overview(): void
    {
        $admin = $this->createSuperAdmin();
        School::factory()->count(2)->create();

        $response = $this->actingAs($admin)->get('/admin/schools/usage');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/schools/Usage')
                ->has('schools')
        );
    }

    public function test_usage_overview_includes_student_and_staff_counts(): void
    {
        $admin  = $this->createSuperAdmin();
        $plan   = SubscriptionPlan::factory()->create(['student_limit' => 100, 'staff_limit' => 10]);
        $school = School::factory()->create(['plan_id' => $plan->id]);

        $response = $this->actingAs($admin)->get('/admin/schools/usage');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->has('schools.0.students')
                ->has('schools.0.staff')
                ->has('schools.0.plan_name')
                ->has('schools.0.subscription_status')
        );
    }

    public function test_usage_near_limit_flag_is_set_at_80_percent(): void
    {
        $admin  = $this->createSuperAdmin();
        $plan   = SubscriptionPlan::factory()->create(['student_limit' => 100, 'staff_limit' => 10]);
        $school = School::factory()->create(['plan_id' => $plan->id]);
        $grade  = Grade::factory()->create(['school_id' => $school->id]);
        $class  = GradeClass::factory()->create(['grade_id' => $grade->id]);

        // Create 80 students (80% of the limit)
        Student::factory()->count(80)->create([
            'school_id' => $school->id,
            'grade_id'  => $grade->id,
            'class_id'  => $class->id,
        ]);

        $response = $this->actingAs($admin)->get('/admin/schools/usage');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->where('schools.0.students.near_limit', true)
                ->where('schools.0.students.at_limit', false)
        );
    }

    public function test_usage_at_limit_flag_is_set_when_limit_reached(): void
    {
        $admin  = $this->createSuperAdmin();
        $plan   = SubscriptionPlan::factory()->create(['student_limit' => 5, 'staff_limit' => 10]);
        $school = School::factory()->create(['plan_id' => $plan->id]);
        $grade  = Grade::factory()->create(['school_id' => $school->id]);
        $class  = GradeClass::factory()->create(['grade_id' => $grade->id]);

        Student::factory()->count(5)->create([
            'school_id' => $school->id,
            'grade_id'  => $grade->id,
            'class_id'  => $class->id,
        ]);

        $response = $this->actingAs($admin)->get('/admin/schools/usage');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->where('schools.0.students.at_limit', true)
        );
    }

    // -------------------------------------------------------------------------
    // Detail
    // -------------------------------------------------------------------------

    public function test_super_admin_can_view_individual_school_usage_detail(): void
    {
        $admin  = $this->createSuperAdmin();
        $plan   = SubscriptionPlan::factory()->create(['student_limit' => 200, 'staff_limit' => 20]);
        $school = School::factory()->create(['plan_id' => $plan->id]);

        $response = $this->actingAs($admin)->get("/admin/schools/{$school->id}/usage");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/schools/UsageDetail')
                ->has('school')
                ->has('school.students')
                ->has('school.staff')
        );
    }

    public function test_usage_detail_returns_404_for_nonexistent_school(): void
    {
        $admin    = $this->createSuperAdmin();
        $response = $this->actingAs($admin)->get('/admin/schools/99999/usage');

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Export
    // -------------------------------------------------------------------------

    public function test_super_admin_can_export_usage_as_csv(): void
    {
        $admin = $this->createSuperAdmin();
        School::factory()->count(2)->create();

        $response = $this->actingAs($admin)->get('/admin/schools/usage/export');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_csv_export_contains_school_data(): void
    {
        $admin  = $this->createSuperAdmin();
        $school = School::factory()->create(['name' => 'Sunrise Academy']);

        $response = $this->actingAs($admin)->get('/admin/schools/usage/export');

        $response->assertOk();
        $this->assertStringContainsString('Sunrise Academy', $response->streamedContent());
    }

    public function test_non_admin_cannot_view_school_usage(): void
    {
        $school = School::factory()->create();
        $user   = User::factory()->create([
            'school_id'          => $school->id,
            'email_verified_at'  => now(),
        ]);
        $user->assignRole('school_admin');

        $response = $this->actingAs($user)->get('/admin/schools/usage');

        $response->assertForbidden();
    }
}
