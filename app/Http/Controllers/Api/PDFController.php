<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PDFService;
use App\Models\Receipt;
use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PDFController extends Controller
{
    protected $pdfService;

    public function __construct(PDFService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Download receipt PDF
     */
    public function receipt($id)
    {
        $schoolId = Auth::user()->school_id;
        
        $receipt = Receipt::where('school_id', $schoolId)
            ->findOrFail($id);
        
        $pdf = $this->pdfService->generateReceiptPDF($receipt);
        
        return response($pdf)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'inline; filename="receipt-' . $receipt->receipt_number . '.html"');
    }

    /**
     * Download invoice PDF
     */
    public function invoice($id)
    {
        $schoolId = Auth::user()->school_id;
        
        $invoice = Invoice::where('school_id', $schoolId)
            ->findOrFail($id);
        
        $pdf = $this->pdfService->generateInvoicePDF($invoice);
        
        return response($pdf)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'inline; filename="invoice-' . $invoice->invoice_number . '.html"');
    }

    /**
     * Download student report PDF
     */
    public function studentReport($id)
    {
        $schoolId = Auth::user()->school_id;
        
        $student = Student::where('school_id', $schoolId)
            ->findOrFail($id);
        
        $pdf = $this->pdfService->generateStudentReportPDF($student);
        
        return response($pdf)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'inline; filename="student-report-' . $student->admission_number . '.html"');
    }

    /**
     * Download financial statement PDF
     */
    public function financialStatement(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        $schoolId = Auth::user()->school_id;
        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate = \Carbon\Carbon::parse($request->end_date);
        
        $pdf = $this->pdfService->generateFinancialStatementPDF($schoolId, $startDate, $endDate);
        
        $filename = "financial-statement-{$startDate->format('Y-m-d')}-to-{$endDate->format('Y-m-d')}.html";
        
        return response($pdf)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', "inline; filename=\"{$filename}\"");
    }
}
