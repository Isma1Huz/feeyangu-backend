<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Notifications\FeeOverdueNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CheckOverdueInvoicesJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting overdue invoices check...');

        // Find invoices that are overdue and not yet marked as overdue
        $overdueInvoices = Invoice::where('due_date', '<', now())
            ->whereIn('status', ['sent', 'partial'])
            ->where('balance', '>', 0)
            ->with(['student.parents'])
            ->get();

        Log::info("Found {$overdueInvoices->count()} overdue invoices");

        foreach ($overdueInvoices as $invoice) {
            // Update invoice status to overdue
            if ($invoice->status !== 'overdue') {
                $invoice->update(['status' => 'overdue']);
            }

            // Notify all parents of this student
            foreach ($invoice->student->parents as $parent) {
                try {
                    $parent->notify(new FeeOverdueNotification($invoice));
                    Log::info("Sent overdue notification to parent {$parent->id} for invoice {$invoice->id}");
                } catch (\Exception $e) {
                    Log::error("Failed to send overdue notification: " . $e->getMessage());
                }
            }
        }

        Log::info('Completed overdue invoices check');
    }
}
