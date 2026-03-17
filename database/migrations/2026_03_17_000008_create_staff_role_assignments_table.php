<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_role_assignments', function (Blueprint $table) {
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('school_roles')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();

            $table->unique(['staff_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_role_assignments');
    }
};
