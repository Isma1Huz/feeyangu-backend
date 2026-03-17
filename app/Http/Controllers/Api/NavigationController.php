<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SidebarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class NavigationController extends Controller
{
    public function __construct(private readonly SidebarService $sidebarService) {}

    /**
     * GET /api/navigation
     * Return the sidebar navigation filtered for the current user + tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['navigation' => ['categories' => [], 'bottom_items' => []]]);
        }

        // Super admin has a separate navigation
        if ($user->hasRole('super_admin')) {
            return response()->json([
                'navigation' => $this->getSuperAdminNavigation(),
            ]);
        }

        $school = $user->school;

        if (!$school) {
            return response()->json(['navigation' => ['categories' => [], 'bottom_items' => []]]);
        }

        $navigation = $this->sidebarService->getNavigation($school, $user);

        return response()->json(['navigation' => $navigation]);
    }

    /**
     * GET /api/permissions/my
     * Return the effective permission list for the current user.
     */
    public function myPermissions(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['permissions' => []]);
        }

        $permissions = $user->getAllPermissions()->pluck('name');

        return response()->json(['permissions' => $permissions]);
    }

    /**
     * GET /api/permissions/check?permission=academics:view_classes
     * Check a single permission for the current user.
     */
    public function checkPermission(Request $request): JsonResponse
    {
        $permission = $request->query('permission');
        $user       = $request->user();

        if (!$permission || !$user) {
            return response()->json(['allowed' => false]);
        }

        return response()->json([
            'allowed' => $user->hasPermissionTo($permission, 'web'),
        ]);
    }

    // -------------------------------------------------------------------------

    private function getSuperAdminNavigation(): array
    {
        return [
            'categories' => [
                [
                    'name'  => 'Platform',
                    'icon'  => 'ShieldCheck',
                    'items' => [
                        ['name' => 'Dashboard',           'route' => 'admin.dashboard',                    'icon' => 'LayoutDashboard'],
                        ['name' => 'Schools',             'route' => 'admin.schools.index',                'icon' => 'Building'],
                        ['name' => 'Users',               'route' => 'admin.users.index',                  'icon' => 'Users'],
                        ['name' => 'Modules',             'route' => 'admin.modules.index',                'icon' => 'Grid'],
                        ['name' => 'Subscription Plans',  'route' => 'admin.subscription-plans.index',     'icon' => 'CreditCard'],
                        ['name' => 'School Usage',        'route' => 'admin.schools.usage',                'icon' => 'BarChart'],
                        ['name' => 'Settings',            'route' => 'admin.settings.index',               'icon' => 'Settings'],
                    ],
                ],
            ],
            'bottom_items' => [
                ['name' => 'Settings', 'route' => 'admin.settings.index', 'icon' => 'CogIcon'],
            ],
        ];
    }
}
