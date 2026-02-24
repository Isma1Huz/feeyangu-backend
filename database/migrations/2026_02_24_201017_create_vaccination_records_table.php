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
        Schema::create('vaccination_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('vaccine_name');
            $table->date('date_administered');
            $table->string('administered_by');
            $table->date('next_due_date')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('certificate_url')->nullable();
            $table->enum('status', ['up_to_date', 'due_soon', 'overdue'])->default('up_to_date');
            $table->timestamps();
            
            $table->index('student_id');
            $table->index('status');
            $table->index('next_due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccination_records');
    }
};
