<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
use App\Models\ExpenseRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Fetch distinct grade names so the frontend modal can build a real grade filter
        $grades = $school->students()
            ->whereNotNull('grade_id')
            ->with('grade:id,name')
            ->get()
            ->pluck('grade.name')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        $reports = [
            [
                'key' => 'incomeStatement',
                'icon' => 'TrendingUp',
                'description' => 'Revenue and expense summary for a given period.',
                'lastGenerated' => now()->subDays(15)->format('Y-m-d'),
                'color' => 'hsl(142, 72%, 35%)',
            ],
            [
                'key' => 'cashFlow',
                'icon' => 'BarChart3',
                'description' => 'Cash inflows and outflows analysis.',
                'lastGenerated' => now()->subDays(17)->format('Y-m-d'),
                'color' => 'hsl(200, 72%, 45%)',
            ],
            [
                'key' => 'feeCollection',
                'icon' => 'FileText',
                'description' => 'Detailed fee collection breakdown by grade and class.',
                'lastGenerated' => now()->subDays(11)->format('Y-m-d'),
                'color' => 'hsl(var(--primary))',
            ],
            [
                'key' => 'outstanding',
                'icon' => 'Clock',
                'description' => 'All outstanding and overdue fee balances.',
                'lastGenerated' => now()->subDays(11)->format('Y-m-d'),
                'color' => 'hsl(45, 90%, 50%)',
            ],
            [
                'key' => 'paymentMethod',
                'icon' => 'Calendar',
                'description' => 'Transaction breakdown by payment method with fees.',
                'lastGenerated' => now()->subDays(13)->format('Y-m-d'),
                'color' => 'hsl(280, 60%, 50%)',
            ],
            [
                'key' => 'aging',
                'icon' => 'BarChart3',
                'description' => 'Receivables categorized by age (30/60/90+ days).',
                'lastGenerated' => now()->subDays(11)->format('Y-m-d'),
                'color' => 'hsl(0, 72%, 45%)',
            ],
            [
                'key' => 'audit',
                'icon' => 'Shield',
                'description' => 'Complete audit trail of all financial actions.',
                'lastGenerated' => now()->subDays(12)->format('Y-m-d'),
                'color' => 'hsl(220, 60%, 50%)',
            ],
        ];

        return Inertia::render('accountant/Reports', [
            'reports' => $reports,
            'grades' => $grades,
        ]);
    }

    /**
     * Generate a financial report (POST). For CSV, redirects to the GET download endpoint.
     * For pdf/excel, redirects back with a success flash message.
     */
    public function generate(Request $request): \Illuminate\Http\RedirectResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $validated = $request->validate([
            'reportType' => 'required|string|in:incomeStatement,cashFlow,feeCollection,outstanding,paymentMethod,aging,audit',
            'dateFrom' => 'required|date',
            'dateTo' => 'required|date|after_or_equal:dateFrom',
            'format' => 'required|in:pdf,excel,csv',
            'grade' => 'nullable|string',
        ]);

        // For CSV, redirect to the GET download endpoint so the browser receives the file
        if ($validated['format'] === 'csv') {
            return redirect()->route('accountant.reports.download', [
                'reportType' => $validated['reportType'],
                'dateFrom'   => $validated['dateFrom'],
                'dateTo'     => $validated['dateTo'],
                'grade'      => $validated['grade'] ?? 'all',
            ]);
        }

        // For PDF/Excel (libraries not yet installed), return redirect back with success note
        return redirect()->route('accountant.reports.index')
            ->with('success', "Report '{$validated['reportType']}' generated for {$validated['dateFrom']} to {$validated['dateTo']}. Install barryvdh/laravel-dompdf (PDF) or maatwebsite/excel (Excel) to enable file downloads.");
    }

    /**
     * Download a report as CSV via GET request (used by the download icon button).
     */
    public function download(Request $request)
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $validated = $request->validate([
            'reportType' => 'required|string|in:incomeStatement,cashFlow,feeCollection,outstanding,paymentMethod,aging,audit',
            'dateFrom' => 'required|date',
            'dateTo' => 'required|date|after_or_equal:dateFrom',
            'grade' => 'nullable|string',
        ]);

        $data = $this->generateReportData(
            $school,
            $validated['reportType'],
            $validated['dateFrom'],
            $validated['dateTo'],
            $validated['grade'] ?? 'all'
        );

        return $this->generateCSV($data, $validated['reportType']);
    }

    /**
     * Generate report data based on report type.
     */
    private function generateReportData($school, $reportType, $dateFrom, $dateTo, $grade)
    {
        switch ($reportType) {
            case 'incomeStatement':
                return $this->generateIncomeStatement($school, $dateFrom, $dateTo);
            
            case 'cashFlow':
                return $this->generateCashFlow($school, $dateFrom, $dateTo);
            
            case 'feeCollection':
                return $this->generateFeeCollection($school, $dateFrom, $dateTo, $grade);
            
            case 'outstanding':
                return $this->generateOutstanding($school, $dateFrom, $dateTo, $grade);
            
            case 'paymentMethod':
                return $this->generatePaymentMethod($school, $dateFrom, $dateTo);
            
            case 'aging':
                return $this->generateAging($school, $dateFrom, $dateTo, $grade);
            
            case 'audit':
                return $this->generateAudit($school, $dateFrom, $dateTo);
            
            default:
                return [];
        }
    }

    /**
     * Generate income statement data.
     */
    private function generateIncomeStatement($school, $dateFrom, $dateTo)
    {
        $revenue = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$dateFrom, $dateTo])
            ->sum('amount') / 100;

        $expenses = ExpenseRecord::where('school_id', $school->id)
            ->where('status', 'approved')
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->sum('amount') / 100;

        return [
            ['Category', 'Amount'],
            ['Revenue', $revenue],
            ['Expenses', $expenses],
            ['Net Income', $revenue - $expenses],
        ];
    }

    /**
     * Generate cash flow data.
     */
    private function generateCashFlow($school, $dateFrom, $dateTo)
    {
        $payments = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$dateFrom, $dateTo])
            ->selectRaw("date(completed_at) as date, SUM(amount) as total")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [$item->date, $item->total / 100]);

        return array_merge([['Date', 'Cash Inflow']], $payments->toArray());
    }

    /**
     * Generate fee collection data.
     */
    private function generateFeeCollection($school, $dateFrom, $dateTo, $grade)
    {
        $query = Invoice::where('school_id', $school->id)
            ->whereBetween('issued_date', [$dateFrom, $dateTo]);

        if ($grade !== 'all') {
            $query->where('grade', $grade);
        }

        $invoices = $query->with('student')
            ->get()
            ->map(fn($inv) => [
                $inv->student->full_name,
                $inv->grade,
                $inv->total_amount / 100,
                $inv->paid_amount / 100,
                $inv->balance / 100,
                $inv->status,
            ]);

        return array_merge(
            [['Student', 'Grade', 'Total Amount', 'Paid Amount', 'Balance', 'Status']],
            $invoices->toArray()
        );
    }

    /**
     * Generate outstanding balances data.
     */
    private function generateOutstanding($school, $dateFrom, $dateTo, $grade)
    {
        $query = Invoice::where('school_id', $school->id)
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->where('balance', '>', 0);

        if ($grade !== 'all') {
            $query->where('grade', $grade);
        }

        $invoices = $query->with('student')
            ->get()
            ->map(fn($inv) => [
                $inv->student->full_name,
                $inv->grade,
                $inv->invoice_number,
                $inv->balance / 100,
                $inv->due_date->format('Y-m-d'),
                $inv->status,
            ]);

        return array_merge(
            [['Student', 'Grade', 'Invoice #', 'Outstanding Balance', 'Due Date', 'Status']],
            $invoices->toArray()
        );
    }

    /**
     * Generate payment method breakdown data.
     */
    private function generatePaymentMethod($school, $dateFrom, $dateTo)
    {
        $payments = PaymentTransaction::where('school_id', $school->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$dateFrom, $dateTo])
            ->selectRaw('provider, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('provider')
            ->get()
            ->map(fn($item) => [
                $item->provider,
                $item->count,
                $item->total / 100,
            ]);

        return array_merge(
            [['Payment Method', 'Transaction Count', 'Total Amount']],
            $payments->toArray()
        );
    }

    /**
     * Generate aging report data.
     */
    private function generateAging($school, $dateFrom, $dateTo, $grade)
    {
        $query = Invoice::where('school_id', $school->id)
            ->where('balance', '>', 0);

        if ($grade !== 'all') {
            $query->where('grade', $grade);
        }

        $invoices = $query->with('student')
            ->get()
            ->map(function ($inv) {
                $daysOverdue = now()->diffInDays($inv->due_date, false);
                $ageCategory = $daysOverdue <= 0 ? 'Current' :
                              ($daysOverdue <= 30 ? '1-30 days' :
                              ($daysOverdue <= 60 ? '31-60 days' :
                              ($daysOverdue <= 90 ? '61-90 days' : '90+ days')));

                return [
                    $inv->student->full_name,
                    $inv->invoice_number,
                    $inv->balance / 100,
                    $inv->due_date->format('Y-m-d'),
                    abs($daysOverdue),
                    $ageCategory,
                ];
            });

        return array_merge(
            [['Student', 'Invoice #', 'Balance', 'Due Date', 'Days Overdue', 'Age Category']],
            $invoices->toArray()
        );
    }

    /**
     * Generate audit trail data.
     */
    private function generateAudit($school, $dateFrom, $dateTo)
    {
        // This would ideally come from an audit log table
        // For now, return payment transactions as a basic audit trail
        $transactions = PaymentTransaction::where('school_id', $school->id)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->with(['student', 'parent'])
            ->get()
            ->map(fn($txn) => [
                $txn->created_at->format('Y-m-d H:i:s'),
                'Payment',
                $txn->student->full_name,
                $txn->parent?->name ?? 'N/A',
                $txn->amount / 100,
                $txn->provider,
                $txn->status,
                $txn->reference,
            ]);

        return array_merge(
            [['Date & Time', 'Type', 'Student', 'Parent', 'Amount', 'Provider', 'Status', 'Reference']],
            $transactions->toArray()
        );
    }

    /**
     * Generate CSV file from data array.
     */
    private function generateCSV($data, $reportType)
    {
        $filename = "{$reportType}-" . now()->format('Y-m-d') . '.csv';

        $handle = fopen('php://temp', 'r+');
        foreach ($data as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
