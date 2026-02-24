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
        Schema::create('medical_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['chronic', 'acute', 'infectious', 'hereditary', 'other']);
            $table->enum('severity', ['mild', 'moderate', 'severe', 'critical']);
            $table->date('diagnosed_date')->nullable();
            $table->string('treating_doctor')->nullable();
            $table->text('management_notes')->nullable();
            $table->text('emergency_action_plan')->nullable();
            $table->enum('status', ['active', 'resolved', 'monitoring'])->default('active');
            $table->timestamps();
            
            $table->index('student_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_conditions');
    }
};
