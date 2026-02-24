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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('payment_transaction_id')->constrained('payment_transactions')->onDelete('cascade');
            $table->string('receipt_number');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->bigInteger('amount');
            $table->string('payment_method');
            $table->string('payment_reference');
            $table->timestamp('issued_at');
            $table->timestamps();
            
            $table->unique(['school_id', 'receipt_number']);
            $table->index('school_id');
            $table->index('payment_transaction_id');
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
