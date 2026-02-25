<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    /**
     * Display a listing of receipts.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;
        $query = $school->receipts();

        // Search by receipt number or student name
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('receipt_number', 'like', "%{$request->search}%")
                  ->orWhereHas('student', function ($sq) use ($request) {
                      $sq->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        $receipts = $query->with(['student', 'paymentTransaction'])
            ->latest('issued_at')
            ->paginate(20)
            ->through(function ($receipt) {
                return [
                    'id' => $receipt->id,
                    'receiptNumber' => $receipt->receipt_number,
                    'studentName' => $receipt->student->full_name,
                    'amount' => $receipt->amount / 100,
                    'paymentMethod' => $receipt->payment_method,
                    'paymentReference' => $receipt->payment_reference,
                    'issuedAt' => $receipt->issued_at->format('M d, Y H:i'),
                    'transactionStatus' => $receipt->paymentTransaction->status ?? 'N/A',
                ];
            });

        return Inertia::render('school/Receipts', [
            'receipts' => $receipts,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display the specified receipt.
     */
    public function show(Receipt $receipt): Response
    {
        // Ensure receipt belongs to this school
        if ($receipt->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this receipt');
        }

        $receipt->load(['student', 'paymentTransaction', 'receiptItems']);

        return Inertia::render('school/ReceiptShow', [
            'receipt' => [
                'id' => $receipt->id,
                'receiptNumber' => $receipt->receipt_number,
                'student' => [
                    'id' => $receipt->student->id,
                    'name' => $receipt->student->full_name,
                    'admissionNumber' => $receipt->student->admission_number,
                ],
                'amount' => $receipt->amount / 100,
                'paymentMethod' => $receipt->payment_method,
                'paymentReference' => $receipt->payment_reference,
                'issuedAt' => $receipt->issued_at->format('M d, Y H:i'),
                'transaction' => $receipt->paymentTransaction ? [
                    'id' => $receipt->paymentTransaction->id,
                    'status' => $receipt->paymentTransaction->status,
                    'provider' => $receipt->paymentTransaction->provider,
                ] : null,
            ],
            'items' => $receipt->receiptItems->map(fn($item) => [
                'name' => $item->name,
                'amount' => $item->amount / 100,
            ]),
        ]);
    }
}
