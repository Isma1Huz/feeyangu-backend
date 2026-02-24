<?php

namespace App\Services;

use App\Models\Receipt;
use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Support\Facades\View;

/**
 * PDF Generation Service
 * 
 * Note: This service provides PDF generation infrastructure.
 * To use, install barryvdh/laravel-dompdf:
 * composer require barryvdh/laravel-dompdf
 * 
 * Then uncomment the PDF::loadView() calls below.
 */
class PDFService
{
    /**
     * Generate receipt PDF
     */
    public function generateReceiptPDF(Receipt $receipt)
    {
        $receipt->load(['student', 'school', 'items']);
        
        $data = [
            'receipt' => $receipt,
            'student' => $receipt->student,
            'school' => $receipt->school,
            'items' => $receipt->items,
            'issued_date' => $receipt->issued_at->format('d M Y'),
            'amount_kes' => number_format($receipt->amount / 100, 2),
        ];
        
        // If DomPDF is installed, use this:
        // $pdf = \PDF::loadView('pdf.receipt', $data);
        // return $pdf->download("receipt-{$receipt->receipt_number}.pdf");
        
        // For now, return HTML view that can be printed
        return View::make('pdf.receipt', $data)->render();
    }

    /**
     * Generate invoice PDF
     */
    public function generateInvoicePDF(Invoice $invoice)
    {
        $invoice->load(['student', 'school', 'items']);
        
        $data = [
            'invoice' => $invoice,
            'student' => $invoice->student,
            'school' => $invoice->school,
            'items' => $invoice->items,
            'issue_date' => $invoice->issued_date->format('d M Y'),
            'due_date' => $invoice->due_date->format('d M Y'),
            'total_amount_kes' => number_format($invoice->total_amount / 100, 2),
            'paid_amount_kes' => number_format($invoice->paid_amount / 100, 2),
            'balance_kes' => number_format($invoice->balance / 100, 2),
        ];
        
        // If DomPDF is installed, use this:
        // $pdf = \PDF::loadView('pdf.invoice', $data);
        // return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
        
        // For now, return HTML view that can be printed
        return View::make('pdf.invoice', $data)->render();
    }

    /**
     * Generate student report PDF
     */
    public function generateStudentReportPDF(Student $student)
    {
        $student->load([
            'grade',
            'gradeClass',
            'school',
            'invoices' => function ($query) {
                $query->orderBy('issued_date', 'desc')->limit(10);
            },
            'paymentTransactions' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }
        ]);
        
        $totalInvoiced = $student->invoices->sum('total_amount');
        $totalPaid = $student->invoices->sum('paid_amount');
        $balance = $totalInvoiced - $totalPaid;
        
        $data = [
            'student' => $student,
            'school' => $student->school,
            'grade' => $student->grade,
            'class' => $student->gradeClass,
            'invoices' => $student->invoices,
            'payments' => $student->paymentTransactions,
            'total_invoiced_kes' => number_format($totalInvoiced / 100, 2),
            'total_paid_kes' => number_format($totalPaid / 100, 2),
            'balance_kes' => number_format($balance / 100, 2),
            'generated_date' => now()->format('d M Y'),
        ];
        
        // If DomPDF is installed, use this:
        // $pdf = \PDF::loadView('pdf.student-report', $data);
        // return $pdf->download("student-report-{$student->admission_number}.pdf");
        
        // For now, return HTML view that can be printed
        return View::make('pdf.student-report', $data)->render();
    }

    /**
     * Generate financial statement PDF
     */
    public function generateFinancialStatementPDF($schoolId, $startDate, $endDate)
    {
        $school = \App\Models\School::findOrFail($schoolId);
        
        // Get invoices in date range
        $invoices = Invoice::where('school_id', $schoolId)
            ->whereBetween('issued_date', [$startDate, $endDate])
            ->with(['student'])
            ->get();
        
        // Get payments in date range
        $payments = \App\Models\PaymentTransaction::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->get();
        
        // Get expenses in date range
        $expenses = \App\Models\ExpenseRecord::where('school_id', $schoolId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', 'approved')
            ->get();
        
        $totalInvoiced = $invoices->sum('total_amount');
        $totalPaid = $payments->sum('amount');
        $totalExpenses = $expenses->sum('amount');
        $netRevenue = $totalPaid - $totalExpenses;
        
        $data = [
            'school' => $school,
            'start_date' => $startDate->format('d M Y'),
            'end_date' => $endDate->format('d M Y'),
            'invoices' => $invoices,
            'payments' => $payments,
            'expenses' => $expenses,
            'total_invoiced_kes' => number_format($totalInvoiced / 100, 2),
            'total_paid_kes' => number_format($totalPaid / 100, 2),
            'total_expenses_kes' => number_format($totalExpenses / 100, 2),
            'net_revenue_kes' => number_format($netRevenue / 100, 2),
            'invoice_count' => $invoices->count(),
            'payment_count' => $payments->count(),
            'expense_count' => $expenses->count(),
            'generated_date' => now()->format('d M Y'),
        ];
        
        // If DomPDF is installed, use this:
        // $pdf = \PDF::loadView('pdf.financial-statement', $data);
        // return $pdf->download("financial-statement-{$startDate->format('Y-m-d')}-to-{$endDate->format('Y-m-d')}.pdf");
        
        // For now, return HTML view that can be printed
        return View::make('pdf.financial-statement', $data)->render();
    }
}
