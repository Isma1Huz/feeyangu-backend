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
        // Add composite indexes for frequently queried columns
        Schema::table('students', function (Blueprint $table) {
            $table->index(['school_id', 'status'], 'students_school_status_idx');
            $table->index(['school_id', 'grade_id'], 'students_school_grade_idx');
            $table->index(['school_id', 'admission_number'], 'students_school_admission_idx');
        });

        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->index(['school_id', 'status'], 'payments_school_status_idx');
            $table->index(['school_id', 'created_at'], 'payments_school_created_idx');
            $table->index(['parent_id', 'status'], 'payments_parent_status_idx');
            $table->index(['student_id', 'status'], 'payments_student_status_idx');
            $table->index('reference', 'payments_reference_idx');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['school_id', 'status'], 'invoices_school_status_idx');
            $table->index(['school_id', 'due_date'], 'invoices_school_due_idx');
            $table->index(['student_id', 'status'], 'invoices_student_status_idx');
        });

        Schema::table('receipts', function (Blueprint $table) {
            $table->index(['school_id', 'issued_at'], 'receipts_school_issued_idx');
            $table->index(['student_id', 'issued_at'], 'receipts_student_issued_idx');
            $table->index('receipt_number', 'receipts_number_idx');
        });

        Schema::table('fee_structures', function (Blueprint $table) {
            $table->index(['school_id', 'status'], 'fees_school_status_idx');
            $table->index(['grade_id', 'term_id'], 'fees_grade_term_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'read'], 'notifications_user_read_idx');
            $table->index(['user_id', 'created_at'], 'notifications_user_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('students_school_status_idx');
            $table->dropIndex('students_school_grade_idx');
            $table->dropIndex('students_school_admission_idx');
        });

        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropIndex('payments_school_status_idx');
            $table->dropIndex('payments_school_created_idx');
            $table->dropIndex('payments_parent_status_idx');
            $table->dropIndex('payments_student_status_idx');
            $table->dropIndex('payments_reference_idx');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_school_status_idx');
            $table->dropIndex('invoices_school_due_idx');
            $table->dropIndex('invoices_student_status_idx');
        });

        Schema::table('receipts', function (Blueprint $table) {
            $table->dropIndex('receipts_school_issued_idx');
            $table->dropIndex('receipts_student_issued_idx');
            $table->dropIndex('receipts_number_idx');
        });

        Schema::table('fee_structures', function (Blueprint $table) {
            $table->dropIndex('fees_school_status_idx');
            $table->dropIndex('fees_grade_term_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_user_read_idx');
            $table->dropIndex('notifications_user_created_idx');
        });
    }
};
