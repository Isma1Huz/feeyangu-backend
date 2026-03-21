<?php

namespace App\Http\Middleware;

use App\Services\PermissionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function __construct(private readonly PermissionService $permissionService) {}

    /**
     * Check that the authenticated user has the required permission(s)
     * within the current tenant context.
     *
     * Usage: ->middleware('permission:academics.manage')
     *        ->middleware('permission:academics.manage,finance.view')
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        $school = $user->school;

        if (!$school) {
            abort(403, 'No tenant context available.');
        }

        if (!$this->permissionService->userHasAnyPermission($user, $school, $permissions)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
