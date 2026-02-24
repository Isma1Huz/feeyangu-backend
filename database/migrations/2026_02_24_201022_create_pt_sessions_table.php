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
        Schema::create('pt_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->string('name');
            $table->json('dates');
            $table->integer('slot_duration_minutes');
            $table->integer('break_between_slots_minutes');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('venue');
            $table->text('parent_instructions')->nullable();
            $table->enum('status', ['draft', 'open', 'closed', 'completed'])->default('draft');
            $table->date('booking_deadline');
            $table->timestamps();
            
            $table->index('school_id');
            $table->index('status');
            $table->index('booking_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_sessions');
    }
};
