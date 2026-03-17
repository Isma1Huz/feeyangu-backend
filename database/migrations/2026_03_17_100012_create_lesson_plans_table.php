<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('academic_subjects')->cascadeOnDelete();
            $table->foreignId('grade_class_id')->nullable()->constrained('grade_classes')->nullOnDelete();
            $table->string('topic');
            $table->string('sub_topic')->nullable();
            $table->json('learning_objectives')->nullable();
            $table->json('resources')->nullable();
            $table->json('lesson_structure')->nullable();
            $table->json('assessment_methods')->nullable();
            $table->text('differentiation')->nullable();
            $table->text('reflection')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->date('date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_plans');
    }
};
