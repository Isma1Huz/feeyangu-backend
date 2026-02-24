<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use Illuminate\Support\Collection;

/**
 * Export Service for CSV/Excel generation
 * 
 * Note: For Excel export, install maatwebsite/excel:
 * composer require maatwebsite/excel
 */
class ExportService
{
    /**
     * Export students to CSV
     */
    public function exportStudentsToCSV($schoolId)
    {
        $students = Student::where('school_id', $schoolId)
            ->with(['grade', 'gradeClass'])
            ->get();
        
        $csv = $this->generateCSV($students, function ($student) {
            return [
                'Admission Number' => $student->admission_number,
                'First Name' => $student->first_name,
                'Last Name' => $student->last_name,
                'Grade' => $student->grade->name ?? '',
                'Class' => $student->gradeClass->name ?? '',
                'Status' => $student->status,
            ];
        });
        
        return $csv;
    }

    /**
     * Export invoices to CSV
     */
    public function exportInvoicesToCSV($schoolId, $startDate = null, $endDate = null)
    {
        $query = Invoice::where('school_id', $schoolId)->with(['student']);
        
        if ($startDate) {
            $query->where('issued_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('issued_date', '<=', $endDate);
        }
        
        $invoices = $query->get();
        
        $csv = $this->generateCSV($invoices, function ($invoice) {
            return [
                'Invoice Number' => $invoice->invoice_number,
                'Student' => $invoice->student->first_name . ' ' . $invoice->student->last_name,
                'Admission Number' => $invoice->student->admission_number,
                'Total Amount (KES)' => number_format($invoice->total_amount / 100, 2),
                'Paid Amount (KES)' => number_format($invoice->paid_amount / 100, 2),
                'Balance (KES)' => number_format($invoice->balance / 100, 2),
                'Status' => $invoice->status,
                'Issue Date' => $invoice->issued_date->format('Y-m-d'),
                'Due Date' => $invoice->due_date->format('Y-m-d'),
            ];
        });
        
        return $csv;
    }

    /**
     * Export payments to CSV
     */
    public function exportPaymentsToCSV($schoolId, $startDate = null, $endDate = null)
    {
        $query = PaymentTransaction::where('school_id', $schoolId)->with(['student']);
        
        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }
        
        $payments = $query->get();
        
        $csv = $this->generateCSV($payments, function ($payment) {
            return [
                'Reference' => $payment->reference,
                'Student' => $payment->student->first_name . ' ' . $payment->student->last_name,
                'Admission Number' => $payment->student->admission_number,
                'Amount (KES)' => number_format($payment->amount / 100, 2),
                'Provider' => $payment->provider,
                'Status' => $payment->status,
                'Phone Number' => $payment->phone_number ?? '',
                'Provider Reference' => $payment->provider_reference ?? '',
                'Created At' => $payment->created_at->format('Y-m-d H:i:s'),
                'Completed At' => $payment->completed_at ? $payment->completed_at->format('Y-m-d H:i:s') : '',
            ];
        });
        
        return $csv;
    }

    /**
     * Export receipts to CSV
     */
    public function exportReceiptsToCSV($schoolId, $startDate = null, $endDate = null)
    {
        $query = Receipt::where('school_id', $schoolId)->with(['student']);
        
        if ($startDate) {
            $query->where('issued_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('issued_at', '<=', $endDate);
        }
        
        $receipts = $query->get();
        
        $csv = $this->generateCSV($receipts, function ($receipt) {
            return [
                'Receipt Number' => $receipt->receipt_number,
                'Student' => $receipt->student->first_name . ' ' . $receipt->student->last_name,
                'Admission Number' => $receipt->student->admission_number,
                'Amount (KES)' => number_format($receipt->amount / 100, 2),
                'Payment Method' => $receipt->payment_method,
                'Payment Reference' => $receipt->payment_reference,
                'Issued At' => $receipt->issued_at->format('Y-m-d H:i:s'),
            ];
        });
        
        return $csv;
    }

    /**
     * Generate CSV from collection with custom mapper
     */
    protected function generateCSV(Collection $collection, callable $mapper)
    {
        if ($collection->isEmpty()) {
            return '';
        }
        
        $output = fopen('php://temp', 'r+');
        
        // Get headers from first item
        $firstItem = $mapper($collection->first());
        fputcsv($output, array_keys($firstItem));
        
        // Write data rows
        foreach ($collection as $item) {
            $row = $mapper($item);
            fputcsv($output, array_values($row));
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return $csv;
    }
}
