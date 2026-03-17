<?php

namespace App\Services;

use App\Models\Module;
use App\Models\School;

class ModuleService
{
    /**
     * The canonical list of all available modules in the platform.
     * These are seeded into the `modules` table.
     */
    public function getModuleDefinitions(): array
    {
        return [
            [
                'name'         => 'Academics',
                'key'          => 'academics',
                'icon'         => 'GraduationCap',
                'description'  => 'Manage grades, classes, subjects and academic terms.',
                'dependencies' => [],
                'permissions'  => ['academics.view', 'academics.manage'],
                'settings'     => [],
                'sort_order'   => 1,
                'is_core'      => true,
                'is_active'    => true,
            ],
            [
                'name'         => 'Finance',
                'key'          => 'finance',
                'icon'         => 'CreditCard',
                'description'  => 'Fee structures, invoicing, payments and receipts.',
                'dependencies' => ['academics'],
                'permissions'  => ['finance.view', 'finance.manage', 'finance.approve'],
                'settings'     => [],
                'sort_order'   => 2,
                'is_core'      => true,
                'is_active'    => true,
            ],
            [
                'name'         => 'Attendance',
                'key'          => 'attendance',
                'icon'         => 'UserCheck',
                'description'  => 'Track student and staff daily attendance.',
                'dependencies' => ['academics'],
                'permissions'  => ['attendance.view', 'attendance.manage'],
                'settings'     => [],
                'sort_order'   => 3,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Transport',
                'key'          => 'transport',
                'icon'         => 'Bus',
                'description'  => 'Manage school buses, routes and student transport.',
                'dependencies' => [],
                'permissions'  => ['transport.view', 'transport.manage'],
                'settings'     => [],
                'sort_order'   => 4,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Communication',
                'key'          => 'communication',
                'icon'         => 'Megaphone',
                'description'  => 'Send SMS and email notifications to parents and staff.',
                'dependencies' => [],
                'permissions'  => ['communication.view', 'communication.send'],
                'settings'     => [],
                'sort_order'   => 5,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'NEMIS',
                'key'          => 'nemis',
                'icon'         => 'ShieldCheck',
                'description'  => 'Integration with Kenya NEMIS for official reporting.',
                'dependencies' => ['academics'],
                'permissions'  => ['nemis.view', 'nemis.manage'],
                'settings'     => [],
                'sort_order'   => 6,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Parent Portal',
                'key'          => 'parent_portal',
                'icon'         => 'Users',
                'description'  => 'Self-service portal for parents to view fees and make payments.',
                'dependencies' => ['finance'],
                'permissions'  => ['parent_portal.view'],
                'settings'     => [],
                'sort_order'   => 7,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Student Portal',
                'key'          => 'student_portal',
                'icon'         => 'BookOpen',
                'description'  => 'Student-facing portal for academic resources and results.',
                'dependencies' => ['academics'],
                'permissions'  => ['student_portal.view'],
                'settings'     => [],
                'sort_order'   => 8,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Staff Portal',
                'key'          => 'staff_portal',
                'icon'         => 'Briefcase',
                'description'  => 'Staff management, payroll and leave management.',
                'dependencies' => [],
                'permissions'  => ['staff_portal.view', 'staff_portal.manage'],
                'settings'     => [],
                'sort_order'   => 9,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Store',
                'key'          => 'store',
                'icon'         => 'ShoppingCart',
                'description'  => 'School shop and inventory management.',
                'dependencies' => ['finance'],
                'permissions'  => ['store.view', 'store.manage'],
                'settings'     => [],
                'sort_order'   => 10,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Hostel',
                'key'          => 'hostel',
                'icon'         => 'Building',
                'description'  => 'Boarding house and dormitory management.',
                'dependencies' => [],
                'permissions'  => ['hostel.view', 'hostel.manage'],
                'settings'     => [],
                'sort_order'   => 11,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Alumni',
                'key'          => 'alumni',
                'icon'         => 'Award',
                'description'  => 'Alumni tracking and engagement.',
                'dependencies' => ['academics'],
                'permissions'  => ['alumni.view', 'alumni.manage'],
                'settings'     => [],
                'sort_order'   => 12,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Examination',
                'key'          => 'examination',
                'icon'         => 'ClipboardList',
                'description'  => 'Exams, result entry and report cards (CBC, 8-4-4, Cambridge).',
                'dependencies' => ['academics'],
                'permissions'  => ['examination.view', 'examination.manage'],
                'settings'     => [],
                'sort_order'   => 13,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Sports',
                'key'          => 'sports',
                'icon'         => 'Trophy',
                'description'  => 'Sports activities, teams and competitions.',
                'dependencies' => [],
                'permissions'  => ['sports.view', 'sports.manage'],
                'settings'     => [],
                'sort_order'   => 14,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Health',
                'key'          => 'health',
                'icon'         => 'Heart',
                'description'  => 'Student health records, medical conditions and incidents.',
                'dependencies' => [],
                'permissions'  => ['health.view', 'health.manage'],
                'settings'     => [],
                'sort_order'   => 15,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Tasks',
                'key'          => 'tasks',
                'icon'         => 'CheckSquare',
                'description'  => 'Task management for staff and administration.',
                'dependencies' => [],
                'permissions'  => ['tasks.view', 'tasks.manage'],
                'settings'     => [],
                'sort_order'   => 16,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'Diary',
                'key'          => 'diary',
                'icon'         => 'BookMarked',
                'description'  => 'School diary and event calendar.',
                'dependencies' => [],
                'permissions'  => ['diary.view', 'diary.manage'],
                'settings'     => [],
                'sort_order'   => 17,
                'is_core'      => false,
                'is_active'    => true,
            ],
            [
                'name'         => 'PT Meetings',
                'key'          => 'pt_meetings',
                'icon'         => 'Calendar',
                'description'  => 'Parent-teacher meeting scheduling and management.',
                'dependencies' => ['parent_portal'],
                'permissions'  => ['pt_meetings.view', 'pt_meetings.manage'],
                'settings'     => [],
                'sort_order'   => 18,
                'is_core'      => false,
                'is_active'    => true,
            ],
        ];
    }

    /**
     * Seed/register all module definitions into the database.
     */
    public function registerModules(): void
    {
        foreach ($this->getModuleDefinitions() as $definition) {
            Module::updateOrCreate(
                ['key' => $definition['key']],
                $definition
            );
        }
    }

    /**
     * Check whether a specific module is enabled for a school.
     */
    public function checkModuleAccess(School $school, string $moduleKey): bool
    {
        return $school->isModuleEnabled($moduleKey);
    }

    /**
     * Get the default permission list for a module.
     */
    public function getModulePermissions(string $moduleKey): array
    {
        $module = Module::where('key', $moduleKey)->first();

        return $module?->permissions ?? [];
    }
}
