<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Student;
use App\Models\FeeStructure;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BulkOperationController extends Controller
{
    /**
     * Generate invoices for multiple students in bulk
     */
    public function generateInvoices(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:students,id',
            'fee_structure_id' => 'required|exists:fee_structures,id',
            'due_date' => 'required|date|after:today',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $schoolId = Auth::user()->school_id;
        $studentIds = $request->student_ids;
        $feeStructureId = $request->fee_structure_id;
        $dueDate = $request->due_date;
        
        // Verify all students belong to the school
        $students = Student::where('school_id', $schoolId)
            ->whereIn('id', $studentIds)
            ->get();
        
        if ($students->count() !== count($studentIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Some students do not belong to your school',
            ], 403);
        }
        
        // Get fee structure
        $feeStructure = FeeStructure::where('school_id', $schoolId)
            ->with('items')
            ->findOrFail($feeStructureId);
        
        $invoices = [];
        $errors = [];
        
        DB::beginTransaction();
        try {
            foreach ($students as $student) {
                // Check if invoice already exists for this student and fee structure
                $existing = Invoice::where('school_id', $schoolId)
                    ->where('student_id', $student->id)
                    ->where('term', $feeStructure->academicTerm->name ?? 'Term')
                    ->where('grade', $student->grade->name ?? '')
                    ->whereIn('status', ['draft', 'sent', 'partial'])
                    ->first();
                
                if ($existing) {
                    $errors[] = "Invoice already exists for {$student->first_name} {$student->last_name}";
                    continue;
                }
                
                // Generate invoice number
                $year = now()->year;
                $lastInvoice = Invoice::where('school_id', $schoolId)
                    ->where('invoice_number', 'LIKE', "INV-{$year}-%")
                    ->orderBy('id', 'desc')
                    ->first();
                
                $sequence = 1;
                if ($lastInvoice) {
                    $parts = explode('-', $lastInvoice->invoice_number);
                    $sequence = intval(end($parts)) + 1;
                }
                
                $invoiceNumber = sprintf("INV-%d-%04d-%05d", $year, $schoolId, $sequence);
                
                // Create invoice
                $invoice = Invoice::create([
                    'school_id' => $schoolId,
                    'invoice_number' => $invoiceNumber,
                    'student_id' => $student->id,
                    'grade' => $student->grade->name ?? '',
                    'term' => $feeStructure->academicTerm->name ?? 'Term',
                    'total_amount' => $feeStructure->total_amount,
                    'paid_amount' => 0,
                    'balance' => $feeStructure->total_amount,
                    'status' => 'draft',
                    'due_date' => $dueDate,
                    'issued_date' => now(),
                    'sent_via' => 'none',
                ]);
                
                // Create invoice items
                foreach ($feeStructure->items as $feeItem) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'name' => $feeItem->name,
                        'amount' => $feeItem->amount,
                    ]);
                }
                
                $invoices[] = $invoice;
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => count($invoices) . ' invoices generated successfully',
                'invoices_created' => count($invoices),
                'errors' => $errors,
                'invoices' => $invoices,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error generating invoices: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark multiple invoices as sent
     */
    public function sendInvoices(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invoice_ids' => 'required|array|min:1',
            'invoice_ids.*' => 'required|exists:invoices,id',
            'send_via' => 'required|in:email,sms,both',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $schoolId = Auth::user()->school_id;
        $invoiceIds = $request->invoice_ids;
        $sendVia = $request->send_via;
        
        $updated = Invoice::where('school_id', $schoolId)
            ->whereIn('id', $invoiceIds)
            ->whereIn('status', ['draft', 'sent'])
            ->update([
                'status' => 'sent',
                'sent_via' => $sendVia,
            ]);
        
        return response()->json([
            'success' => true,
            'message' => "{$updated} invoices marked as sent",
            'invoices_updated' => $updated,
        ]);
    }

    /**
     * Import students from CSV (placeholder)
     */
    public function importStudents(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // This is a placeholder - full implementation would parse CSV and create students
        return response()->json([
            'success' => true,
            'message' => 'Student import feature is ready for implementation',
            'note' => 'Parse CSV file and create Student records with proper validation',
        ]);
    }

    /**
     * Batch update student status
     */
    public function updateStudentStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:students,id',
            'status' => 'required|in:active,inactive',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $schoolId = Auth::user()->school_id;
        $studentIds = $request->student_ids;
        $status = $request->status;
        
        $updated = Student::where('school_id', $schoolId)
            ->whereIn('id', $studentIds)
            ->update(['status' => $status]);
        
        return response()->json([
            'success' => true,
            'message' => "{$updated} students updated to {$status} status",
            'students_updated' => $updated,
        ]);
    }
}
