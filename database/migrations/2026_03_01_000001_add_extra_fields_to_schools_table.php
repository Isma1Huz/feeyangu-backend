<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('motto')->nullable()->after('logo');
            $table->string('email')->nullable()->after('motto');
            $table->string('phone')->nullable()->after('email');
            $table->string('primary_color', 7)->nullable()->default('#8B0000')->after('phone');
            $table->string('secondary_color', 7)->nullable()->default('#FFD700')->after('primary_color');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn(['motto', 'email', 'phone', 'primary_color', 'secondary_color']);
        });
    }
};
