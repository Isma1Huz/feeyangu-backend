<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->json('dependencies')->nullable(); // array of module keys this depends on
            $table->json('permissions')->nullable();  // default permissions for this module
            $table->json('settings')->nullable();     // module configuration schema
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_core')->default(false); // cannot be disabled
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
