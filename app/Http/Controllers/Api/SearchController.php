<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    /**
     * Search students
     */
    public function students(Request $request)
    {
        $query = $request->input('q');
        $schoolId = Auth::user()->school_id;
        
        if (!$query || strlen($query) < 2) {
            return response()->json([
                'results' => [],
                'message' => 'Query must be at least 2 characters',
            ]);
        }
        
        $students = Student::where('school_id', $schoolId)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%")
                  ->orWhere('admission_number', 'LIKE', "%{$query}%");
            })
            ->with(['grade', 'gradeClass'])
            ->limit(10)
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'admission_number' => $student->admission_number,
                    'grade' => $student->grade->name ?? null,
                    'class' => $student->gradeClass->name ?? null,
                    'status' => $student->status,
                ];
            });
        
        return response()->json([
            'results' => $students,
            'count' => $students->count(),
        ]);
    }

    /**
     * Search invoices
     */
    public function invoices(Request $request)
    {
        $query = $request->input('q');
        $schoolId = Auth::user()->school_id;
        
        if (!$query) {
            return response()->json([
                'results' => [],
                'message' => 'Query is required',
            ]);
        }
        
        $invoices = Invoice::where('school_id', $schoolId)
            ->where(function ($q) use ($query) {
                $q->where('invoice_number', 'LIKE', "%{$query}%");
            })
            ->with(['student'])
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'student_name' => $invoice->student->first_name . ' ' . $invoice->student->last_name,
                    'total_amount' => $invoice->total_amount / 100,
                    'paid_amount' => $invoice->paid_amount / 100,
                    'balance' => $invoice->balance / 100,
                    'status' => $invoice->status,
                    'due_date' => $invoice->due_date,
                ];
            });
        
        return response()->json([
            'results' => $invoices,
            'count' => $invoices->count(),
        ]);
    }

    /**
     * Search receipts
     */
    public function receipts(Request $request)
    {
        $query = $request->input('q');
        $schoolId = Auth::user()->school_id;
        
        if (!$query) {
            return response()->json([
                'results' => [],
                'message' => 'Query is required',
            ]);
        }
        
        $receipts = Receipt::where('school_id', $schoolId)
            ->where(function ($q) use ($query) {
                $q->where('receipt_number', 'LIKE', "%{$query}%")
                  ->orWhere('payment_reference', 'LIKE', "%{$query}%");
            })
            ->with(['student'])
            ->limit(10)
            ->get()
            ->map(function ($receipt) {
                return [
                    'id' => $receipt->id,
                    'receipt_number' => $receipt->receipt_number,
                    'student_name' => $receipt->student->first_name . ' ' . $receipt->student->last_name,
                    'amount' => $receipt->amount / 100,
                    'payment_method' => $receipt->payment_method,
                    'payment_reference' => $receipt->payment_reference,
                    'issued_at' => $receipt->issued_at,
                ];
            });
        
        return response()->json([
            'results' => $receipts,
            'count' => $receipts->count(),
        ]);
    }

    /**
     * Global search across all entities
     */
    public function global(Request $request)
    {
        $query = $request->input('q');
        $schoolId = Auth::user()->school_id;
        
        if (!$query || strlen($query) < 2) {
            return response()->json([
                'students' => [],
                'invoices' => [],
                'receipts' => [],
                'message' => 'Query must be at least 2 characters',
            ]);
        }
        
        $students = Student::where('school_id', $schoolId)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%")
                  ->orWhere('admission_number', 'LIKE', "%{$query}%");
            })
            ->with(['grade'])
            ->limit(5)
            ->get();
        
        $invoices = Invoice::where('school_id', $schoolId)
            ->where('invoice_number', 'LIKE', "%{$query}%")
            ->with(['student'])
            ->limit(5)
            ->get();
        
        $receipts = Receipt::where('school_id', $schoolId)
            ->where(function ($q) use ($query) {
                $q->where('receipt_number', 'LIKE', "%{$query}%")
                  ->orWhere('payment_reference', 'LIKE', "%{$query}%");
            })
            ->with(['student'])
            ->limit(5)
            ->get();
        
        return response()->json([
            'students' => $students,
            'invoices' => $invoices,
            'receipts' => $receipts,
            'total_results' => $students->count() + $invoices->count() + $receipts->count(),
        ]);
    }
}
