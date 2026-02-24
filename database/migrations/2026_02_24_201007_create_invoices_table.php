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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->string('invoice_number');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('grade');
            $table->string('term');
            $table->bigInteger('total_amount');
            $table->bigInteger('paid_amount')->default(0);
            $table->bigInteger('balance');
            $table->enum('status', ['draft', 'sent', 'paid', 'partial', 'overdue', 'void'])->default('draft');
            $table->date('due_date');
            $table->date('issued_date');
            $table->enum('sent_via', ['email', 'sms', 'both', 'none'])->default('none');
            $table->timestamps();
            
            $table->unique(['school_id', 'invoice_number']);
            $table->index('school_id');
            $table->index('student_id');
            $table->index('status');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
