<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Student;
use App\Models\FeeStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;
        $query = $school->invoices();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by invoice number or student name
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', "%{$request->search}%")
                  ->orWhereHas('student', function ($sq) use ($request) {
                      $sq->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        // Get all invoices with camelCase field names to match frontend
        $invoices = $query->with(['student', 'invoiceItems'])
            ->latest('issued_date')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => (string) $invoice->id,
                    'invoiceNumber' => $invoice->invoice_number,
                    'studentId' => (string) $invoice->student_id,
                    'studentName' => $invoice->student->full_name,
                    'grade' => $invoice->grade,
                    'term' => $invoice->term,
                    'totalAmount' => $invoice->total_amount / 100,
                    'paidAmount' => $invoice->paid_amount / 100,
                    'balance' => $invoice->balance / 100,
                    'status' => $invoice->status,
                    'dueDate' => $invoice->due_date->format('M d, Y'),
                    'issuedDate' => $invoice->issued_date->format('M d, Y'),
                    'items' => $invoice->invoiceItems->map(fn($item) => [
                        'name' => $item->name,
                        'amount' => $item->amount / 100,
                    ]),
                ];
            });

        // Get active students
        $students = $school->students()
            ->where('status', 'active')
            ->get(['id', 'first_name', 'last_name', 'admission_number', 'grade_id'])
            ->map(fn($s) => [
                'id' => (string) $s->id,
                'name' => $s->full_name,
                'admissionNumber' => $s->admission_number,
                'grade' => $s->grade_id ? \App\Models\Grade::find($s->grade_id)?->name ?? '' : '',
            ]);

        // Get fee structures
        $feeStructures = $school->feeStructures()
            ->where('status', 'active')
            ->with(['grade', 'term', 'feeItems'])
            ->get()
            ->map(fn($fs) => [
                'id' => (string) $fs->id,
                'name' => $fs->name,
                'gradeId' => (string) $fs->grade_id,
                'gradeName' => $fs->grade->name ?? '',
                'termName' => $fs->term->name ?? '',
                'totalAmount' => $fs->total_amount / 100,
                'items' => $fs->feeItems->map(fn($item) => [
                    'name' => $item->name,
                    'amount' => $item->amount / 100,
                ]),
            ]);

        // Get unique grades
        $grades = $school->students()
            ->where('status', 'active')
            ->whereNotNull('grade_id')
            ->pluck('grade_id')
            ->unique()
            ->map(fn($gradeId) => \App\Models\Grade::find($gradeId)?->name)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        return Inertia::render('accountant/Invoicing', [
            'invoices' => $invoices,
            'students' => $students,
            'feeStructures' => $feeStructures,
            'grades' => $grades,
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(): Response
    {
        $school = auth()->user()->school;
        
        $students = $school->students()
            ->where('status', 'active')
            ->with(['grade', 'class'])
            ->get(['id', 'first_name', 'last_name', 'admission_number', 'grade_id', 'class_id']);

        $feeStructures = $school->feeStructures()
            ->where('status', 'active')
            ->with(['grade', 'term', 'feeItems'])
            ->get();

        return Inertia::render('accountant/InvoiceCreate', [
            'students' => $students->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->full_name,
                'admission_number' => $s->admission_number,
                'grade' => $s->grade->name,
                'class' => $s->class->name,
            ]),
            'feeStructures' => $feeStructures->map(fn($fs) => [
                'id' => $fs->id,
                'name' => $fs->name,
                'grade_id' => $fs->grade_id,
                'grade_name' => $fs->grade->name,
                'term_name' => $fs->term->name,
                'total_amount' => $fs->total_amount / 100,
                'items' => $fs->feeItems->map(fn($item) => [
                    'name' => $item->name,
                    'amount' => $item->amount / 100,
                ]),
            ]),
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'grade' => 'required|string|max:100',
            'term' => 'required|string|max:100',
            'due_date' => 'required|date',
            'status' => 'required|in:draft,sent,paid,partial,overdue,void',
            'sent_via' => 'nullable|in:email,sms,both,none',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        // Verify student belongs to this school
        $student = $school->students()->findOrFail($validated['student_id']);

        // Generate invoice number
        $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($school->id, 3, '0', STR_PAD_LEFT) . '-' . uniqid();

        // Calculate total amount
        $totalAmount = collect($validated['items'])->sum(function ($item) {
            return $item['amount'] * 100; // Convert to cents
        });

        DB::transaction(function () use ($validated, $school, $student, $invoiceNumber, $totalAmount) {
            $invoice = Invoice::create([
                'school_id' => $school->id,
                'invoice_number' => $invoiceNumber,
                'student_id' => $validated['student_id'],
                'grade' => $validated['grade'],
                'term' => $validated['term'],
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'balance' => $totalAmount,
                'status' => $validated['status'],
                'due_date' => $validated['due_date'],
                'issued_date' => now(),
                'sent_via' => $validated['sent_via'] ?? 'none',
            ]);

            foreach ($validated['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'name' => $item['name'],
                    'amount' => $item['amount'] * 100, // Convert to cents
                ]);
            }
        });

        return redirect()->route('accountant.invoices.index')
            ->with('success', 'Invoice created successfully.');
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice): Response
    {
        // Ensure invoice belongs to this school
        if ($invoice->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this invoice');
        }

        $invoice->load(['student', 'invoiceItems', 'student.parents']);

        return Inertia::render('accountant/InvoiceShow', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'student' => [
                    'id' => $invoice->student->id,
                    'name' => $invoice->student->full_name,
                    'admission_number' => $invoice->student->admission_number,
                ],
                'grade' => $invoice->grade,
                'term' => $invoice->term,
                'total_amount' => $invoice->total_amount / 100,
                'paid_amount' => $invoice->paid_amount / 100,
                'balance' => $invoice->balance / 100,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date->format('M d, Y'),
                'issued_date' => $invoice->issued_date->format('M d, Y'),
                'sent_via' => $invoice->sent_via,
                'created_at' => $invoice->created_at->format('M d, Y'),
            ],
            'items' => $invoice->invoiceItems->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'amount' => $item->amount / 100,
            ]),
            'parents' => $invoice->student->parents->map(fn($parent) => [
                'id' => $parent->id,
                'name' => $parent->name,
                'email' => $parent->email,
                'phone' => $parent->phone,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(Invoice $invoice): Response
    {
        // Ensure invoice belongs to this school
        if ($invoice->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this invoice');
        }

        $school = auth()->user()->school;
        
        $students = $school->students()
            ->where('status', 'active')
            ->with(['grade', 'class'])
            ->get(['id', 'first_name', 'last_name', 'admission_number', 'grade_id', 'class_id']);

        $invoice->load('invoiceItems');

        return Inertia::render('accountant/InvoiceEdit', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'student_id' => $invoice->student_id,
                'grade' => $invoice->grade,
                'term' => $invoice->term,
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'status' => $invoice->status,
                'sent_via' => $invoice->sent_via,
            ],
            'items' => $invoice->invoiceItems->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'amount' => $item->amount / 100,
            ]),
            'students' => $students->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->full_name,
                'admission_number' => $s->admission_number,
            ]),
        ]);
    }

    /**
     * Update the specified invoice.
     */
    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        // Ensure invoice belongs to this school
        if ($invoice->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this invoice');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'grade' => 'required|string|max:100',
            'term' => 'required|string|max:100',
            'due_date' => 'required|date',
            'status' => 'required|in:draft,sent,paid,partial,overdue,void',
            'sent_via' => 'nullable|in:email,sms,both,none',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        // Calculate total amount
        $totalAmount = collect($validated['items'])->sum(function ($item) {
            return $item['amount'] * 100; // Convert to cents
        });

        DB::transaction(function () use ($validated, $invoice, $totalAmount) {
            $invoice->update([
                'student_id' => $validated['student_id'],
                'grade' => $validated['grade'],
                'term' => $validated['term'],
                'total_amount' => $totalAmount,
                'balance' => $totalAmount - $invoice->paid_amount,
                'status' => $validated['status'],
                'due_date' => $validated['due_date'],
                'sent_via' => $validated['sent_via'] ?? 'none',
            ]);

            // Delete old items and create new ones
            $invoice->invoiceItems()->delete();

            foreach ($validated['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'name' => $item['name'],
                    'amount' => $item['amount'] * 100, // Convert to cents
                ]);
            }
        });

        return redirect()->route('accountant.invoices.show', $invoice)
            ->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        // Ensure invoice belongs to this school
        if ($invoice->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this invoice');
        }

        // Cannot delete invoice with payments
        if ($invoice->paid_amount > 0) {
            return redirect()->route('accountant.invoices.index')
                ->with('error', 'Cannot delete invoice with payments made.');
        }

        $invoice->delete();

        return redirect()->route('accountant.invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    /**
     * Send invoice to parent via email/SMS.
     */
    public function send(Invoice $invoice): RedirectResponse
    {
        // Ensure invoice belongs to this school
        if ($invoice->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this invoice');
        }

        // TODO: Implement actual email/SMS sending logic
        $invoice->update([
            'status' => 'sent',
            'sent_via' => 'email',
        ]);

        return redirect()->route('accountant.invoices.show', $invoice)
            ->with('success', 'Invoice sent successfully.');
    }
}
