<?php

namespace App\Services;

use App\Models\School;
use App\Models\User;

class SidebarService
{
    /**
     * Build the navigation structure for a user.
     * Items are filtered by enabled modules and user permissions.
     */
    public function getNavigation(School $tenant, User $user): array
    {
        $moduleService    = app(ModuleService::class);
        $enabledModuleKeys = $moduleService->getEnabledModulesForTenant($tenant)->pluck('key')->flip();

        $allCategories = $this->getNavigationDefinition();

        $filteredCategories = [];

        foreach ($allCategories as $category) {
            $filteredItems = [];

            foreach ($category['items'] as $item) {
                $moduleRequired = $item['module'] ?? null;

                // Skip items whose module is not enabled
                if ($moduleRequired && !isset($enabledModuleKeys[$moduleRequired])) {
                    continue;
                }

                // Skip items the user doesn't have permission for
                $permission = $item['permission'] ?? null;
                if ($permission && !$this->userCan($user, $permission)) {
                    continue;
                }

                $filteredItems[] = $item;
            }

            if (!empty($filteredItems)) {
                $filteredCategories[] = array_merge($category, ['items' => $filteredItems]);
            }
        }

        return [
            'categories'   => $filteredCategories,
            'bottom_items' => $this->getBottomItems(),
        ];
    }

    // -------------------------------------------------------------------------
    // Navigation definition
    // -------------------------------------------------------------------------

    private function getNavigationDefinition(): array
    {
        return [
            [
                'name' => 'Overview',
                'icon' => 'HomeIcon',
                'items' => [
                    ['name' => 'Dashboard', 'route' => 'school.dashboard', 'icon' => 'LayoutDashboard', 'module' => null, 'permission' => null],
                ],
            ],
            [
                'name' => 'Academic Management',
                'icon' => 'AcademicCapIcon',
                'items' => [
                    ['name' => 'Students',  'route' => 'school.students.index',  'icon' => 'Users',          'module' => 'academics', 'permission' => 'academics:view_classes'],
                    ['name' => 'Grades',    'route' => 'school.grades.index',    'icon' => 'BookOpen',       'module' => 'academics', 'permission' => 'academics:view_classes'],
                    ['name' => 'Classes',   'route' => 'school.classes.index',   'icon' => 'Layers',         'module' => 'academics', 'permission' => 'academics:view_classes'],
                    ['name' => 'Terms',     'route' => 'school.terms.index',     'icon' => 'CalendarDays',   'module' => 'academics', 'permission' => 'academics:manage_timetable'],
                    ['name' => 'Timetable', 'route' => 'school.dashboard',       'icon' => 'Clock',          'module' => 'academics', 'permission' => 'academics:view_timetable'],
                    ['name' => 'Exams',     'route' => 'school.dashboard',       'icon' => 'ClipboardList',  'module' => 'examination', 'permission' => 'academics:view_exams'],
                ],
            ],
            [
                'name' => 'Financial Management',
                'icon' => 'CurrencyDollarIcon',
                'items' => [
                    ['name' => 'Fee Structures', 'route' => 'school.fee-structures.index', 'icon' => 'FileText',  'module' => 'finance', 'permission' => 'finance:view_fee_structure'],
                    ['name' => 'Payments',        'route' => 'school.payments.index',       'icon' => 'CreditCard','module' => 'finance', 'permission' => 'finance:view_payments'],
                    ['name' => 'Receipts',        'route' => 'school.receipts.index',       'icon' => 'Receipt',   'module' => 'finance', 'permission' => 'finance:view_invoices'],
                    ['name' => 'Billing',         'route' => 'school.billing.index',        'icon' => 'Wallet',    'module' => 'finance', 'permission' => 'finance:view_fee_structure'],
                ],
            ],
            [
                'name' => 'Attendance',
                'icon' => 'UserCheckIcon',
                'items' => [
                    ['name' => 'Attendance', 'route' => 'school.dashboard', 'icon' => 'UserCheck', 'module' => 'attendance', 'permission' => null],
                ],
            ],
            [
                'name' => 'Transport',
                'icon' => 'BusIcon',
                'items' => [
                    ['name' => 'Transport', 'route' => 'school.dashboard', 'icon' => 'Bus', 'module' => 'transport', 'permission' => null],
                ],
            ],
            [
                'name' => 'Communication',
                'icon' => 'MegaphoneIcon',
                'items' => [
                    ['name' => 'Messages', 'route' => 'school.dashboard', 'icon' => 'MessageSquare', 'module' => 'communication', 'permission' => null],
                ],
            ],
            [
                'name' => 'Health',
                'icon' => 'HeartIcon',
                'items' => [
                    ['name' => 'Health Records', 'route' => 'school.health.index', 'icon' => 'Heart', 'module' => 'health', 'permission' => null],
                ],
            ],
            [
                'name' => 'Parent-Teacher Meetings',
                'icon' => 'CalendarIcon',
                'items' => [
                    ['name' => 'PT Meetings', 'route' => 'school.pt-meetings.index', 'icon' => 'Calendar', 'module' => 'pt_meetings', 'permission' => null],
                ],
            ],
            [
                'name' => 'Store',
                'icon' => 'ShoppingCartIcon',
                'items' => [
                    ['name' => 'Store', 'route' => 'school.dashboard', 'icon' => 'ShoppingCart', 'module' => 'store', 'permission' => null],
                ],
            ],
            [
                'name' => 'Hostel',
                'icon' => 'BuildingIcon',
                'items' => [
                    ['name' => 'Hostel', 'route' => 'school.dashboard', 'icon' => 'Building', 'module' => 'hostel', 'permission' => null],
                ],
            ],
            [
                'name' => 'Administration',
                'icon' => 'CogIcon',
                'items' => [
                    ['name' => 'Users',   'route' => 'school.users.index',   'icon' => 'UserCog',  'module' => null, 'permission' => 'core:manage_users'],
                    ['name' => 'Roles',   'route' => 'school.roles.index',   'icon' => 'Shield',   'module' => null, 'permission' => 'core:manage_users'],
                    ['name' => 'Modules', 'route' => 'school.modules.index', 'icon' => 'Grid',     'module' => null, 'permission' => 'core:manage_settings'],
                    ['name' => 'Settings','route' => 'school.settings.index','icon' => 'Settings', 'module' => null, 'permission' => 'core:manage_settings'],
                ],
            ],
        ];
    }

    private function getBottomItems(): array
    {
        return [
            ['name' => 'Settings', 'route' => 'school.settings.index', 'icon' => 'CogIcon'],
            ['name' => 'Help',     'route' => 'school.dashboard',       'icon' => 'QuestionMarkCircleIcon'],
        ];
    }

    private function userCan(User $user, string $permission): bool
    {
        // Super admin always passes
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Use Spatie permission check
        return $user->hasPermissionTo($permission, 'web');
    }
}
