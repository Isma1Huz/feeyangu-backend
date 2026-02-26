<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AcademicTermController extends Controller
{
    /**
     * Display a listing of academic terms.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $terms = $school->academicTerms()
            ->orderBy('year', 'desc')
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($term) {
                return [
                    'id' => (string) $term->id,
                    'name' => $term->name,
                    'year' => $term->year,
                    'startDate' => $term->start_date->format('Y-m-d'),
                    'endDate' => $term->end_date->format('Y-m-d'),
                    'status' => $term->status,
                ];
            });

        return Inertia::render('school/Terms', [
            'terms' => $terms,
        ]);
    }

    /**
     * Show the form for creating a new term.
     */
    public function create(): Response
    {
        return Inertia::render('school/AcademicTermCreate');
    }

    /**
     * Store a newly created term.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'year' => 'required|integer|min:2020|max:2100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,upcoming,completed',
        ]);

        $validated['school_id'] = $school->id;

        $term = AcademicTerm::create($validated);

        return redirect()->route('school.terms.index')
            ->with('success', 'Academic term created successfully.');
    }

    /**
     * Display the specified term.
     */
    public function show(AcademicTerm $term): Response
    {
        // Ensure term belongs to this school
        if ($term->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this term');
        }

        $term->load('feeStructures');

        return Inertia::render('school/AcademicTermShow', [
            'term' => [
                'id' => $term->id,
                'name' => $term->name,
                'year' => $term->year,
                'start_date' => $term->start_date->format('M d, Y'),
                'end_date' => $term->end_date->format('M d, Y'),
                'status' => $term->status,
                'fee_structures_count' => $term->feeStructures->count(),
            ],
            'feeStructures' => $term->feeStructures->map(fn($fs) => [
                'id' => $fs->id,
                'name' => $fs->name,
                'grade_name' => $fs->grade->name,
                'total_amount' => $fs->total_amount / 100,
                'status' => $fs->status,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified term.
     */
    public function edit(AcademicTerm $term): Response
    {
        // Ensure term belongs to this school
        if ($term->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this term');
        }

        return Inertia::render('school/AcademicTermEdit', [
            'term' => [
                'id' => $term->id,
                'name' => $term->name,
                'year' => $term->year,
                'start_date' => $term->start_date->format('Y-m-d'),
                'end_date' => $term->end_date->format('Y-m-d'),
                'status' => $term->status,
            ],
        ]);
    }

    /**
     * Update the specified term.
     */
    public function update(Request $request, AcademicTerm $term): RedirectResponse
    {
        // Ensure term belongs to this school
        if ($term->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this term');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'year' => 'required|integer|min:2020|max:2100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,upcoming,completed',
        ]);

        $term->update($validated);

        return redirect()->route('school.terms.show', $term)
            ->with('success', 'Academic term updated successfully.');
    }

    /**
     * Remove the specified term.
     */
    public function destroy(AcademicTerm $term): RedirectResponse
    {
        // Ensure term belongs to this school
        if ($term->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this term');
        }

        // Check if term has fee structures
        if ($term->feeStructures()->count() > 0) {
            return redirect()->route('school.terms.index')
                ->with('error', 'Cannot delete term with associated fee structures.');
        }

        $term->delete();

        return redirect()->route('school.terms.index')
            ->with('success', 'Academic term deleted successfully.');
    }
}
