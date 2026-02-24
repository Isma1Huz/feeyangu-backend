<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        // Super admin can access all schools
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        // School-level users (school_admin, accountant) must have a school
        if (!$user->school_id) {
            abort(403, 'No school assigned to user');
        }

        // Check if route has school_id parameter and ensure it matches user's school
        $schoolId = $request->route('school') ?? $request->route('school_id');
        
        if ($schoolId && $user->school_id != $schoolId) {
            abort(403, 'Access denied to this school');
        }

        return $next($request);
    }
}
