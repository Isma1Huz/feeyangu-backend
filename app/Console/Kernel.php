<?php

namespace App\Console;

use App\Jobs\CheckOverdueInvoicesJob;
use App\Jobs\CheckSubscriptionLimitsJob;
use App\Jobs\SyncSubscriptionUsageJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Mark overdue invoices and notify parents every day at 08:00 (Nairobi time)
        $schedule->job(new CheckOverdueInvoicesJob)->dailyAt('08:00');

        // Check subscription usage limits daily and send alerts at 80/90/95%
        $schedule->job(new CheckSubscriptionLimitsJob)->dailyAt('07:00');

        // Sync subscription usage statistics every 6 hours
        $schedule->job(new SyncSubscriptionUsageJob)->everySixHours();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
