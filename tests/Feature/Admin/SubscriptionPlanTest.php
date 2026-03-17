<?php

namespace Tests\Feature\Admin;

use App\Models\Module;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\ModuleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Super Admin – Subscription Plan management.
 */
class SubscriptionPlanTest extends TestCase
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

    private function seedModules(): void
    {
        app(ModuleService::class)->registerModules();
    }

    private function planPayload(array $overrides = []): array
    {
        return array_merge([
            'name'             => 'Test Plan',
            'code'             => 'test_plan',
            'description'      => 'A test subscription plan.',
            'price_monthly'    => 8000,
            'price_yearly'     => 80000,
            'student_limit'    => 300,
            'staff_limit'      => 30,
            'storage_limit_mb' => 5120,
            'features'         => ['Feature A', 'Feature B'],
            'is_active'        => true,
            'sort_order'       => 5,
            'module_ids'       => [],
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_super_admin_can_list_subscription_plans(): void
    {
        $admin = $this->createSuperAdmin();
        SubscriptionPlan::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/admin/subscription-plans');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/subscription-plans/Index')
                ->has('plans', 3)
        );
    }

    public function test_non_admin_cannot_list_subscription_plans(): void
    {
        $school = School::factory()->create();
        $user = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $user->assignRole('school_admin');

        $response = $this->actingAs($user)->get('/admin/subscription-plans');

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_super_admin_can_view_create_plan_form(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $response = $this->actingAs($admin)->get('/admin/subscription-plans/create');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/subscription-plans/Create')
                ->has('modules')
        );
    }

    public function test_super_admin_can_create_subscription_plan(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $payload = $this->planPayload();
        $response = $this->actingAs($admin)->post('/admin/subscription-plans', $payload);

        $response->assertRedirect('/admin/subscription-plans');
        $this->assertDatabaseHas('subscription_plans', [
            'name' => 'Test Plan',
            'code' => 'test_plan',
            'price_monthly' => 8000,
            'student_limit' => 300,
        ]);
    }

    public function test_create_plan_with_modules_saves_module_mapping(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $moduleId = Module::where('key', 'transport')->value('id');
        $payload  = $this->planPayload(['module_ids' => [$moduleId]]);

        $this->actingAs($admin)->post('/admin/subscription-plans', $payload);

        $plan = SubscriptionPlan::where('code', 'test_plan')->first();
        $this->assertNotNull($plan);
        $this->assertDatabaseHas('plan_modules', [
            'subscription_plan_id' => $plan->id,
            'module_id'            => $moduleId,
            'is_included'          => true,
        ]);
    }

    public function test_create_plan_fails_with_duplicate_code(): void
    {
        $admin = $this->createSuperAdmin();
        SubscriptionPlan::factory()->create(['code' => 'existing_code']);

        $payload  = $this->planPayload(['code' => 'existing_code']);
        $response = $this->actingAs($admin)->post('/admin/subscription-plans', $payload);

        $response->assertSessionHasErrors('code');
    }

    public function test_create_plan_fails_without_required_fields(): void
    {
        $admin    = $this->createSuperAdmin();
        $response = $this->actingAs($admin)->post('/admin/subscription-plans', []);

        $response->assertSessionHasErrors(['name', 'code', 'price_monthly', 'price_yearly']);
    }

    // -------------------------------------------------------------------------
    // Edit / Update
    // -------------------------------------------------------------------------

    public function test_super_admin_can_view_edit_plan_form(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();
        $plan = SubscriptionPlan::factory()->create();

        $response = $this->actingAs($admin)->get("/admin/subscription-plans/{$plan->id}/edit");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/subscription-plans/Edit')
                ->has('plan')
                ->has('modules')
        );
    }

    public function test_super_admin_can_update_subscription_plan(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();
        $plan = SubscriptionPlan::factory()->create(['code' => 'original_code']);

        $payload  = $this->planPayload(['code' => 'original_code', 'name' => 'Updated Name']);
        $response = $this->actingAs($admin)->put("/admin/subscription-plans/{$plan->id}", $payload);

        $response->assertRedirect('/admin/subscription-plans');
        $this->assertDatabaseHas('subscription_plans', [
            'id'   => $plan->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_update_plan_syncs_module_mapping(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();
        $plan     = SubscriptionPlan::factory()->create(['code' => 'sync_plan']);
        $moduleId = Module::where('key', 'hostel')->value('id');

        $payload = $this->planPayload(['code' => 'sync_plan', 'module_ids' => [$moduleId]]);
        $this->actingAs($admin)->put("/admin/subscription-plans/{$plan->id}", $payload);

        $this->assertDatabaseHas('plan_modules', [
            'subscription_plan_id' => $plan->id,
            'module_id'            => $moduleId,
        ]);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_super_admin_can_delete_plan_with_no_subscribers(): void
    {
        $admin    = $this->createSuperAdmin();
        $plan     = SubscriptionPlan::factory()->create();
        $response = $this->actingAs($admin)->delete("/admin/subscription-plans/{$plan->id}");

        $response->assertRedirect('/admin/subscription-plans');
        $this->assertDatabaseMissing('subscription_plans', ['id' => $plan->id]);
    }

    public function test_delete_plan_blocked_when_schools_subscribed(): void
    {
        $admin  = $this->createSuperAdmin();
        $plan   = SubscriptionPlan::factory()->create();
        School::factory()->create(['plan_id' => $plan->id]);

        $response = $this->actingAs($admin)->delete("/admin/subscription-plans/{$plan->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('subscription_plans', ['id' => $plan->id]);
    }

    // -------------------------------------------------------------------------
    // Duplicate
    // -------------------------------------------------------------------------

    public function test_super_admin_can_duplicate_subscription_plan(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();
        $plan  = SubscriptionPlan::factory()->create(['name' => 'Original Plan', 'code' => 'original']);

        $before   = SubscriptionPlan::count();
        $response = $this->actingAs($admin)->post("/admin/subscription-plans/{$plan->id}/duplicate");

        $response->assertRedirect();
        $this->assertSame($before + 1, SubscriptionPlan::count());
        $this->assertDatabaseHas('subscription_plans', ['name' => 'Original Plan (Copy)']);
    }
}
