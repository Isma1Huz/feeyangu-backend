<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('schools')->cascadeOnDelete();
            $table->enum('user_type', ['parent', 'student', 'teacher', 'staff', 'principal']);
            $table->string('config_key');
            $table->boolean('config_value')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tenant_id', 'user_type', 'config_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_configs');
    }
};
