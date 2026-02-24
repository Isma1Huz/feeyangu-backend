<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Initiate a payment for a student.
     */
    public function initiate(Request $request, Student $student): JsonResponse
    {
        // Verify parent has access to this student
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access to this student');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'provider' => 'required|in:mpesa,equity,kcb,cooperative,ncba,absa,stanbic,dtb,family,standard_chartered',
            'phone_number' => 'nullable|string|regex:/^\+254[0-9]{9}$/',
        ]);

        // Convert amount from KES to cents
        $amountInCents = (int)($validated['amount'] * 100);

        // Generate unique reference
        $reference = strtoupper($validated['provider']) . '-' . date('Y') . '-' . uniqid();

        // Create payment transaction
        $transaction = PaymentTransaction::create([
            'school_id' => $student->school_id,
            'student_id' => $student->id,
            'parent_id' => auth()->id(),
            'amount' => $amountInCents,
            'provider' => $validated['provider'],
            'status' => 'initiating',
            'reference' => $reference,
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        // In a real implementation, here you would:
        // 1. Call the payment provider API (M-Pesa STK Push, Bank API, etc.)
        // 2. Update transaction status based on response
        // 3. Return payment instructions or redirect URL

        // For now, we'll simulate by updating status to processing
        $transaction->update(['status' => 'processing']);

        return response()->json([
            'success' => true,
            'transaction_id' => $transaction->id,
            'reference' => $transaction->reference,
            'status' => $transaction->status,
            'message' => 'Payment initiated successfully. Please complete the payment on your device.',
        ]);
    }

    /**
     * Check payment status (for polling).
     */
    public function status(Student $student, PaymentTransaction $transaction): JsonResponse
    {
        // Verify parent has access
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access');
        }

        if ($transaction->student_id !== $student->id) {
            abort(403, 'Transaction does not belong to this student');
        }

        return response()->json([
            'transaction_id' => $transaction->id,
            'reference' => $transaction->reference,
            'status' => $transaction->status,
            'amount' => $transaction->amount / 100,
            'provider' => $transaction->provider,
            'created_at' => $transaction->created_at->toISOString(),
            'completed_at' => $transaction->completed_at?->toISOString(),
        ]);
    }

    /**
     * Manual payment confirmation (fallback).
     */
    public function confirm(Request $request, Student $student): RedirectResponse
    {
        // Verify parent has access
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'transaction_id' => 'required|exists:payment_transactions,id',
            'provider_reference' => 'required|string|max:255',
        ]);

        $transaction = PaymentTransaction::findOrFail($validated['transaction_id']);

        // Verify transaction belongs to this student and parent
        if ($transaction->student_id !== $student->id || $transaction->parent_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this transaction');
        }

        // Update transaction with manual confirmation
        $transaction->update([
            'status' => 'manual_confirm',
            'provider_reference' => $validated['provider_reference'],
        ]);

        return redirect()->route('parent.children.show', $student)
            ->with('success', 'Payment confirmation submitted for verification.');
    }

    /**
     * Display payment history for all children.
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        $payments = PaymentTransaction::where('parent_id', $user->id)
            ->with(['student', 'school', 'receipt'])
            ->latest()
            ->paginate(20)
            ->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'student_name' => $payment->student->full_name,
                    'school_name' => $payment->school->name,
                    'amount' => $payment->amount / 100,
                    'provider' => $payment->provider,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                    'provider_reference' => $payment->provider_reference,
                    'created_at' => $payment->created_at->format('M d, Y H:i'),
                    'completed_at' => $payment->completed_at?->format('M d, Y H:i'),
                    'has_receipt' => $payment->receipt !== null,
                    'receipt_number' => $payment->receipt?->receipt_number,
                ];
            });

        // Summary statistics
        $summary = [
            'total_payments' => PaymentTransaction::where('parent_id', $user->id)->count(),
            'completed_payments' => PaymentTransaction::where('parent_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'total_amount_paid' => PaymentTransaction::where('parent_id', $user->id)
                ->where('status', 'completed')
                ->sum('amount') / 100,
            'pending_payments' => PaymentTransaction::where('parent_id', $user->id)
                ->whereIn('status', ['initiating', 'processing'])
                ->count(),
        ];

        return Inertia::render('parent/PaymentHistory', [
            'payments' => $payments,
            'summary' => $summary,
        ]);
    }
}
