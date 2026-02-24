<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reconciliation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('bank_transaction_id')->nullable()->constrained('bank_transactions')->onDelete('cascade');
            $table->foreignId('system_payment_id')->nullable()->constrained('payment_transactions')->onDelete('cascade');
            $table->enum('status', ['matched', 'suggested', 'unmatched_system', 'unmatched_bank'])->default('unmatched_system');
            $table->enum('confidence', ['high', 'medium', 'low'])->nullable();
            $table->timestamp('matched_at')->nullable();
            $table->foreignId('matched_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('school_id');
            $table->index('bank_transaction_id');
            $table->index('system_payment_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reconciliation_items');
    }
};
