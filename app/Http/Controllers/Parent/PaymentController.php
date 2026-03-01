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
            'provider' => 'required|in:mpesa,equity,kcb,cooperative,ncba,absa,stanbic,dtb,family,standard_chartered,coop,im_bank,family_bank',
            'phone_number' => 'nullable|string',
        ]);

        // Convert amount from KES to cents
        $amountInCents = (int)($validated['amount'] * 100);

        // Generate unique reference code including student reg number and school ID
        $providerCode = strtoupper(substr($validated['provider'], 0, 3));
        $schoolCode = str_pad(substr($student->school_id, -4), 4, '0', STR_PAD_LEFT);
        $studentReg = preg_replace('/[^A-Z0-9]/', '', strtoupper($student->admission_number));
        $timestamp = date('ymd');
        $uniqueId = strtoupper(substr(uniqid(), -4));
        
        // Format: PROVIDER-SCHOOLID-STUDENTREG-YYMMDD-UNIQ
        // Example: MPE-0001-STD123-240301-A1B2
        $reference = "{$providerCode}-{$schoolCode}-{$studentReg}-{$timestamp}-{$uniqueId}";

        // Create payment transaction
        $transaction = PaymentTransaction::create([
            'school_id' => $student->school_id,
            'student_id' => $student->id,
            'parent_id' => auth()->id(),
            'amount' => $amountInCents,
            'provider' => $validated['provider'],
            'status' => 'pending',
            'reference' => $reference,
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        // Determine if this is mobile money or bank transfer
        $isMobileMoney = in_array($validated['provider'], ['mpesa']);
        
        if ($isMobileMoney) {
            // For M-Pesa, simulate STK push
            $transaction->update(['status' => 'processing']);
            $message = 'Payment initiated. Please check your phone for M-Pesa prompt.';
        } else {
            // For bank transfers, keep as pending with instructions
            $transaction->update(['status' => 'pending']);
            $message = 'Please complete the bank transfer using the provided instructions.';
        }

        return response()->json([
            'success' => true,
            'transaction_id' => $transaction->id,
            'reference' => $reference,
            'status' => $transaction->status,
            'is_mobile_money' => $isMobileMoney,
            'message' => $message,
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

        // Simulate payment processing for demo purposes
        // In production, this would poll the actual payment provider API
        if ($transaction->status === 'processing') {
            // Simulate random success/failure after some time
            $elapsed = now()->diffInSeconds($transaction->created_at);
            
            // For M-Pesa: simulate STK push result after 5-15 seconds
            if (in_array($transaction->provider, ['mpesa']) && $elapsed >= 8) {
                // 85% success rate
                if (rand(1, 100) <= 85) {
                    $transaction->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'provider_reference' => 'SIM' . strtoupper(uniqid()),
                    ]);
                } else {
                    // Needs manual confirmation
                    $transaction->update(['status' => 'pending_confirmation']);
                }
            }
        } elseif ($transaction->status === 'pending') {
            // For bank transfers: Check if enough time has passed for simulation
            $elapsed = now()->diffInSeconds($transaction->created_at);
            
            // Simulate bank transfer verification after 20 seconds
            if ($elapsed >= 20) {
                // 80% success rate for automatic verification
                if (rand(1, 100) <= 80) {
                    $transaction->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'provider_reference' => 'BNK' . strtoupper(uniqid()),
                    ]);
                } else {
                    // Needs manual confirmation
                    $transaction->update(['status' => 'pending_confirmation']);
                }
            }
        }

        return response()->json([
            'transaction_id' => $transaction->id,
            'reference' => $transaction->reference,
            'status' => $transaction->status,
            'amount' => $transaction->amount / 100,
            'provider' => $transaction->provider,
            'provider_reference' => $transaction->provider_reference,
            'created_at' => $transaction->created_at->toISOString(),
            'completed_at' => $transaction->completed_at?->toISOString(),
        ]);
    }

    /**
     * Manual payment confirmation (fallback).
     */
    public function confirm(Request $request, Student $student): JsonResponse
    {
        // Verify parent has access
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'transaction_id' => 'required|exists:payment_transactions,id',
        ]);

        $transaction = PaymentTransaction::findOrFail($validated['transaction_id']);

        // Verify transaction belongs to this student and parent
        if ($transaction->student_id !== $student->id || $transaction->parent_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this transaction');
        }

        // Simulate verification process with timeout
        sleep(2); // Simulate processing time
        
        // 90% success rate for manual confirmation
        $success = rand(1, 100) <= 90;
        
        if ($success) {
            $transaction->update([
                'status' => 'completed',
                'completed_at' => now(),
                'provider_reference' => 'MAN' . strtoupper(uniqid()),
            ]);
            
            return response()->json([
                'success' => true,
                'transaction_id' => $transaction->id,
                'reference' => $transaction->reference,
                'status' => 'completed',
                'message' => 'Payment confirmed successfully.',
            ]);
        } else {
            $transaction->update(['status' => 'pending_confirmation']);
            
            return response()->json([
                'success' => false,
                'transaction_id' => $transaction->id,
                'status' => 'pending_confirmation',
                'message' => 'Payment verification in progress. Please check back later.',
            ], 202);
        }
    }

    /**
     * Display payment history for all children.
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        $payments = PaymentTransaction::where('parent_id', $user->id)
            ->with(['student'])
            ->latest()
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => (string) $payment->id,
                    'date' => $payment->created_at->format('M d, Y'),
                    'studentId' => (string) $payment->student_id,
                    'studentName' => $payment->student->full_name,
                    'amount' => $payment->amount / 100,
                    'method' => $payment->provider,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                ];
            });

        // Children for filter dropdown
        $children = $user->students()
            ->get()
            ->map(fn($s) => [
                'studentId' => (string) $s->id,
                'name' => $s->full_name,
            ]);

        return Inertia::render('parent/PaymentHistory', [
            'payments' => $payments,
            'children' => $children,
        ]);
    }
}
