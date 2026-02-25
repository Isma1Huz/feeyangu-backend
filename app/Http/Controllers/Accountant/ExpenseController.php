<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Models\ExpenseRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expense records.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;
        
        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $expenses = $school->expenseRecords()
            ->with('submitter')
            ->latest('date')
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => (string) $expense->id,
                    'date' => $expense->date->format('Y-m-d'),
                    'category' => $expense->category,
                    'description' => $expense->description,
                    'amount' => $expense->amount / 100,
                    'vendor' => $expense->vendor,
                    'receiptUrl' => $expense->receipt_url,
                    'status' => $expense->status,
                    'submittedBy' => $expense->submitter->name ?? 'Unknown',
                ];
            });

        $categories = [
            'Utilities',
            'Supplies',
            'Maintenance',
            'Salaries',
            'Transport',
            'Food & Catering',
            'Technology',
            'Furniture',
            'Other'
        ];

        return Inertia::render('accountant/Expenses', [
            'expenses' => $expenses,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created expense.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'amount' => 'required|numeric|min:0',
            'vendor' => 'required|string|max:255',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        ExpenseRecord::create([
            'school_id' => $school->id,
            'date' => $validated['date'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'amount' => $validated['amount'] * 100, // Convert to cents
            'vendor' => $validated['vendor'],
            'receipt_url' => null,
            'status' => $validated['status'] ?? 'pending',
            'submitted_by' => auth()->id(),
        ]);

        return redirect()->route('accountant.expenses.index')
            ->with('success', 'Expense created successfully.');
    }

    /**
     * Update the specified expense.
     */
    public function update(Request $request, ExpenseRecord $expense): RedirectResponse
    {
        // Ensure expense belongs to this school
        if ($expense->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this expense');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'amount' => 'required|numeric|min:0',
            'vendor' => 'required|string|max:255',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $expense->update([
            'date' => $validated['date'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'amount' => $validated['amount'] * 100, // Convert to cents
            'vendor' => $validated['vendor'],
            'status' => $validated['status'] ?? $expense->status,
        ]);

        return redirect()->route('accountant.expenses.index')
            ->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified expense.
     */
    public function destroy(ExpenseRecord $expense): RedirectResponse
    {
        // Ensure expense belongs to this school
        if ($expense->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this expense');
        }

        $expense->delete();

        return redirect()->route('accountant.expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }

    /**
     * Approve the specified expense.
     */
    public function approve(ExpenseRecord $expense): RedirectResponse
    {
        // Ensure expense belongs to this school
        if ($expense->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this expense');
        }

        $expense->update(['status' => 'approved']);

        return redirect()->route('accountant.expenses.index')
            ->with('success', 'Expense approved successfully.');
    }

    /**
     * Reject the specified expense.
     */
    public function reject(ExpenseRecord $expense): RedirectResponse
    {
        // Ensure expense belongs to this school
        if ($expense->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this expense');
        }

        $expense->update(['status' => 'rejected']);

        return redirect()->route('accountant.expenses.index')
            ->with('success', 'Expense rejected successfully.');
    }
}
