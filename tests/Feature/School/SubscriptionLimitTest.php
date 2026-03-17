<?php

namespace Tests\Feature\School;

use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\School;
use App\Models\Student;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Subscription Limit enforcement (Phase 0).
 */
class SubscriptionLimitTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSchoolAdminWithPlan(array $planAttrs = []): array
    {
        $plan = SubscriptionPlan::factory()->create(array_merge([
            'student_limit' => 5,
            'staff_limit'   => 3,
        ], $planAttrs));

        $school = School::factory()->create(['plan_id' => $plan->id]);
        $admin  = User::factory()->create([
            'school_id'         => $school->id,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('school_admin');

        $grade = Grade::factory()->create(['school_id' => $school->id]);
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);

        return [$school, $admin, $plan, $grade, $class];
    }

    private function studentPayload(int $gradeId, int $classId, string $admNo = 'ADM-001'): array
    {
        return [
            'first_name'       => 'Jane',
            'last_name'        => 'Doe',
            'admission_number' => $admNo,
            'grade_id'         => $gradeId,
            'class_id'         => $classId,
            'status'           => 'active',
        ];
    }

    // -------------------------------------------------------------------------
    // Students
    // -------------------------------------------------------------------------

    public function test_student_creation_is_allowed_within_limit(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['student_limit' => 10]);

        $response = $this->actingAs($admin)
            ->post('/school/students', $this->studentPayload($grade->id, $class->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            'school_id'        => $school->id,
            'admission_number' => 'ADM-001',
        ]);
    }

    public function test_student_creation_blocked_when_at_limit(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['student_limit' => 2]);

        // Fill up the limit
        Student::factory()->count(2)->create([
            'school_id' => $school->id,
            'grade_id'  => $grade->id,
            'class_id'  => $class->id,
        ]);

        $response = $this->actingAs($admin)
            ->post('/school/students', $this->studentPayload($grade->id, $class->id));

        $response->assertForbidden();
        $this->assertDatabaseMissing('students', [
            'school_id'        => $school->id,
            'admission_number' => 'ADM-001',
        ]);
    }

    public function test_student_creation_allowed_with_unlimited_plan(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['student_limit' => 0]);

        // Create many students – should not be blocked
        Student::factory()->count(100)->create([
            'school_id' => $school->id,
            'grade_id'  => $grade->id,
            'class_id'  => $class->id,
        ]);

        $response = $this->actingAs($admin)
            ->post('/school/students', $this->studentPayload($grade->id, $class->id));

        // Should not be blocked (203 redirect or 422 for other validation reasons, but NOT 403)
        $this->assertNotSame(403, $response->getStatusCode());
    }

    // -------------------------------------------------------------------------
    // Staff
    // -------------------------------------------------------------------------

    public function test_staff_creation_blocked_when_at_limit(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['staff_limit' => 1]);

        // The admin already counts as 1 staff member in the school
        $response = $this->actingAs($admin)->post('/school/users', [
            'name'     => 'New Staff',
            'email'    => 'newstaff@example.com',
            'role'     => 'accountant',
            'password' => 'password123',
        ]);

        // The admin already occupies the 1 slot, so the new one should be blocked
        $response->assertForbidden();
    }

    public function test_staff_creation_allowed_within_limit(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['staff_limit' => 10]);

        $response = $this->actingAs($admin)->post('/school/users', [
            'name'     => 'New Staff',
            'email'    => 'newstaff@example.com',
            'role'     => 'accountant',
            'password' => 'password123',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'newstaff@example.com']);
    }

    // -------------------------------------------------------------------------
    // Subscription Service - getRemainingSlots
    // -------------------------------------------------------------------------

    public function test_remaining_slots_returns_correct_count(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['student_limit' => 10]);

        Student::factory()->count(3)->create([
            'school_id' => $school->id,
            'grade_id'  => $grade->id,
            'class_id'  => $class->id,
        ]);

        $remaining = app(\App\Services\SubscriptionService::class)
            ->getRemainingSlots($school, 'students');

        $this->assertSame(7, $remaining);
    }

    public function test_remaining_slots_returns_null_for_unlimited(): void
    {
        [$school, $admin, $plan, $grade, $class] = $this->createSchoolAdminWithPlan(['student_limit' => 0]);

        $remaining = app(\App\Services\SubscriptionService::class)
            ->getRemainingSlots($school, 'students');

        $this->assertNull($remaining);
    }
}
