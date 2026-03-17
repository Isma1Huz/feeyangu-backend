<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_dashboard_overrides', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('config_key');
            $table->boolean('config_value')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'config_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_dashboard_overrides');
    }
};
