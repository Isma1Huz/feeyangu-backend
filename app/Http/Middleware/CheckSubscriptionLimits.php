<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionLimits
{
    public function __construct(private readonly SubscriptionService $subscriptionService) {}

    /**
     * Handle an incoming request.
     *
     * Usage: ->middleware('subscription.limit:students')
     * Supported resource types: students, staff, storage
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $resourceType): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        // Super admin is exempt from limits
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        $school = $user->school;

        if (!$school) {
            abort(403, 'No school assigned to this user');
        }

        if (!$this->subscriptionService->checkSubscriptionLimits($school, $resourceType)) {
            $remaining = $this->subscriptionService->getRemainingSlots($school, $resourceType);
            $limit     = $school->getEffectiveStudentLimit();

            $messages = [
                'students' => "Student limit reached. Your plan allows a maximum of {$limit} students. Please upgrade your subscription to add more students.",
                'staff'    => "Staff limit reached. Your plan allows a maximum of {$school->getEffectiveStaffLimit()} staff members. Please upgrade your subscription.",
                'storage'  => "Storage limit reached. Your plan allows a maximum of {$school->getEffectiveStorageLimit()} MB. Please upgrade your subscription.",
            ];

            abort(403, $messages[$resourceType] ?? "Subscription limit reached for {$resourceType}.");
        }

        return $next($request);
    }
}
