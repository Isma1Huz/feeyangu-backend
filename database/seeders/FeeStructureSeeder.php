<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\FeeStructure;
use App\Models\FeeItem;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\ReceiptItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class FeeStructureSeeder extends Seeder
{
    private $feeItems = [
        ['name' => 'Tuition Fee', 'amount' => 5000000],
        ['name' => 'Books & Stationery', 'amount' => 1500000],
        ['name' => 'School Uniform', 'amount' => 800000],
        ['name' => 'Transport', 'amount' => 1200000],
        ['name' => 'Lunch', 'amount' => 2000000],
    ];

    public function run(): void
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $terms = $school->academicTerms;
            $grades = $school->grades;
            
            foreach ($grades as $grade) {
                foreach ($terms as $term) {
                    $feeStructure = FeeStructure::create([
                        'school_id' => $school->id,
                        'name' => $grade->name . ' - ' . $term->name,
                        'grade_id' => $grade->id,
                        'term_id' => $term->id,
                        'total_amount' => 0,
                        'status' => 'active',
                    ]);

                    $totalAmount = 0;
                    $selectedItems = array_slice($this->feeItems, 0, rand(3, 5));
                    
                    foreach ($selectedItems as $item) {
                        FeeItem::create([
                            'fee_structure_id' => $feeStructure->id,
                            'name' => $item['name'],
                            'amount' => $item['amount'],
                        ]);
                        $totalAmount += $item['amount'];
                    }

                    $feeStructure->update(['total_amount' => $totalAmount]);
                }
            }

            $this->createPaymentsAndInvoices($school);
        }
    }

    private function createPaymentsAndInvoices(School $school): void
    {
        $students = Student::where('school_id', $school->id)->get();
        $terms = $school->academicTerms;
        
        foreach ($students as $student) {
            $parent = $student->parents->first();
            if (!$parent) continue;

            foreach ($terms as $termIndex => $term) {
                $feeStructure = FeeStructure::where('school_id', $school->id)
                    ->where('grade_id', $student->grade_id)
                    ->where('term_id', $term->id)
                    ->first();

                if (!$feeStructure) continue;

                $invoiceNumber = 'INV' . date('Y') . str_pad($school->id, 3, '0', STR_PAD_LEFT) . str_pad($student->id, 4, '0', STR_PAD_LEFT) . ($termIndex + 1);
                
                $invoice = Invoice::create([
                    'school_id' => $school->id,
                    'invoice_number' => $invoiceNumber,
                    'student_id' => $student->id,
                    'grade' => $student->grade->name,
                    'term' => $term->name,
                    'total_amount' => $feeStructure->total_amount,
                    'paid_amount' => 0,
                    'balance' => $feeStructure->total_amount,
                    'status' => 'sent',
                    'due_date' => Carbon::parse($term->start_date)->addDays(30),
                    'issued_date' => Carbon::parse($term->start_date)->subDays(7),
                    'sent_via' => 'email',
                ]);

                foreach ($feeStructure->feeItems as $feeItem) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'name' => $feeItem->name,
                        'amount' => $feeItem->amount,
                    ]);
                }

                $paymentScenarios = ['full', 'partial', 'none'];
                $scenario = $paymentScenarios[array_rand($paymentScenarios)];

                if ($scenario === 'full') {
                    $this->createPayment($school, $student, $parent, $invoice, $feeStructure->total_amount, 'completed');
                    $invoice->update([
                        'paid_amount' => $feeStructure->total_amount,
                        'balance' => 0,
                        'status' => 'paid',
                    ]);
                } elseif ($scenario === 'partial') {
                    $partialAmount = intval($feeStructure->total_amount * 0.5);
                    $this->createPayment($school, $student, $parent, $invoice, $partialAmount, 'completed');
                    $invoice->update([
                        'paid_amount' => $partialAmount,
                        'balance' => $feeStructure->total_amount - $partialAmount,
                        'status' => 'partial',
                    ]);
                }

                if ($scenario === 'none' && Carbon::parse($invoice->due_date)->isPast()) {
                    $invoice->update(['status' => 'overdue']);
                }
            }
        }
    }

    private function createPayment(School $school, Student $student, $parent, Invoice $invoice, int $amount, string $status): void
    {
        $providers = ['mpesa', 'bank'];
        $provider = $providers[array_rand($providers)];
        
        $transaction = PaymentTransaction::create([
            'school_id' => $school->id,
            'student_id' => $student->id,
            'parent_id' => $parent->id,
            'amount' => $amount,
            'provider' => $provider,
            'status' => $status,
            'reference' => 'TXN' . strtoupper(uniqid()),
            'phone_number' => $parent->phone,
            'provider_reference' => strtoupper(uniqid()),
            'completed_at' => $status === 'completed' ? now() : null,
        ]);

        if ($status === 'completed') {
            $receiptNumber = 'RCP' . date('Y') . str_pad($school->id, 3, '0', STR_PAD_LEFT) . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
            
            $receipt = Receipt::create([
                'school_id' => $school->id,
                'payment_transaction_id' => $transaction->id,
                'receipt_number' => $receiptNumber,
                'student_id' => $student->id,
                'amount' => $amount,
                'payment_method' => $provider,
                'payment_reference' => $transaction->provider_reference,
                'issued_at' => now(),
            ]);

            ReceiptItem::create([
                'receipt_id' => $receipt->id,
                'name' => 'Payment for ' . $invoice->term,
                'amount' => $amount,
            ]);
        }
    }
}
