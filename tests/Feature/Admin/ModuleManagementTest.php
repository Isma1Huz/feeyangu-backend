<?php

namespace Tests\Feature\Admin;

use App\Models\Module;
use App\Models\ModuleTenantOverride;
use App\Models\School;
use App\Models\User;
use App\Services\ModuleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Super Admin – Module Management.
 */
class ModuleManagementTest extends TestCase
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

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_super_admin_can_view_module_management_index(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $response = $this->actingAs($admin)->get('/admin/module-management');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/modules/Index')
                ->has('modules')
        );
    }

    public function test_module_index_returns_modules_with_tenant_override_count(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $response = $this->actingAs($admin)->get('/admin/module-management');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->has('modules.0.id')
                ->has('modules.0.name')
                ->has('modules.0.key')
                ->has('modules.0.is_core')
                ->has('modules.0.is_globally_disabled')
        );
    }

    public function test_non_admin_cannot_view_module_management(): void
    {
        $this->seedModules();
        $school = School::factory()->create();
        $user = User::factory()->create([
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);
        $user->assignRole('school_admin');

        $response = $this->actingAs($user)->get('/admin/module-management');

        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Toggle Global
    // -------------------------------------------------------------------------

    public function test_super_admin_can_globally_disable_non_core_module(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $module = Module::where('key', 'transport')->first();
        $this->assertFalse($module->is_globally_disabled);

        $response = $this->actingAs($admin)
            ->post("/admin/module-management/transport/toggle-global", ['disabled' => true]);

        $response->assertRedirect();
        $this->assertDatabaseHas('modules', [
            'key' => 'transport',
            'is_globally_disabled' => true,
        ]);
    }

    public function test_super_admin_can_globally_enable_disabled_module(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        Module::where('key', 'transport')->update(['is_globally_disabled' => true]);

        $response = $this->actingAs($admin)
            ->post("/admin/module-management/transport/toggle-global", ['disabled' => false]);

        $response->assertRedirect();
        $this->assertDatabaseHas('modules', [
            'key' => 'transport',
            'is_globally_disabled' => false,
        ]);
    }

    public function test_core_module_cannot_be_globally_disabled(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $coreModule = Module::where('is_core', true)->first();

        $response = $this->actingAs($admin)
            ->post("/admin/module-management/{$coreModule->key}/toggle-global", ['disabled' => true]);

        $response->assertRedirect();
        $this->assertDatabaseHas('modules', [
            'key' => $coreModule->key,
            'is_globally_disabled' => false,
        ]);
    }

    public function test_toggle_nonexistent_module_returns_404(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $response = $this->actingAs($admin)
            ->post('/admin/module-management/nonexistent_module_key/toggle-global', ['disabled' => true]);

        $response->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Tenant Overrides
    // -------------------------------------------------------------------------

    public function test_super_admin_can_view_tenant_overrides_for_module(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();
        School::factory()->create();

        $response = $this->actingAs($admin)->get('/admin/module-management/transport/tenant-overrides');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/modules/TenantOverrides')
                ->has('module')
                ->has('schools')
        );
    }

    public function test_super_admin_can_reset_all_tenant_overrides(): void
    {
        $admin = $this->createSuperAdmin();
        $this->seedModules();

        $school = School::factory()->create();
        $module = Module::where('key', 'transport')->first();
        ModuleTenantOverride::create([
            'module_id' => $module->id,
            'school_id' => $school->id,
            'status'    => 'disabled',
        ]);

        $response = $this->actingAs($admin)
            ->post('/admin/module-management/transport/reset-overrides');

        $response->assertRedirect();
        $this->assertDatabaseMissing('module_tenant_overrides', [
            'module_id' => $module->id,
        ]);
    }
}
