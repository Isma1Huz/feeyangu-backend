<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ModuleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Check whether the requested module is enabled for the current school.
     * Usage in routes: ->middleware('module:academics')
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$modules): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        // Super admin is never blocked by module restrictions
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        $school = $user->school;

        if (!$school) {
            abort(403, 'No school assigned to this user');
        }

        foreach ($modules as $moduleKey) {
            if (!$school->isModuleEnabled($moduleKey)) {
                abort(403, "Module '{$moduleKey}' is not enabled for your school");
            }
        }

        return $next($request);
    }
}
