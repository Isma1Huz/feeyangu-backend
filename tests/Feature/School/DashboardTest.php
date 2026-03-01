<?php

namespace Tests\Feature\School;

use App\Models\AcademicTerm;
use App\Models\FeeItem;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for the School Admin Dashboard.
 */
class DashboardTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createSchoolAdmin(): array
    {
        $school = School::factory()->create();
        $user = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $user->assignRole('school_admin');
        return [$school, $user];
    }

    // -------------------------------------------------------------------------
    // Dashboard index
    // -------------------------------------------------------------------------

    public function test_school_admin_can_view_dashboard(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $response = $this->actingAs($admin)->get('/school/dashboard');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/Dashboard')
                ->has('kpi')
                ->has('recentPayments')
                ->has('overdueInvoices')
                ->has('studentsByGrade')
                ->has('recentStudents')
                ->has('collectionByMethod')
                ->has('agingData')
                ->has('monthlyRevenue')
                ->has('principalKPIs')
        );
    }

    public function test_unauthenticated_user_cannot_view_dashboard(): void
    {
        $response = $this->get('/school/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_parent_role_cannot_access_school_dashboard(): void
    {
        $school = School::factory()->create();
        $parent = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $parent->assignRole('parent');

        $response = $this->actingAs($parent)->get('/school/dashboard');

        $response->assertForbidden();
    }

    public function test_accountant_role_cannot_access_school_dashboard(): void
    {
        $school = School::factory()->create();
        $accountant = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $accountant->assignRole('accountant');

        $response = $this->actingAs($accountant)->get('/school/dashboard');

        $response->assertForbidden();
    }

    public function test_dashboard_kpi_reflects_real_db_data(): void
    {
        [$school, $admin] = $this->createSchoolAdmin();

        $grade = Grade::factory()->create(['school_id' => $school->id]);
        $class = GradeClass::factory()->create(['grade_id' => $grade->id]);

        Student::factory()->count(5)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
            'status' => 'active',
        ]);
        Student::factory()->count(2)->create([
            'school_id' => $school->id,
            'grade_id' => $grade->id,
            'class_id' => $class->id,
            'status' => 'inactive',
        ]);

        $response = $this->actingAs($admin)->get('/school/dashboard');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('school/Dashboard')
                ->where('kpi.total_students', 7)
                ->where('kpi.active_students', 5)
                ->where('kpi.inactive_students', 2)
        );
    }
}
