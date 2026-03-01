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
 * Feature tests for the School Admin – Student management.
 */
class StudentTest extends TestCase
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
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);

        return [$school, $admin, $grade, $class];
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_students(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        Student::factory()->count(3)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->get('/school/students');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/Students')
                ->has('students', 3)
                ->has('grades')
                ->has('filters')
        );
    }

    public function test_students_are_scoped_to_authenticated_school(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        // Students from our school
        Student::factory()->count(2)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        // Students from another school (must NOT appear)
        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id, 'sort_order' => 1]);
        $otherClass = GradeClass::factory()->create(['grade_id' => $otherGrade->id]);
        Student::factory()->count(5)->create([
            'school_id' => $otherSchool->id,
            'grade_id' => $otherGrade->id,
            'class_id' => $otherClass->id,
        ]);

        $response = $this->actingAs($admin)->get('/school/students');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page->has('students', 2)
        );
    }

    public function test_students_list_filters_by_status(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        Student::factory()->count(2)->active()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);
        Student::factory()->count(3)->inactive()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->get('/school/students?status=active');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('students', 2));
    }

    public function test_students_list_filters_by_grade(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $otherGrade = Grade::factory()->create(['school_id' => $school->id, 'sort_order' => 2]);
        $otherClass = GradeClass::factory()->create(['grade_id' => $otherGrade->id]);

        Student::factory()->count(2)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);
        Student::factory()->count(4)->create([
            'school_id' => $school->id,
            'grade_id' => $otherGrade->id,
            'class_id' => $otherClass->id,
        ]);

        $response = $this->actingAs($admin)->get("/school/students?grade_id={$grade->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('students', 2));
    }

    // -------------------------------------------------------------------------
    // Create / Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_student(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/students', [
            'admission_number' => 'ADM-001',
            'first_name' => 'Alice',
            'last_name' => 'Wanjiru',
            'grade_id' => $grade->id,
            'class_id' => $class->id,
            'status' => 'active',
        ]);

        $response->assertRedirect('/school/students');
        $this->assertDatabaseHas('students', [
            'school_id' => $school->id,
            'admission_number' => 'ADM-001',
            'first_name' => 'Alice',
            'last_name' => 'Wanjiru',
        ]);
    }

    public function test_student_store_fails_with_missing_required_fields(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/students', [
            // Missing admission_number, first_name, last_name, grade_id, class_id
        ]);

        $response->assertSessionHasErrors(['admission_number', 'first_name', 'last_name', 'grade_id', 'class_id']);
        $this->assertDatabaseCount('students', 0);
    }

    public function test_student_store_fails_with_duplicate_admission_number_in_same_school(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        Student::factory()->create([
            'school_id' => $school->id,
            'admission_number' => 'ADM-DUP',
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->post('/school/students', [
            'admission_number' => 'ADM-DUP',
            'first_name' => 'Another',
            'last_name' => 'Student',
            'grade_id' => $grade->id,
            'class_id' => $class->id,
            'status' => 'active',
        ]);

        $response->assertSessionHasErrors(['admission_number']);
        $this->assertDatabaseCount('students', 1);
    }

    public function test_student_store_rejects_grade_from_another_school(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $foreignSchool = School::factory()->create();
        $foreignGrade = Grade::factory()->create(['school_id' => $foreignSchool->id, 'sort_order' => 1]);
        $foreignClass = GradeClass::factory()->create(['grade_id' => $foreignGrade->id]);

        $response = $this->actingAs($admin)->post('/school/students', [
            'admission_number' => 'ADM-CROSS',
            'first_name' => 'Cross',
            'last_name' => 'Tenant',
            'grade_id' => $foreignGrade->id,
            'class_id' => $foreignClass->id,
            'status' => 'active',
        ]);

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Show / Edit / Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_student(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $student = Student::factory()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->put("/school/students/{$student->id}", [
            'admission_number' => $student->admission_number,
            'first_name' => 'UpdatedFirst',
            'last_name' => 'UpdatedLast',
            'grade_id' => $grade->id,
            'class_id' => $class->id,
            'status' => 'active',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'first_name' => 'UpdatedFirst',
            'last_name' => 'UpdatedLast',
        ]);
    }

    public function test_school_admin_cannot_update_student_from_another_school(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id, 'sort_order' => 1]);
        $otherClass = GradeClass::factory()->create(['grade_id' => $otherGrade->id]);
        $foreignStudent = Student::factory()->create([
            'school_id' => $otherSchool->id,
            'grade_id' => $otherGrade->id,
            'class_id' => $otherClass->id,
        ]);

        $response = $this->actingAs($admin)->put("/school/students/{$foreignStudent->id}", [
            'admission_number' => $foreignStudent->admission_number,
            'first_name' => 'Hacked',
            'last_name' => 'Name',
            'grade_id' => $grade->id,
            'class_id' => $class->id,
            'status' => 'active',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('students', [
            'id' => $foreignStudent->id,
            'first_name' => 'Hacked',
        ]);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_student(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $student = Student::factory()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/students/{$student->id}");

        $response->assertRedirect('/school/students');
        $this->assertSoftDeleted('students', ['id' => $student->id]);
    }

    public function test_school_admin_cannot_delete_student_from_another_school(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id, 'sort_order' => 1]);
        $otherClass = GradeClass::factory()->create(['grade_id' => $otherGrade->id]);
        $foreignStudent = Student::factory()->create([
            'school_id' => $otherSchool->id,
            'grade_id' => $otherGrade->id,
            'class_id' => $otherClass->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/students/{$foreignStudent->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('students', ['id' => $foreignStudent->id, 'deleted_at' => null]);
    }

    public function test_delete_nonexistent_student_returns_404(): void
    {
        [$school, $admin, $grade, $class] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->delete('/school/students/999999');

        $response->assertNotFound();
    }
}
