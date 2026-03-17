<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolRole;
use Illuminate\Database\Seeder;

class SchoolRolesSeeder extends Seeder
{
    /**
     * Default system roles to create for every school tenant.
     */
    public const DEFAULT_ROLES = [
        ['name' => 'Principal',            'description' => 'School principal with full access'],
        ['name' => 'Deputy Principal',     'description' => 'Deputy principal with near-full access'],
        ['name' => 'Head of Department',   'description' => 'HOD with departmental management access'],
        ['name' => 'Teacher',              'description' => 'Regular classroom teacher'],
        ['name' => 'Class Teacher',        'description' => 'Class teacher with student management'],
        ['name' => 'Finance Officer',      'description' => 'Manages school finances and payments'],
        ['name' => 'Accountant',           'description' => 'Handles accounts and reconciliation'],
        ['name' => 'Auditor',              'description' => 'Read-only financial audit access'],
        ['name' => 'Librarian',            'description' => 'Manages library resources'],
        ['name' => 'Store Keeper',         'description' => 'Manages school store and inventory'],
        ['name' => 'Transport Manager',    'description' => 'Manages transport routes and vehicles'],
        ['name' => 'Driver',               'description' => 'School bus driver'],
        ['name' => 'Nurse',                'description' => 'School nurse with health records access'],
        ['name' => 'Secretary',            'description' => 'Administrative secretary'],
        ['name' => 'Exam Officer',         'description' => 'Manages examinations and results'],
        ['name' => 'Admission Officer',    'description' => 'Handles student admissions'],
        ['name' => 'Discipline Master',    'description' => 'Manages student discipline'],
        ['name' => 'Games Master',         'description' => 'Manages sports and games activities'],
        ['name' => 'Lab Technician',       'description' => 'Manages science laboratories'],
        ['name' => 'ICT Officer',          'description' => 'Manages ICT resources and systems'],
        ['name' => 'Boarding Master',      'description' => 'Manages hostel and boarding'],
        ['name' => 'Alumni Coordinator',   'description' => 'Manages alumni relations'],
    ];

    public function run(): void
    {
        // Seed default roles for all existing schools
        School::all()->each(function (School $school) {
            $this->seedForSchool($school);
        });
    }

    /**
     * Create the default system roles for a single school.
     * Idempotent — skips roles that already exist.
     */
    public function seedForSchool(School $school): void
    {
        foreach (self::DEFAULT_ROLES as $roleData) {
            SchoolRole::firstOrCreate(
                [
                    'tenant_id' => $school->id,
                    'name'      => $roleData['name'],
                ],
                [
                    'description' => $roleData['description'],
                    'is_system'   => true,
                    'created_by'  => null,
                ]
            );
        }
    }
}
