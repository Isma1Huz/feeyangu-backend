<?php

namespace App\Console\Commands;

use App\Jobs\CheckOverdueInvoicesJob;
use Illuminate\Console\Command;

class CheckOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for overdue invoices and notify parents';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Dispatching overdue invoice check job...');
        
        CheckOverdueInvoicesJob::dispatch();
        
        $this->info('Job dispatched successfully!');
        
        return Command::SUCCESS;
    }
}
