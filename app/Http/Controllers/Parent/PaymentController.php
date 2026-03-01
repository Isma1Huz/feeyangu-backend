<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentProviderFactory;
use App\Services\Payment\PaymentReferenceGenerator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentProviderFactory $factory,
        private PaymentReferenceGenerator $referenceGenerator
    ) {}

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
            'provider' => 'required|in:mpesa,equity,kcb,ncba,absa,stanbic,dtb,coop,im_bank,family_bank',
            'phone_number' => 'nullable|string',
        ]);

        // Convert amount from KES to cents
        $amountInCents = (int) ($validated['amount'] * 100);

        // Generate unique reference: {ADMISSION}-{SCHOOL_ID}-{CODE}
        $reference = $this->generateUniqueReference($student);

        // Create payment transaction
        $transaction = PaymentTransaction::create([
            'school_id'    => $student->school_id,
            'student_id'   => $student->id,
            'parent_id'    => auth()->id(),
            'amount'       => $amountInCents,
            'provider'     => $validated['provider'],
            'status'       => 'pending',
            'reference'    => $reference,
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        $isMobileMoney = $validated['provider'] === 'mpesa';

        if ($isMobileMoney) {
            // Trigger real STK Push via provider
            $provider = $this->factory->make('mpesa');
            $result   = $provider->initiatePayment($transaction);

            if ($result->success) {
                return response()->json([
                    'success'        => true,
                    'transaction_id' => $transaction->id,
                    'reference'      => $reference,
                    'status'         => $transaction->fresh()->status,
                    'is_mobile_money' => true,
                    'message'        => $result->message,
                ]);
            }

            // STK push failed – keep transaction as pending for manual fallback
            return response()->json([
                'success'        => false,
                'transaction_id' => $transaction->id,
                'reference'      => $reference,
                'status'         => 'pending',
                'is_mobile_money' => true,
                'message'        => $result->errorMessage ?? 'Failed to initiate M-Pesa payment. Please try again or pay via PayBill.',
            ], 422);
        }

        // For bank transfers, keep as pending with PayBill/transfer instructions
        return response()->json([
            'success'        => true,
            'transaction_id' => $transaction->id,
            'reference'      => $reference,
            'status'         => 'pending',
            'is_mobile_money' => false,
            'message'        => 'Please complete the bank transfer using the provided reference number.',
        ]);
    }

    /**
     * Generate a unique reference, retrying on collision (rare).
     */
    private function generateUniqueReference(Student $student): string
    {
        $maxAttempts = 5;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $reference = $this->referenceGenerator->generate(
                $student->admission_number,
                $student->school_id
            );

            if (!PaymentTransaction::where('reference', $reference)->exists()) {
                return $reference;
            }
        }

        // Extremely unlikely to reach here; use a longer code as fallback
        $extendedLength = 10;
        return $this->referenceGenerator->generate($student->admission_number, $student->school_id, $extendedLength);
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
            'transaction_id'     => $transaction->id,
            'reference'          => $transaction->reference,
            'status'             => $transaction->status,
            'amount'             => $transaction->amount / 100,
            'provider'           => $transaction->provider,
            'provider_reference' => $transaction->provider_reference,
            'created_at'         => $transaction->created_at->toISOString(),
            'completed_at'       => $transaction->completed_at?->toISOString(),
        ]);
    }

    /**
     * Manual payment confirmation (fallback for unmatched payments).
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

        if ($transaction->status === 'completed') {
            return response()->json([
                'success'        => true,
                'transaction_id' => $transaction->id,
                'reference'      => $transaction->reference,
                'status'         => 'completed',
                'message'        => 'Payment is already confirmed.',
            ]);
        }

        // Mark as pending_confirmation for staff to verify manually
        $transaction->update(['status' => 'pending_confirmation']);

        return response()->json([
            'success'        => true,
            'transaction_id' => $transaction->id,
            'status'         => 'pending_confirmation',
            'message'        => 'Your payment is being verified. You will be notified once confirmed.',
        ]);
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
                    'id'          => (string) $payment->id,
                    'date'        => $payment->created_at->format('M d, Y'),
                    'studentId'   => (string) $payment->student_id,
                    'studentName' => $payment->student->full_name,
                    'amount'      => $payment->amount / 100,
                    'method'      => $payment->provider,
                    'status'      => $payment->status,
                    'reference'   => $payment->reference,
                ];
            });

        // Children for filter dropdown
        $children = $user->students()
            ->get()
            ->map(fn ($s) => [
                'studentId' => (string) $s->id,
                'name'      => $s->full_name,
            ]);

        return Inertia::render('parent/PaymentHistory', [
            'payments' => $payments,
            'children' => $children,
        ]);
    }
}

