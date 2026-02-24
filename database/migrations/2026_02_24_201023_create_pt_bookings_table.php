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
        Schema::create('pt_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slot_id')->constrained('pt_slots')->onDelete('cascade');
            $table->foreignId('session_id')->constrained('pt_sessions')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'])->default('pending');
            $table->text('parent_message')->nullable();
            $table->text('teacher_notes')->nullable();
            $table->text('reschedule_reason')->nullable();
            $table->timestamp('booked_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('slot_id');
            $table->index('session_id');
            $table->index('parent_id');
            $table->index('student_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_bookings');
    }
};
