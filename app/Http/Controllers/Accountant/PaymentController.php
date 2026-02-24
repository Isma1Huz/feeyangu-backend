<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
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

        $payments = $query->with(['student', 'parent', 'receipt'])
            ->latest()
            ->paginate(20)
            ->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'reference' => $payment->reference,
                    'student_name' => $payment->student->full_name,
                    'parent_name' => $payment->parent->name,
                    'amount' => $payment->amount / 100,
                    'provider' => $payment->provider,
                    'status' => $payment->status,
                    'provider_reference' => $payment->provider_reference,
                    'created_at' => $payment->created_at->format('M d, Y H:i'),
                    'completed_at' => $payment->completed_at?->format('M d, Y H:i'),
                    'has_receipt' => $payment->receipt !== null,
                ];
            });

        // Summary statistics
        $summary = [
            'total_amount' => $query->sum('amount') / 100,
            'completed_count' => $school->paymentTransactions()->where('status', 'completed')->count(),
            'pending_count' => $school->paymentTransactions()->whereIn('status', ['initiating', 'processing'])->count(),
            'failed_count' => $school->paymentTransactions()->where('status', 'failed')->count(),
        ];

        return Inertia::render('accountant/Payments', [
            'payments' => $payments,
            'summary' => $summary,
            'filters' => $request->only(['status', 'provider', 'search', 'from_date', 'to_date']),
        ]);
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
                'parent' => [
                    'id' => $payment->parent->id,
                    'name' => $payment->parent->name,
                    'email' => $payment->parent->email,
                    'phone' => $payment->parent->phone,
                ],
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
