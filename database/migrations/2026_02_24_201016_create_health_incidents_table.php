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
        Schema::create('health_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->date('incident_date');
            $table->time('incident_time');
            $table->enum('type', ['injury', 'illness', 'accident', 'medication', 'other']);
            $table->text('description');
            $table->text('action_taken');
            $table->string('reported_by');
            $table->boolean('parent_notified')->default(false);
            $table->timestamp('parent_notified_at')->nullable();
            $table->boolean('external_medical_help')->default(false);
            $table->text('external_medical_details')->nullable();
            $table->boolean('follow_up_required')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->boolean('follow_up_completed')->default(false);
            $table->text('follow_up_notes')->nullable();
            $table->timestamps();
            
            $table->index('student_id');
            $table->index('incident_date');
            $table->index('follow_up_required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_incidents');
    }
};
