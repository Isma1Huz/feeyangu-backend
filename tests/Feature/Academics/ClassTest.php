<?php

namespace Tests\Feature\Academics;

use App\Models\AcademicClass;
use App\Models\Curriculum;
use App\Models\School;
use App\Models\Stream;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Academic Class management.
 */
class ClassTest extends TestCase
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

    public function test_school_admin_can_list_academic_classes(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        AcademicClass::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->get('/school/academics/academic-classes');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/academics/Classes')
                ->has('classes', 3)
        );
    }

    public function test_academic_classes_are_scoped_to_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        AcademicClass::factory()->count(2)->create(['school_id' => $school->id]);

        $otherSchool = School::factory()->create();
        AcademicClass::factory()->count(5)->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->get('/school/academics/academic-classes');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('classes', 2));
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_academic_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $curriculum = Curriculum::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->post('/school/academics/academic-classes', [
            'name'          => 'Grade 1',
            'code'          => 'GR1',
            'curriculum_id' => $curriculum->id,
            'academic_year' => '2024',
            'is_active'     => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('academic_classes', [
            'school_id'     => $school->id,
            'name'          => 'Grade 1',
            'code'          => 'GR1',
            'academic_year' => '2024',
        ]);
    }

    public function test_class_creation_requires_academic_year(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/academics/academic-classes', [
            'name' => 'Grade 1',
            'code' => 'GR1',
        ]);

        $response->assertSessionHasErrors('academic_year');
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_own_academic_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $class = AcademicClass::factory()->create(['school_id' => $school->id, 'name' => 'Old Name']);

        $response = $this->actingAs($admin)->put("/school/academics/academic-classes/{$class->id}", [
            'name'          => 'New Name',
            'code'          => $class->code,
            'academic_year' => $class->academic_year,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('academic_classes', ['id' => $class->id, 'name' => 'New Name']);
    }

    public function test_school_admin_cannot_update_other_schools_academic_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $class       = AcademicClass::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->put("/school/academics/academic-classes/{$class->id}", [
            'name'          => 'Hacked',
            'code'          => 'HACK',
            'academic_year' => '2024',
        ]);

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Destroy
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_own_academic_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $class = AcademicClass::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->delete("/school/academics/academic-classes/{$class->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('academic_classes', ['id' => $class->id]);
    }

    public function test_school_admin_cannot_delete_other_schools_academic_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $class       = AcademicClass::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->delete("/school/academics/academic-classes/{$class->id}");

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Streams
    // -------------------------------------------------------------------------

    public function test_school_admin_can_add_stream_to_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $class = AcademicClass::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->post(
            "/school/academics/academic-classes/{$class->id}/streams",
            ['name' => 'North', 'code' => 'N', 'capacity' => 40]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('streams', [
            'academic_class_id' => $class->id,
            'name'              => 'North',
            'code'              => 'N',
        ]);
    }

    public function test_school_admin_can_delete_stream(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $class  = AcademicClass::factory()->create(['school_id' => $school->id]);
        $stream = Stream::create([
            'academic_class_id' => $class->id,
            'name'              => 'East',
            'code'              => 'E',
        ]);

        $response = $this->actingAs($admin)->delete(
            "/school/academics/academic-classes/{$class->id}/streams/{$stream->id}"
        );

        $response->assertRedirect();
        $this->assertDatabaseMissing('streams', ['id' => $stream->id]);
    }

    public function test_cannot_add_stream_to_other_schools_class(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $class       = AcademicClass::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->post(
            "/school/academics/academic-classes/{$class->id}/streams",
            ['name' => 'South', 'code' => 'S']
        );

        $response->assertForbidden();
    }
}
