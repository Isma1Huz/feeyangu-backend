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
        Schema::create('school_payment_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->enum('provider', ['mpesa', 'equity', 'kcb', 'coop', 'ncba', 'absa', 'stanbic', 'dtb', 'im_bank', 'family_bank']);
            $table->boolean('enabled')->default(true);
            $table->string('account_number');
            $table->string('account_name');
            $table->string('paybill_number')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index('school_id');
            $table->index(['school_id', 'enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_payment_configs');
    }
};
