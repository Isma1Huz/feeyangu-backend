<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class GradeController extends Controller
{
    /**
     * Display a listing of grades.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $grades = $school->grades()
            ->withCount(['students', 'classes'])
            ->orderBy('sort_order')
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'name' => $grade->name,
                    'sort_order' => $grade->sort_order,
                    'students_count' => $grade->students_count,
                    'classes_count' => $grade->classes_count,
                    'created_at' => $grade->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('school/Grades', [
            'grades' => $grades,
        ]);
    }

    /**
     * Show the form for creating a new grade.
     */
    public function create(): Response
    {
        return Inertia::render('school/GradeCreate');
    }

    /**
     * Store a newly created grade.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'sort_order' => 'required|integer|min:1',
        ]);

        $validated['school_id'] = $school->id;

        $grade = Grade::create($validated);

        return redirect()->route('school.grades.index')
            ->with('success', 'Grade created successfully.');
    }

    /**
     * Display the specified grade.
     */
    public function show(Grade $grade): Response
    {
        // Ensure grade belongs to this school
        if ($grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this grade');
        }

        $grade->load(['classes.students', 'students']);

        return Inertia::render('school/GradeShow', [
            'grade' => [
                'id' => $grade->id,
                'name' => $grade->name,
                'sort_order' => $grade->sort_order,
                'students_count' => $grade->students->count(),
                'classes_count' => $grade->classes->count(),
            ],
            'classes' => $grade->classes->map(fn($class) => [
                'id' => $class->id,
                'name' => $class->name,
                'teacher_name' => $class->teacher_name,
                'capacity' => $class->capacity,
                'students_count' => $class->students->count(),
            ]),
            'recentStudents' => $grade->students()->latest()->take(10)->get()->map(fn($student) => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'status' => $student->status,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(Grade $grade): Response
    {
        // Ensure grade belongs to this school
        if ($grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this grade');
        }

        return Inertia::render('school/GradeEdit', [
            'grade' => [
                'id' => $grade->id,
                'name' => $grade->name,
                'sort_order' => $grade->sort_order,
            ],
        ]);
    }

    /**
     * Update the specified grade.
     */
    public function update(Request $request, Grade $grade): RedirectResponse
    {
        // Ensure grade belongs to this school
        if ($grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this grade');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'sort_order' => 'required|integer|min:1',
        ]);

        $grade->update($validated);

        return redirect()->route('school.grades.show', $grade)
            ->with('success', 'Grade updated successfully.');
    }

    /**
     * Remove the specified grade.
     */
    public function destroy(Grade $grade): RedirectResponse
    {
        // Ensure grade belongs to this school
        if ($grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this grade');
        }

        // Check if grade has students
        if ($grade->students()->count() > 0) {
            return redirect()->route('school.grades.index')
                ->with('error', 'Cannot delete grade with enrolled students.');
        }

        $grade->delete();

        return redirect()->route('school.grades.index')
            ->with('success', 'Grade deleted successfully.');
    }
}
