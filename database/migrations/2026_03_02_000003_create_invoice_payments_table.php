<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Invoice allocation tracking table.
 *
 * Records how much of each completed PaymentTransaction is applied to each
 * Invoice, enabling partial payments to be spread across multiple invoices.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->onDelete('cascade');
            $table->foreignId('payment_transaction_id')
                ->constrained('payment_transactions')
                ->onDelete('cascade');
            // Amount applied to this invoice (in cents, same unit as payment_transactions.amount)
            $table->bigInteger('amount_applied');
            $table->timestamps();

            // Each transaction can be applied to the same invoice only once.
            $table->unique(
                ['invoice_id', 'payment_transaction_id'],
                'ip_invoice_transaction_unique'
            );
            $table->index('invoice_id');
            $table->index('payment_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_payments');
    }
};
