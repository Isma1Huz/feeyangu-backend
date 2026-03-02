<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\Student;
use App\Services\Payment\InvoiceAllocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Display a listing of payment transactions.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;
        $query = $school->paymentTransactions();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by provider
        if ($request->has('provider') && $request->provider !== 'all') {
            $query->where('provider', $request->provider);
        }

        // Date range filter
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('reference', 'like', "%{$request->search}%")
                  ->orWhere('provider_reference', 'like', "%{$request->search}%")
                  ->orWhereHas('student', function ($sq) use ($request) {
                      $sq->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        // Get all payments with camelCase field names
        $payments = $query->with(['student', 'parent', 'receipt'])
            ->latest()
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => (string) $payment->id,
                    'reference' => $payment->reference,
                    'studentId' => (string) $payment->student_id,
                    'studentName' => $payment->student->full_name,
                    'parentName' => $payment->parent?->name ?? 'N/A',
                    'amount' => $payment->amount / 100,
                    'method' => $payment->provider, // Frontend expects 'method' field
                    'provider' => $payment->provider,
                    'status' => $payment->status,
                    'providerReference' => $payment->provider_reference,
                    'date' => $payment->created_at->format('M d, Y'),
                    'completedAt' => $payment->completed_at?->format('M d, Y H:i'),
                    'hasReceipt' => $payment->receipt !== null,
                    'notes' => $payment->notes ?? '',
                ];
            });

        // Get active students
        $students = $school->students()
            ->where('status', 'active')
            ->get(['id', 'first_name', 'last_name', 'admission_number'])
            ->map(fn($s) => [
                'id' => (string) $s->id,
                'firstName' => $s->first_name,
                'lastName' => $s->last_name,
                'admissionNumber' => $s->admission_number,
            ]);

        return Inertia::render('accountant/Payments', [
            'payments' => $payments,
            'students' => $students,
        ]);
    }

    /**
     * Record a manual payment (cash, bank-slip, etc.).
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:1',
            'method' => 'required|in:mpesa,bank,cash,card',
            'reference' => 'required|string|max:255',
            'date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Verify student belongs to this school
        $student = $school->students()->findOrFail($validated['student_id']);

        // Derive a parent_id: take first linked parent, or null
        $parent = $student->parents()->first();

        $amountCents = (int) round($validated['amount'] * 100);

        DB::transaction(function () use ($validated, $school, $student, $parent, $amountCents) {
            $transaction = PaymentTransaction::create([
                'school_id' => $school->id,
                'student_id' => $student->id,
                'parent_id' => $parent?->id,
                'amount' => $amountCents,
                'provider' => $validated['method'],
                'status' => 'completed',
                'reference' => $validated['reference'],
                'provider_reference' => $validated['reference'],
                'phone_number' => null,
                'notes' => $validated['notes'] ?? null,
                'completed_at' => $validated['date'],
            ]);

            // Generate receipt
            $receiptNumber = 'RCT-' . date('Y') . '-' . str_pad($school->id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
            Receipt::create([
                'school_id' => $school->id,
                'payment_transaction_id' => $transaction->id,
                'receipt_number' => $receiptNumber,
                'student_id' => $student->id,
                'amount' => $amountCents,
                'payment_method' => $validated['method'],
                'payment_reference' => $validated['reference'],
                'issued_at' => now(),
            ]);

            // Allocate payment to open invoices
            app(InvoiceAllocationService::class)->allocate($transaction);
        });

        return redirect()->route('accountant.payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    /**
     * Approve a pending payment.
     */
    public function approve(PaymentTransaction $payment): RedirectResponse
    {
        if ($payment->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized');
        }

        DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Generate receipt if one doesn't already exist
            if (!$payment->receipt()->exists()) {
                $receiptNumber = 'RCT-' . date('Y') . '-' . str_pad($payment->school_id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT);
                Receipt::create([
                    'school_id' => $payment->school_id,
                    'payment_transaction_id' => $payment->id,
                    'receipt_number' => $receiptNumber,
                    'student_id' => $payment->student_id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->provider,
                    'payment_reference' => $payment->provider_reference ?? $payment->reference,
                    'issued_at' => now(),
                ]);
            }

            // Allocate payment to open invoices
            app(InvoiceAllocationService::class)->allocate($payment->fresh());
        });

        return redirect()->route('accountant.payments.index')
            ->with('success', 'Payment approved.');
    }

    /**
     * Reject a pending payment.
     */
    public function reject(PaymentTransaction $payment): RedirectResponse
    {
        if ($payment->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized');
        }

        $payment->update(['status' => 'failed']);

        return redirect()->route('accountant.payments.index')
            ->with('success', 'Payment rejected.');
    }

    /**
     * Display the specified payment transaction.
     */
    public function show(PaymentTransaction $payment): Response
    {
        // Ensure payment belongs to this school
        if ($payment->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this payment');
        }

        $payment->load(['student', 'parent', 'receipt.receiptItems']);

        return Inertia::render('accountant/PaymentShow', [
            'payment' => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'student' => [
                    'id' => $payment->student->id,
                    'name' => $payment->student->full_name,
                    'admission_number' => $payment->student->admission_number,
                ],
                'parent' => $payment->parent ? [
                    'id' => $payment->parent->id,
                    'name' => $payment->parent->name,
                    'email' => $payment->parent->email,
                    'phone' => $payment->parent->phone,
                ] : null,
                'amount' => $payment->amount / 100,
                'provider' => $payment->provider,
                'status' => $payment->status,
                'phone_number' => $payment->phone_number,
                'provider_reference' => $payment->provider_reference,
                'created_at' => $payment->created_at->format('M d, Y H:i'),
                'completed_at' => $payment->completed_at?->format('M d, Y H:i'),
            ],
            'receipt' => $payment->receipt ? [
                'id' => $payment->receipt->id,
                'receipt_number' => $payment->receipt->receipt_number,
                'issued_at' => $payment->receipt->issued_at->format('M d, Y H:i'),
                'items' => $payment->receipt->receiptItems->map(fn($item) => [
                    'name' => $item->name,
                    'amount' => $item->amount / 100,
                ]),
            ] : null,
        ]);
    }
}
