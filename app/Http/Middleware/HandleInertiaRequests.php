<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Build the list of enabled module keys for the current school
        $enabledModules = [];
        if ($user && $user->school) {
            try {
                $tenantService  = app(TenantService::class);
                $enabledModules = $tenantService
                    ->getEnabledModules($user->school)
                    ->pluck('key')
                    ->toArray();
            } catch (\Throwable) {
                // Modules table may not exist yet during initial migration
                $enabledModules = [];
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'      => $user->id,
                    'name'    => $user->name,
                    'email'   => $user->email,
                    'role'    => $user->roles->pluck('name')->first(),
                    'school'  => $user->school ? [
                        'id'   => $user->school->id,
                        'name' => $user->school->name,
                    ] : null,
                ] : null,
            ],
            'modules' => $enabledModules,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
        ]);
    }
}
