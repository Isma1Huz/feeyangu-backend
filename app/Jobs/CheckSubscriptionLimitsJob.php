<?php

namespace App\Jobs;

use App\Models\School;
use App\Services\SubscriptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckSubscriptionLimitsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Alert thresholds in percentages */
    private const ALERT_THRESHOLDS = [80, 90, 95];

    public function __construct() {}

    public function handle(SubscriptionService $subscriptionService): void
    {
        School::with('subscriptionPlan', 'users', 'students')
            ->where('subscription_status', 'active')
            ->each(function (School $school) use ($subscriptionService) {
                $this->checkSchoolLimits($school, $subscriptionService);
            });
    }

    private function checkSchoolLimits(School $school, SubscriptionService $subscriptionService): void
    {
        $resourceTypes = ['students', 'staff'];

        foreach ($resourceTypes as $resourceType) {
            $limit = match ($resourceType) {
                'students' => $school->getEffectiveStudentLimit(),
                'staff'    => $school->getEffectiveStaffLimit(),
                default    => 0,
            };

            if ($limit === 0) {
                continue; // unlimited
            }

            $remaining = $subscriptionService->getRemainingSlots($school, $resourceType);

            if ($remaining === null) {
                continue;
            }

            $usagePercent = (int) round((($limit - $remaining) / $limit) * 100);

            foreach (self::ALERT_THRESHOLDS as $threshold) {
                if ($usagePercent >= $threshold) {
                    Log::info("School {$school->name} (ID:{$school->id}) is at {$usagePercent}% {$resourceType} capacity (threshold: {$threshold}%)");
                    // TODO: send notification to school admin
                    break;
                }
            }
        }
    }
}
