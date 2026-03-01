<?php

namespace Tests\Feature\School;

use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for School Admin – Grade Class management.
 */
class GradeClassTest extends TestCase
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
        $grade = Grade::factory()->create(['school_id' => $school->id, 'sort_order' => 1]);
        return [$school, $admin, $grade];
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_classes(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();
        GradeClass::factory()->count(3)->create(['grade_id' => $grade->id]);

        $response = $this->actingAs($admin)->get('/school/classes');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page->has('grades')
        );
    }

    public function test_classes_are_scoped_to_school(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();
        GradeClass::factory()->count(2)->create(['grade_id' => $grade->id]);

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);
        GradeClass::factory()->count(5)->create(['grade_id' => $otherGrade->id]);

        $response = $this->actingAs($admin)->get('/school/classes');

        $response->assertOk();
        // The 'classes' prop contains paginated items
        $response->assertInertia(
            fn ($page) => $page->where('classes.total', 2)
        );
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_class(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/classes', [
            'grade_id' => $grade->id,
            'name' => '1A',
            'teacher_name' => 'Mrs. Test',
            'capacity' => 30,
        ]);

        $response->assertRedirect('/school/classes');
        $this->assertDatabaseHas('grade_classes', [
            'grade_id' => $grade->id,
            'name' => '1A',
        ]);
    }

    public function test_class_store_fails_without_required_fields(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/classes', []);

        $response->assertSessionHasErrors(['grade_id', 'name', 'capacity']);
        $this->assertDatabaseCount('grade_classes', 0);
    }

    public function test_class_store_rejects_grade_from_another_school(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->post('/school/classes', [
            'grade_id' => $foreignGrade->id,
            'name' => '1B',
            'capacity' => 30,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('grade_classes', 0);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_class(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);

        $response = $this->actingAs($admin)->put("/school/classes/{$class->id}", [
            'grade_id' => $grade->id,
            'name' => 'Updated Class',
            'teacher_name' => 'Mr. Updated',
            'capacity' => 35,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('grade_classes', [
            'id' => $class->id,
            'name' => 'Updated Class',
        ]);
    }

    public function test_school_admin_cannot_update_class_from_another_school(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);
        $foreignClass = GradeClass::factory()->create(['grade_id' => $otherGrade->id]);

        $response = $this->actingAs($admin)->put("/school/classes/{$foreignClass->id}", [
            'grade_id' => $grade->id,
            'name' => 'Hacked',
            'capacity' => 30,
        ]);

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_empty_class(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);

        $response = $this->actingAs($admin)->delete("/school/classes/{$class->id}");

        $response->assertRedirect('/school/classes');
        $this->assertDatabaseMissing('grade_classes', ['id' => $class->id]);
    }

    public function test_school_admin_cannot_delete_class_with_enrolled_students(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);
        Student::factory()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/classes/{$class->id}");

        $response->assertRedirect('/school/classes');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('grade_classes', ['id' => $class->id]);
    }

    public function test_school_admin_cannot_delete_class_from_another_school(): void
    {
        [$school, $admin, $grade] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);
        $foreignClass = GradeClass::factory()->create(['grade_id' => $otherGrade->id]);

        $response = $this->actingAs($admin)->delete("/school/classes/{$foreignClass->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('grade_classes', ['id' => $foreignClass->id]);
    }
}
