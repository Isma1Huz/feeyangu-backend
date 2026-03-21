<?php

namespace Tests\Feature\Academics;

use App\Models\Curriculum;
use App\Models\GradeScale;
use App\Models\LearningArea;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Curriculum management.
 */
class CurriculumTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSchoolAdmin(): array
    {
        $school = School::factory()->create();
        $admin = User::factory()->create([
            'school_id'          => $school->id,
            'email_verified_at'  => now(),
        ]);
        $admin->assignRole('school_admin');
        return [$school, $admin];
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_curricula(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        Curriculum::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->get('/school/academics/curricula');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/academics/Curricula')
                ->has('curricula', 3)
        );
    }

    public function test_curricula_are_scoped_to_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        Curriculum::factory()->count(2)->create(['school_id' => $school->id]);

        $otherSchool = School::factory()->create();
        Curriculum::factory()->count(5)->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->get('/school/academics/curricula');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('curricula', 2));
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_curriculum(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/academics/curricula', [
            'name'        => 'CBC Curriculum',
            'code'        => 'CBC-2024',
            'type'        => 'cbc',
            'description' => 'Competency Based Curriculum',
            'is_active'   => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('curricula', [
            'school_id' => $school->id,
            'code'      => 'CBC-2024',
            'name'      => 'CBC Curriculum',
        ]);
    }

    public function test_curriculum_creation_requires_name(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/academics/curricula', [
            'code' => 'CBC-2024',
            'type' => 'cbc',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_curriculum_type_must_be_valid(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/academics/curricula', [
            'name' => 'Test',
            'code' => 'TEST-01',
            'type' => 'invalid_type',
        ]);

        $response->assertSessionHasErrors('type');
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_own_curriculum(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $curriculum = Curriculum::factory()->create(['school_id' => $school->id, 'name' => 'Old Name']);

        $response = $this->actingAs($admin)->put("/school/academics/curricula/{$curriculum->id}", [
            'name'      => 'New Name',
            'code'      => $curriculum->code,
            'type'      => $curriculum->type,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('curricula', ['id' => $curriculum->id, 'name' => 'New Name']);
    }

    public function test_school_admin_cannot_update_other_schools_curriculum(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $curriculum  = Curriculum::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->put("/school/academics/curricula/{$curriculum->id}", [
            'name' => 'Hacked',
            'code' => 'HACK',
            'type' => 'cbc',
        ]);

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Destroy
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_own_curriculum(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $curriculum = Curriculum::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->delete("/school/academics/curricula/{$curriculum->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('curricula', ['id' => $curriculum->id]);
    }

    public function test_school_admin_cannot_delete_other_schools_curriculum(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $curriculum  = Curriculum::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->delete("/school/academics/curricula/{$curriculum->id}");

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Grade Scales
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_grade_scale(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $curriculum = Curriculum::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->post('/school/academics/grade-scales', [
            'name'          => 'Standard Scale',
            'curriculum_id' => $curriculum->id,
            'levels'        => [
                ['grade' => 'A', 'min' => 80, 'max' => 100],
                ['grade' => 'B', 'min' => 65, 'max' => 79],
                ['grade' => 'C', 'min' => 50, 'max' => 64],
                ['grade' => 'D', 'min' => 40, 'max' => 49],
                ['grade' => 'E', 'min' => 0,  'max' => 39],
            ],
            'is_default' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('grade_scales', [
            'school_id' => $school->id,
            'name'      => 'Standard Scale',
        ]);
    }
}
