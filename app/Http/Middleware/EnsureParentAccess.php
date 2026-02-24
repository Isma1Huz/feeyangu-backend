<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureParentAccess
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

        // Only parents should use this middleware
        if (!$user->hasRole('parent')) {
            abort(403, 'This resource is only accessible to parents');
        }

        // Check if route has student_id parameter
        $studentId = $request->route('student') ?? $request->route('studentId');
        
        if ($studentId) {
            // Verify that the student belongs to this parent
            $isParent = $user->students()->where('students.id', $studentId)->exists();
            
            if (!$isParent) {
                abort(403, 'Access denied - You are not a parent of this student');
            }
        }

        return $next($request);
    }
}
