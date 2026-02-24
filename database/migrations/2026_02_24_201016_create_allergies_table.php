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
        Schema::create('allergies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('allergen');
            $table->enum('allergen_category', ['food', 'medication', 'environmental', 'insect', 'other']);
            $table->string('reaction_type');
            $table->enum('severity', ['mild', 'moderate', 'severe', 'life_threatening']);
            $table->text('emergency_protocol');
            $table->boolean('epi_pen_available')->default(false);
            $table->string('epi_pen_location')->nullable();
            $table->timestamps();
            
            $table->index('student_id');
            $table->index('severity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allergies');
    }
};
