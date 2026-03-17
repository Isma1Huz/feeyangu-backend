<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add global_disabled flag to modules table and create tenant overrides table.
     * This supports the ModuleService's global/tenant override functionality.
     */
    public function up(): void
    {
        // Add global disable flag to modules
        Schema::table('modules', function (Blueprint $table) {
            $table->boolean('is_globally_disabled')->default(false)->after('is_active');
        });

        // Per-tenant module override: 'enabled' / 'disabled' / 'inherit'
        Schema::create('module_tenant_overrides', function (Blueprint $table) {
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            // 'enabled'  = force-enable even if plan doesn't include it
            // 'disabled' = force-disable even if plan includes it
            // 'inherit'  = follow plan/default (removing row has same effect)
            $table->enum('status', ['enabled', 'disabled', 'inherit'])->default('inherit');
            $table->timestamps();

            $table->unique(['module_id', 'school_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_tenant_overrides');

        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn('is_globally_disabled');
        });
    }
};
