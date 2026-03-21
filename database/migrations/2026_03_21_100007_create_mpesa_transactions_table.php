<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mpesa_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->nullable()->constrained('payment_transactions')->nullOnDelete();
            $table->string('mpesa_receipt')->unique()->nullable();
            $table->string('phone_number', 20);
            $table->timestamp('transaction_date')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('account_reference')->nullable();
            $table->string('transaction_desc')->nullable();
            $table->integer('result_code')->nullable();
            $table->string('result_desc')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->index('payment_id');
            $table->index('phone_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mpesa_transactions');
    }
};
