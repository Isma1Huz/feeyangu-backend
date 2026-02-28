<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('school_api_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->enum('provider', ['mpesa', 'equity', 'kcb', 'coop', 'ncba', 'absa', 'stanbic', 'dtb', 'im_bank', 'family_bank']);
            $table->enum('environment', ['sandbox', 'production'])->default('sandbox');
            $table->boolean('enabled')->default(false);
            $table->json('credentials'); // encrypted JSON blob of API key/value pairs
            $table->timestamps();

            $table->unique(['school_id', 'provider']);
            $table->index('school_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_api_credentials');
    }
};
