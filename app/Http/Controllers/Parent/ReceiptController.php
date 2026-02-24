<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class ReceiptController extends Controller
{
    /**
     * Display a listing of receipts for parent's children.
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        $receipts = Receipt::whereIn('student_id', $user->students->pluck('id'))
            ->with(['student', 'paymentTransaction'])
            ->latest('issued_at')
            ->paginate(20)
            ->through(function ($receipt) {
                return [
                    'id' => $receipt->id,
                    'receipt_number' => $receipt->receipt_number,
                    'student_name' => $receipt->student->full_name,
                    'school_name' => $receipt->school->name,
                    'amount' => $receipt->amount / 100,
                    'payment_method' => $receipt->payment_method,
                    'payment_reference' => $receipt->payment_reference,
                    'issued_at' => $receipt->issued_at->format('M d, Y H:i'),
                ];
            });

        return Inertia::render('parent/Receipts', [
            'receipts' => $receipts,
        ]);
    }

    /**
     * Display the specified receipt.
     */
    public function show(Receipt $receipt): Response
    {
        // Ensure parent has access to this receipt
        if (!auth()->user()->students()->where('students.id', $receipt->student_id)->exists()) {
            abort(403, 'Unauthorized access to this receipt');
        }

        $receipt->load(['student', 'school', 'paymentTransaction', 'receiptItems']);

        return Inertia::render('parent/ReceiptShow', [
            'receipt' => [
                'id' => $receipt->id,
                'receipt_number' => $receipt->receipt_number,
                'student' => [
                    'id' => $receipt->student->id,
                    'name' => $receipt->student->full_name,
                    'admission_number' => $receipt->student->admission_number,
                ],
                'school' => [
                    'name' => $receipt->school->name,
                    'location' => $receipt->school->location,
                ],
                'amount' => $receipt->amount / 100,
                'payment_method' => $receipt->payment_method,
                'payment_reference' => $receipt->payment_reference,
                'issued_at' => $receipt->issued_at->format('M d, Y H:i'),
            ],
            'items' => $receipt->receiptItems->map(fn($item) => [
                'name' => $item->name,
                'amount' => $item->amount / 100,
            ]),
        ]);
    }

    /**
     * Download receipt as PDF.
     */
    public function download(Receipt $receipt): JsonResponse
    {
        // Ensure parent has access to this receipt
        if (!auth()->user()->students()->where('students.id', $receipt->student_id)->exists()) {
            abort(403, 'Unauthorized access to this receipt');
        }

        // TODO: Implement PDF generation
        // For now, return receipt data as JSON
        $receipt->load(['student', 'school', 'receiptItems']);

        return response()->json([
            'message' => 'PDF generation not yet implemented',
            'receipt_number' => $receipt->receipt_number,
            'download_url' => route('parent.receipts.download', $receipt),
        ]);
    }
}
