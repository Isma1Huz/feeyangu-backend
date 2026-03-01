<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Partial-payment schema changes:
 *
 * 1. Remove the unique constraint on payment_transactions.reference so the same
 *    stable reference (BillRefNumber) can be reused across multiple C2B payments.
 * 2. Add a unique constraint on (provider, provider_reference) for idempotency –
 *    this prevents duplicate processing of the same provider transaction ID.
 *    NULL values are excluded from uniqueness checks (both SQLite and MySQL),
 *    so pending/processing rows with no provider_reference are unaffected.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            // Drop the old unique constraint on reference.
            // The regular index added in add_additional_indexes_for_performance.php is kept.
            $table->dropUnique(['reference']);

            // Idempotency: prevent duplicate completed transactions from the same provider receipt.
            $table->unique(['provider', 'provider_reference'], 'payments_provider_ref_unique');
        });
    }

    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropUnique('payments_provider_ref_unique');
            $table->unique('reference');
        });
    }
};
