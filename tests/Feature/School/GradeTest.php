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
 * Feature tests for School Admin – Grade management.
 */
class GradeTest extends TestCase
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

    public function test_school_admin_can_list_grades(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        Grade::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->get('/school/grades');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/Grades')
                ->has('grades', 3)
        );
    }

    public function test_grades_are_scoped_to_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        Grade::factory()->count(2)->create(['school_id' => $school->id]);

        $otherSchool = School::factory()->create();
        Grade::factory()->count(5)->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->get('/school/grades');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('grades', 2));
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_grade(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/grades', [
            'name' => 'Grade 1',
            'sort_order' => 1,
        ]);

        $response->assertRedirect('/school/grades');
        $this->assertDatabaseHas('grades', [
            'school_id' => $school->id,
            'name' => 'Grade 1',
            'sort_order' => 1,
        ]);
    }

    public function test_grade_store_fails_without_required_fields(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/grades', []);

        $response->assertSessionHasErrors(['name', 'sort_order']);
        $this->assertDatabaseCount('grades', 0);
    }

    public function test_grade_store_fails_with_invalid_sort_order(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/grades', [
            'name' => 'Grade X',
            'sort_order' => 0, // min is 1
        ]);

        $response->assertSessionHasErrors(['sort_order']);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_grade(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $grade = Grade::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->put("/school/grades/{$grade->id}", [
            'name' => 'Updated Grade',
            'sort_order' => 5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('grades', [
            'id' => $grade->id,
            'name' => 'Updated Grade',
        ]);
    }

    public function test_school_admin_cannot_update_grade_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->put("/school/grades/{$foreignGrade->id}", [
            'name' => 'Hacked',
            'sort_order' => 1,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('grades', ['id' => $foreignGrade->id, 'name' => 'Hacked']);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_grade_with_no_students(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $grade = Grade::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->delete("/school/grades/{$grade->id}");

        $response->assertRedirect('/school/grades');
        $this->assertDatabaseMissing('grades', ['id' => $grade->id]);
    }

    public function test_school_admin_cannot_delete_grade_with_enrolled_students(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $grade = Grade::factory()->create(['school_id' => $school->id]);
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);
        Student::factory()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/grades/{$grade->id}");

        $response->assertRedirect('/school/grades');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('grades', ['id' => $grade->id]);
    }

    public function test_school_admin_cannot_delete_grade_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->delete("/school/grades/{$foreignGrade->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('grades', ['id' => $foreignGrade->id]);
    }

    public function test_delete_nonexistent_grade_returns_404(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->delete('/school/grades/999999');

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_grades(): void
    {
        $response = $this->get('/school/grades');
        $response->assertRedirect('/login');
    }

    public function test_parent_cannot_access_grades(): void
    {
        $school = School::factory()->create();
        $parent = User::factory()->create(['school_id' => $school->id, 'email_verified_at' => now()]);
        $parent->assignRole('parent');

        $response = $this->actingAs($parent)->get('/school/grades');
        $response->assertForbidden();
    }
}
