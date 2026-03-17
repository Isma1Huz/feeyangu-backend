<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_school', function (Blueprint $table) {
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_enabled')->default(true);
            $table->json('settings')->nullable();              // school-specific module settings
            $table->json('permissions_override')->nullable();  // override default permissions
            $table->timestamps();

            $table->unique(['module_id', 'school_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_school');
    }
};
