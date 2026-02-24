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
        Schema::create('integration_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->enum('provider', ['xero', 'quickbooks', 'zoho', 'wave', 'sage']);
            $table->string('display_name');
            $table->enum('status', ['connected', 'disconnected', 'error', 'syncing'])->default('disconnected');
            $table->timestamp('last_synced_at')->nullable();
            $table->string('sync_frequency');
            $table->integer('items_synced')->default(0);
            $table->text('sync_errors')->nullable();
            $table->timestamps();
            
            $table->index('school_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_configs');
    }
};
