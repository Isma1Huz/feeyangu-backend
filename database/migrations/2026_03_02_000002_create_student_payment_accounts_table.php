<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stable per-student-per-school payment reference table.
 *
 * Stores a single, permanent reference that a student/parent uses as the
 * BillRefNumber for both manual PayBill payments and STK Push payments.
 * Multiple PaymentTransaction rows can share this reference (partial payments).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_payment_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            // Unique stable reference, max 30 chars, format: {ADMISSION}-{SCHOOL_ID}-{CODE}
            $table->string('reference', 30)->unique();
            $table->timestamps();

            // A student can only have one payment account per school.
            $table->unique(['school_id', 'student_id'], 'spa_school_student_unique');
            $table->index('school_id');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_payment_accounts');
    }
};
