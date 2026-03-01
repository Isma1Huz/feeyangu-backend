<?php

namespace Tests\Feature\School;

use App\Models\AcademicTerm;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for School Admin – Academic Term management.
 */
class AcademicTermTest extends TestCase
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

    private function validTermData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Term 1',
            'year' => 2026,
            'start_date' => '2026-01-06',
            'end_date' => '2026-04-03',
            'status' => 'active',
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_terms(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        AcademicTerm::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->get('/school/terms');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/Terms')
                ->has('terms', 3)
        );
    }

    public function test_terms_are_scoped_to_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        AcademicTerm::factory()->count(2)->create(['school_id' => $school->id]);

        $otherSchool = School::factory()->create();
        AcademicTerm::factory()->count(4)->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->get('/school/terms');

        $response->assertInertia(fn ($page) => $page->has('terms', 2));
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_term(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/terms', $this->validTermData());

        $response->assertRedirect('/school/terms');
        $this->assertDatabaseHas('academic_terms', [
            'school_id' => $school->id,
            'name' => 'Term 1',
            'year' => 2026,
        ]);
    }

    public function test_term_store_fails_without_required_fields(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/terms', []);

        $response->assertSessionHasErrors(['name', 'year', 'start_date', 'end_date', 'status']);
        $this->assertDatabaseCount('academic_terms', 0);
    }

    public function test_term_store_fails_when_end_date_before_start_date(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/terms', $this->validTermData([
            'start_date' => '2026-04-01',
            'end_date' => '2026-01-01', // before start
        ]));

        $response->assertSessionHasErrors(['end_date']);
    }

    public function test_term_store_fails_with_invalid_status(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/terms', $this->validTermData([
            'status' => 'invalid_status',
        ]));

        $response->assertSessionHasErrors(['status']);
    }

    public function test_term_store_fails_with_year_out_of_range(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/terms', $this->validTermData([
            'year' => 2000, // below min 2020
        ]));

        $response->assertSessionHasErrors(['year']);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_term(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $term = AcademicTerm::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->put("/school/terms/{$term->id}", $this->validTermData([
            'name' => 'Updated Term',
        ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('academic_terms', [
            'id' => $term->id,
            'name' => 'Updated Term',
        ]);
    }

    public function test_school_admin_cannot_update_term_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignTerm = AcademicTerm::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->put("/school/terms/{$foreignTerm->id}", $this->validTermData([
            'name' => 'Hacked',
        ]));

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_empty_term(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $term = AcademicTerm::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->delete("/school/terms/{$term->id}");

        $response->assertRedirect('/school/terms');
        $this->assertDatabaseMissing('academic_terms', ['id' => $term->id]);
    }

    public function test_school_admin_cannot_delete_term_with_fee_structures(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();
        $term = AcademicTerm::factory()->create(['school_id' => $school->id]);
        $grade = Grade::factory()->create(['school_id' => $school->id]);

        FeeStructure::factory()->create([
            'school_id' => $school->id,
            'term_id' => $term->id,
            'grade_id' => $grade->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/terms/{$term->id}");

        $response->assertRedirect('/school/terms');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('academic_terms', ['id' => $term->id]);
    }

    public function test_school_admin_cannot_delete_term_from_another_school(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignTerm = AcademicTerm::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->delete("/school/terms/{$foreignTerm->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('academic_terms', ['id' => $foreignTerm->id]);
    }

    public function test_delete_nonexistent_term_returns_404(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->delete('/school/terms/999999');

        $response->assertNotFound();
    }
}
