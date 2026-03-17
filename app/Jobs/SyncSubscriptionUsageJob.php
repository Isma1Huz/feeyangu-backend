<?php

namespace App\Jobs;

use App\Models\School;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SyncSubscriptionUsageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        School::with('subscriptionPlan')
            ->where('subscription_status', 'active')
            ->each(function (School $school) {
                $this->syncSchoolUsage($school);
            });
    }

    private function syncSchoolUsage(School $school): void
    {
        try {
            $studentCount = $school->students()->count();
            $staffCount   = $school->users()->where('school_id', $school->id)->count();
            $storageMb    = $this->calculateStorageUsage($school);

            Log::info("School {$school->name} usage synced", [
                'school_id'    => $school->id,
                'students'     => $studentCount,
                'staff'        => $staffCount,
                'storage_mb'   => $storageMb,
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to sync usage for school {$school->id}: {$e->getMessage()}");
        }
    }

    private function calculateStorageUsage(School $school): float
    {
        // Placeholder — real implementation would sum uploaded file sizes
        return 0.0;
    }
}
