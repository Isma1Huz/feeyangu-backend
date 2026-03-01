<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            // Add notes column for manual payments
            $table->text('notes')->nullable()->after('completed_at');
            // Make parent_id nullable to support manual payments without a linked parent
            $table->foreignId('parent_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropColumn('notes');
            $table->foreignId('parent_id')->nullable(false)->change();
        });
    }
};
