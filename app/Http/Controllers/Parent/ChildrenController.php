<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class ChildrenController extends Controller
{
    /**
     * Display a listing of the parent's children with detailed information.
     */
    public function index(): Response
    {
        $user = auth()->user();

        $children = $user->students()
            ->with(['grade', 'class', 'invoices'])
            ->get()
            ->map(function ($student) {
                $invoices = $student->invoices;
                $totalFees = $invoices->sum('total_amount') / 100;
                $paidFees = $invoices->sum('paid_amount') / 100;

                return [
                    'studentId' => (string) $student->id,
                    'name' => $student->full_name,
                    'grade' => $student->grade ? $student->grade->name : '',
                    'className' => $student->class ? $student->class->name : '',
                    'status' => $student->status,
                    'paidFees' => $paidFees,
                    'totalFees' => $totalFees,
                ];
            });

        return Inertia::render('parent/Children', [
            'children' => $children,
        ]);
    }

    /**
     * Display detailed information for a specific child.
     */
    public function show(Student $student): Response
    {
        // Verify the parent has access to this student
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access to this student');
        }

        $student->load([
            'grade',
            'class',
            'school',
            'invoices' => function ($query) {
                $query->latest()->with('invoiceItems');
            },
            'paymentTransactions' => function ($query) {
                $query->latest()->with('receipt')->take(20);
            },
        ]);

        // Financial summary
        $financialSummary = [
            'total_invoiced' => $student->invoices()->sum('total_amount') / 100,
            'total_paid' => $student->invoices()->sum('paid_amount') / 100,
            'total_balance' => $student->invoices()->whereIn('status', ['sent', 'partial', 'overdue'])->sum('balance') / 100,
            'overdue_amount' => $student->invoices()->where('status', 'overdue')->sum('balance') / 100,
        ];

        // Payment methods available for this school
        $paymentMethods = $student->school->schoolPaymentConfigs()
            ->where('enabled', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($config) => [
                'id' => $config->id,
                'provider' => $config->provider,
                'account_name' => $config->account_name,
                'account_number' => $config->account_number,
                'paybill_number' => $config->paybill_number,
            ]);

        return Inertia::render('parent/ChildShow', [
            'child' => [
                'id' => $student->id,
                'admission_number' => $student->admission_number,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'grade' => [
                    'id' => $student->grade->id,
                    'name' => $student->grade->name,
                ],
                'class' => [
                    'id' => $student->class->id,
                    'name' => $student->class->name,
                ],
                'school' => [
                    'id' => $student->school->id,
                    'name' => $student->school->name,
                    'location' => $student->school->location,
                ],
                'status' => $student->status,
            ],
            'invoices' => $student->invoices->map(fn($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'total_amount' => $invoice->total_amount / 100,
                'paid_amount' => $invoice->paid_amount / 100,
                'balance' => $invoice->balance / 100,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date->format('M d, Y'),
                'issued_date' => $invoice->issued_date->format('M d, Y'),
                'items' => $invoice->invoiceItems->map(fn($item) => [
                    'name' => $item->name,
                    'amount' => $item->amount / 100,
                ]),
            ]),
            'recentPayments' => $student->paymentTransactions->map(fn($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount / 100,
                'provider' => $payment->provider,
                'status' => $payment->status,
                'reference' => $payment->reference,
                'created_at' => $payment->created_at->format('M d, Y H:i'),
                'has_receipt' => $payment->receipt !== null,
                'receipt_number' => $payment->receipt?->receipt_number,
            ]),
            'financialSummary' => $financialSummary,
            'paymentMethods' => $paymentMethods,
        ]);
    }
}
