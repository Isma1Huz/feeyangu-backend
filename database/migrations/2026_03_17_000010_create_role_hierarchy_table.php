<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_hierarchy', function (Blueprint $table) {
            $table->foreignId('parent_role_id')->constrained('school_roles')->cascadeOnDelete();
            $table->foreignId('child_role_id')->constrained('school_roles')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['parent_role_id', 'child_role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_hierarchy');
    }
};
