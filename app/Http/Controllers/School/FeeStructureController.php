<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Models\FeeItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class FeeStructureController extends Controller
{
    /**
     * Display a listing of fee structures.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $feeStructures = $school->feeStructures()
            ->with(['grade', 'term'])
            ->latest()
            ->paginate(20)
            ->through(function ($feeStructure) {
                return [
                    'id' => $feeStructure->id,
                    'name' => $feeStructure->name,
                    'grade' => [
                        'id' => $feeStructure->grade->id,
                        'name' => $feeStructure->grade->name,
                    ],
                    'term' => [
                        'id' => $feeStructure->term->id,
                        'name' => $feeStructure->term->name,
                        'year' => $feeStructure->term->year,
                    ],
                    'total_amount' => $feeStructure->total_amount / 100,
                    'status' => $feeStructure->status,
                    'created_at' => $feeStructure->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('school/FeeStructures', [
            'feeStructures' => $feeStructures,
        ]);
    }

    /**
     * Show the form for creating a new fee structure.
     */
    public function create(): Response
    {
        $school = auth()->user()->school;
        
        $grades = $school->grades()->orderBy('sort_order')->get(['id', 'name']);
        $terms = $school->academicTerms()
            ->whereIn('status', ['active', 'upcoming'])
            ->orderBy('year', 'desc')
            ->get(['id', 'name', 'year']);

        return Inertia::render('school/FeeStructureCreate', [
            'grades' => $grades,
            'terms' => $terms,
        ]);
    }

    /**
     * Store a newly created fee structure.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'term_id' => 'required|exists:academic_terms,id',
            'status' => 'required|in:active,inactive',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        // Verify grade and term belong to this school
        $grade = $school->grades()->findOrFail($validated['grade_id']);
        $term = $school->academicTerms()->findOrFail($validated['term_id']);

        // Calculate total amount
        $totalAmount = collect($validated['items'])->sum(function ($item) {
            return $item['amount'] * 100; // Convert to cents
        });

        DB::transaction(function () use ($validated, $school, $totalAmount) {
            $feeStructure = FeeStructure::create([
                'school_id' => $school->id,
                'name' => $validated['name'],
                'grade_id' => $validated['grade_id'],
                'term_id' => $validated['term_id'],
                'total_amount' => $totalAmount,
                'status' => $validated['status'],
            ]);

            foreach ($validated['items'] as $item) {
                FeeItem::create([
                    'fee_structure_id' => $feeStructure->id,
                    'name' => $item['name'],
                    'amount' => $item['amount'] * 100, // Convert to cents
                ]);
            }
        });

        return redirect()->route('school.fee-structures.index')
            ->with('success', 'Fee structure created successfully.');
    }

    /**
     * Display the specified fee structure.
     */
    public function show(FeeStructure $feeStructure): Response
    {
        // Ensure fee structure belongs to this school
        if ($feeStructure->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this fee structure');
        }

        $feeStructure->load(['grade', 'term', 'feeItems']);

        return Inertia::render('school/FeeStructureShow', [
            'feeStructure' => [
                'id' => $feeStructure->id,
                'name' => $feeStructure->name,
                'grade' => [
                    'id' => $feeStructure->grade->id,
                    'name' => $feeStructure->grade->name,
                ],
                'term' => [
                    'id' => $feeStructure->term->id,
                    'name' => $feeStructure->term->name,
                    'year' => $feeStructure->term->year,
                ],
                'total_amount' => $feeStructure->total_amount / 100,
                'status' => $feeStructure->status,
                'created_at' => $feeStructure->created_at->format('M d, Y'),
            ],
            'items' => $feeStructure->feeItems->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'amount' => $item->amount / 100,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified fee structure.
     */
    public function edit(FeeStructure $feeStructure): Response
    {
        // Ensure fee structure belongs to this school
        if ($feeStructure->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this fee structure');
        }

        $school = auth()->user()->school;
        
        $grades = $school->grades()->orderBy('sort_order')->get(['id', 'name']);
        $terms = $school->academicTerms()
            ->whereIn('status', ['active', 'upcoming'])
            ->orderBy('year', 'desc')
            ->get(['id', 'name', 'year']);

        $feeStructure->load('feeItems');

        return Inertia::render('school/FeeStructureEdit', [
            'feeStructure' => [
                'id' => $feeStructure->id,
                'name' => $feeStructure->name,
                'grade_id' => $feeStructure->grade_id,
                'term_id' => $feeStructure->term_id,
                'status' => $feeStructure->status,
            ],
            'items' => $feeStructure->feeItems->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'amount' => $item->amount / 100,
            ]),
            'grades' => $grades,
            'terms' => $terms,
        ]);
    }

    /**
     * Update the specified fee structure.
     */
    public function update(Request $request, FeeStructure $feeStructure): RedirectResponse
    {
        // Ensure fee structure belongs to this school
        if ($feeStructure->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this fee structure');
        }

        $school = auth()->user()->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'term_id' => 'required|exists:academic_terms,id',
            'status' => 'required|in:active,inactive',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:fee_items,id',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        // Verify grade and term belong to this school
        $grade = $school->grades()->findOrFail($validated['grade_id']);
        $term = $school->academicTerms()->findOrFail($validated['term_id']);

        // Calculate total amount
        $totalAmount = collect($validated['items'])->sum(function ($item) {
            return $item['amount'] * 100; // Convert to cents
        });

        DB::transaction(function () use ($validated, $feeStructure, $totalAmount) {
            $feeStructure->update([
                'name' => $validated['name'],
                'grade_id' => $validated['grade_id'],
                'term_id' => $validated['term_id'],
                'total_amount' => $totalAmount,
                'status' => $validated['status'],
            ]);

            // Delete old items and create new ones
            $feeStructure->feeItems()->delete();

            foreach ($validated['items'] as $item) {
                FeeItem::create([
                    'fee_structure_id' => $feeStructure->id,
                    'name' => $item['name'],
                    'amount' => $item['amount'] * 100, // Convert to cents
                ]);
            }
        });

        return redirect()->route('school.fee-structures.show', $feeStructure)
            ->with('success', 'Fee structure updated successfully.');
    }

    /**
     * Remove the specified fee structure.
     */
    public function destroy(FeeStructure $feeStructure): RedirectResponse
    {
        // Ensure fee structure belongs to this school
        if ($feeStructure->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this fee structure');
        }

        $feeStructure->delete();

        return redirect()->route('school.fee-structures.index')
            ->with('success', 'Fee structure deleted successfully.');
    }
}
