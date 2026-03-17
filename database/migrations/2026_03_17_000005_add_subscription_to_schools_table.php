<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete()->after('secondary_color');
            $table->enum('subscription_status', ['active', 'past_due', 'canceled', 'expired'])->default('active')->after('plan_id');
            $table->date('subscription_start_date')->nullable()->after('subscription_status');
            $table->date('subscription_end_date')->nullable()->after('subscription_start_date');
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly')->after('subscription_end_date');
            $table->unsignedInteger('max_students')->default(0)->after('billing_cycle'); // 0 = use plan default
            $table->unsignedInteger('max_staff')->default(0)->after('max_students');
            $table->unsignedInteger('max_storage_mb')->default(0)->after('max_staff');
            $table->json('addon_modules')->nullable()->after('max_storage_mb');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn([
                'plan_id', 'subscription_status', 'subscription_start_date',
                'subscription_end_date', 'billing_cycle', 'max_students',
                'max_staff', 'max_storage_mb', 'addon_modules',
            ]);
        });
    }
};
