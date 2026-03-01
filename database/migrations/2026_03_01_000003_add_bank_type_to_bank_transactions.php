<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->string('bank')->nullable()->after('school_id');
            $table->string('type')->default('credit')->after('amount');
            // Make balance nullable since imports may not have it
            $table->bigInteger('balance')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->dropColumn(['bank', 'type']);
        });
    }
};
