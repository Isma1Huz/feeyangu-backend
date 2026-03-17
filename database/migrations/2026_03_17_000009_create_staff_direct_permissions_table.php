<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_direct_permissions', function (Blueprint $table) {
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();

            $table->unique(['staff_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_direct_permissions');
    }
};
