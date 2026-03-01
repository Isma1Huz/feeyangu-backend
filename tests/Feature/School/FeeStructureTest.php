<?php

namespace Tests\Feature\School;

use App\Models\AcademicTerm;
use App\Models\FeeItem;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for School Admin – Fee Structure management.
 */
class FeeStructureTest extends TestCase
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
        $term = AcademicTerm::factory()->active()->create(['school_id' => $school->id]);

        return [$school, $admin, $grade, $term];
    }

    private function validFeeStructureData(Grade $grade, AcademicTerm $term, array $overrides = []): array
    {
        return array_merge([
            'name' => 'Term 1 Fees',
            'grade_id' => $grade->id,
            'term_id' => $term->id,
            'status' => 'active',
            'items' => [
                ['name' => 'Tuition', 'amount' => 10000],
                ['name' => 'Activity Fee', 'amount' => 2000],
            ],
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_list_fee_structures(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        FeeStructure::factory()->count(3)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'term_id' => $term->id,
        ]);

        $response = $this->actingAs($admin)->get('/school/fee-structures');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/FeeStructures')
                ->has('structures', 3)
                ->has('grades')
                ->has('terms')
        );
    }

    public function test_fee_structures_are_scoped_to_school(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();
        FeeStructure::factory()->count(2)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'term_id' => $term->id,
        ]);

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);
        $otherTerm = AcademicTerm::factory()->create(['school_id' => $otherSchool->id]);
        FeeStructure::factory()->count(4)->create([
            'school_id' => $otherSchool->id,
            'grade_id' => $otherGrade->id,
            'term_id' => $otherTerm->id,
        ]);

        $response = $this->actingAs($admin)->get('/school/fee-structures');

        $response->assertInertia(fn ($page) => $page->has('structures', 2));
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_school_admin_can_create_fee_structure(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post(
            '/school/fee-structures',
            $this->validFeeStructureData($grade, $term)
        );

        $response->assertRedirect('/school/fee-structures');
        $this->assertDatabaseHas('fee_structures', [
            'school_id' => $school->id,
            'name' => 'Term 1 Fees',
            'grade_id' => $grade->id,
            'term_id' => $term->id,
            'total_amount' => (10000 + 2000) * 100, // in cents
            'status' => 'active',
        ]);
        $this->assertDatabaseCount('fee_items', 2);
    }

    public function test_fee_structure_store_fails_without_items(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/fee-structures', [
            'name' => 'Empty Structure',
            'grade_id' => $grade->id,
            'term_id' => $term->id,
            'status' => 'active',
            'items' => [], // empty
        ]);

        $response->assertSessionHasErrors(['items']);
        $this->assertDatabaseCount('fee_structures', 0);
    }

    public function test_fee_structure_store_fails_without_name(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->post('/school/fee-structures', [
            'grade_id' => $grade->id,
            'term_id' => $term->id,
            'status' => 'active',
            'items' => [['name' => 'Tuition', 'amount' => 5000]],
        ]);

        $response->assertSessionHasErrors(['name']);
    }

    public function test_fee_structure_store_rejects_grade_from_another_school(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $foreignGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);

        $response = $this->actingAs($admin)->post('/school/fee-structures', [
            'name' => 'Cross-Tenant Fee',
            'grade_id' => $foreignGrade->id,
            'term_id' => $term->id,
            'status' => 'active',
            'items' => [['name' => 'Tuition', 'amount' => 5000]],
        ]);

        // Controller uses findOrFail which throws 404 for foreign (unauthorized) grade
        $response->assertNotFound();
        $this->assertDatabaseCount('fee_structures', 0);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_school_admin_can_update_fee_structure(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();
        $structure = FeeStructure::factory()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'term_id' => $term->id,
        ]);
        FeeItem::factory()->create([
            'fee_structure_id' => $structure->id,
            'name' => 'Old Item',
            'amount' => 5000 * 100,
        ]);

        $response = $this->actingAs($admin)->put("/school/fee-structures/{$structure->id}", [
            'name' => 'Updated Name',
            'grade_id' => $grade->id,
            'term_id' => $term->id,
            'status' => 'active',
            'items' => [
                ['name' => 'New Tuition', 'amount' => 8000],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('fee_structures', [
            'id' => $structure->id,
            'name' => 'Updated Name',
            'total_amount' => 8000 * 100,
        ]);
        // Old item should be replaced
        $this->assertDatabaseMissing('fee_items', ['name' => 'Old Item', 'fee_structure_id' => $structure->id]);
        $this->assertDatabaseHas('fee_items', ['name' => 'New Tuition', 'fee_structure_id' => $structure->id]);
    }

    public function test_school_admin_cannot_update_fee_structure_from_another_school(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);
        $otherTerm = AcademicTerm::factory()->create(['school_id' => $otherSchool->id]);
        $foreignStructure = FeeStructure::factory()->create([
            'school_id' => $otherSchool->id,
            'grade_id' => $otherGrade->id,
            'term_id' => $otherTerm->id,
        ]);

        $response = $this->actingAs($admin)->put("/school/fee-structures/{$foreignStructure->id}", [
            'name' => 'Hacked',
            'grade_id' => $grade->id,
            'term_id' => $term->id,
            'status' => 'active',
            'items' => [['name' => 'Tuition', 'amount' => 5000]],
        ]);

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_school_admin_can_delete_fee_structure(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();
        $structure = FeeStructure::factory()->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'term_id' => $term->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/fee-structures/{$structure->id}");

        $response->assertRedirect('/school/fee-structures');
        $this->assertDatabaseMissing('fee_structures', ['id' => $structure->id]);
    }

    public function test_school_admin_cannot_delete_fee_structure_from_another_school(): void
    {
        [$school, $admin, $grade, $term] = $this->createSchoolAdmin();

        $otherSchool = School::factory()->create();
        $otherGrade = Grade::factory()->create(['school_id' => $otherSchool->id]);
        $otherTerm = AcademicTerm::factory()->create(['school_id' => $otherSchool->id]);
        $foreignStructure = FeeStructure::factory()->create([
            'school_id' => $otherSchool->id,
            'grade_id' => $otherGrade->id,
            'term_id' => $otherTerm->id,
        ]);

        $response = $this->actingAs($admin)->delete("/school/fee-structures/{$foreignStructure->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('fee_structures', ['id' => $foreignStructure->id]);
    }

    public function test_delete_nonexistent_fee_structure_returns_404(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->delete('/school/fee-structures/999999');

        $response->assertNotFound();
    }
}
