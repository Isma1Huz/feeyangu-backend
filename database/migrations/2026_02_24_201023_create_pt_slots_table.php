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
        Schema::create('pt_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('pt_sessions')->onDelete('cascade');
            $table->string('teacher_name');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['available', 'booked', 'blocked', 'completed'])->default('available');
            $table->string('blocked_reason')->nullable();
            $table->timestamps();
            
            $table->index('session_id');
            $table->index('status');
            $table->index(['session_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_slots');
    }
};
