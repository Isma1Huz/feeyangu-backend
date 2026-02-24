<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Invoice;
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
            ->with(['grade', 'class', 'school'])
            ->get()
            ->map(function ($student) {
                // Get invoices for this student
                $invoices = $student->invoices()
                    ->whereIn('status', ['sent', 'partial', 'overdue'])
                    ->get();

                $totalBalance = $invoices->sum('balance') / 100;
                $overdueBalance = $invoices->where('status', 'overdue')->sum('balance') / 100;

                return [
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
                    'balance' => $totalBalance,
                    'overdue_balance' => $overdueBalance,
                    'has_overdue' => $overdueBalance > 0,
                    'invoice_count' => $invoices->count(),
                ];
            });

        // Calculate summary
        $summary = [
            'total_children' => $children->count(),
            'total_balance' => $children->sum('balance'),
            'total_overdue' => $children->sum('overdue_balance'),
            'children_with_overdue' => $children->where('has_overdue', true)->count(),
        ];

        return Inertia::render('parent/Children', [
            'children' => $children,
            'summary' => $summary,
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
