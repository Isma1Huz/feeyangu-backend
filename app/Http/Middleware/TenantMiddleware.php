<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Ensure the request is scoped to a valid tenant (school).
     * Resolves the current tenant and binds it to the request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        if (!$user->school_id) {
            abort(403, 'No tenant (school) assigned to this user.');
        }

        $school = $user->school;

        if (!$school) {
            abort(403, 'Tenant not found.');
        }

        if ($school->status !== 'active') {
            abort(403, 'This tenant account is not active.');
        }

        $request->merge(['current_tenant' => $school]);

        return $next($request);
    }
}
