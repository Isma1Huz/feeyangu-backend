<?php

namespace App\Models;

/**
 * Tenant is an alias for the School model.
 * In this platform, a "tenant" is a school.
 * This class exists for architectural alignment – controllers and services
 * that reference "Tenant" will work seamlessly with the underlying `schools` table.
 */
class Tenant extends School
{
    /**
     * Tenants share the same table as schools.
     */
    protected $table = 'schools';
}
