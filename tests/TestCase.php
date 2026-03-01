<?php

namespace Tests;

use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Schema;

abstract class TestCase extends BaseTestCase
{
    /**
     * Set up roles/permissions and disable Vite for every test.
     * Roles are seeded only when the database tables are available
     * (i.e., when a test uses RefreshDatabase or DatabaseMigrations).
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        // Only seed roles if the roles table has been migrated for this test.
        if (Schema::hasTable('roles')) {
            $this->seed(RolesAndPermissionsSeeder::class);
        }
    }
}
