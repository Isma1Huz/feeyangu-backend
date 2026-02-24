<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\GradeClass;
use App\Models\Grade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class GradeClassController extends Controller
{
    /**
     * Display a listing of classes.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $classes = GradeClass::whereHas('grade', function ($query) use ($school) {
                $query->where('school_id', $school->id);
            })
            ->with(['grade'])
            ->withCount('students')
            ->latest()
            ->paginate(20)
            ->through(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'grade' => [
                        'id' => $class->grade->id,
                        'name' => $class->grade->name,
                    ],
                    'teacher_name' => $class->teacher_name,
                    'capacity' => $class->capacity,
                    'students_count' => $class->students_count,
                    'created_at' => $class->created_at->format('M d, Y'),
                ];
            });

        $grades = $school->grades()->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('school/Classes', [
            'classes' => $classes,
            'grades' => $grades,
        ]);
    }

    /**
     * Show the form for creating a new class.
     */
    public function create(): Response
    {
        $school = auth()->user()->school;
        $grades = $school->grades()->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('school/ClassCreate', [
            'grades' => $grades,
        ]);
    }

    /**
     * Store a newly created class.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => 'required|string|max:100',
            'teacher_name' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:100',
        ]);

        // Verify grade belongs to this school
        $grade = Grade::findOrFail($validated['grade_id']);
        if ($grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access');
        }

        GradeClass::create($validated);

        return redirect()->route('school.classes.index')
            ->with('success', 'Class created successfully.');
    }

    /**
     * Display the specified class.
     */
    public function show(GradeClass $class): Response
    {
        // Ensure class belongs to this school
        if ($class->grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this class');
        }

        $class->load(['grade', 'students']);

        return Inertia::render('school/ClassShow', [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade' => [
                    'id' => $class->grade->id,
                    'name' => $class->grade->name,
                ],
                'teacher_name' => $class->teacher_name,
                'capacity' => $class->capacity,
                'students_count' => $class->students->count(),
            ],
            'students' => $class->students->map(fn($student) => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'status' => $student->status,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified class.
     */
    public function edit(GradeClass $class): Response
    {
        // Ensure class belongs to this school
        if ($class->grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this class');
        }

        $school = auth()->user()->school;
        $grades = $school->grades()->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('school/ClassEdit', [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade_id' => $class->grade_id,
                'teacher_name' => $class->teacher_name,
                'capacity' => $class->capacity,
            ],
            'grades' => $grades,
        ]);
    }

    /**
     * Update the specified class.
     */
    public function update(Request $request, GradeClass $class): RedirectResponse
    {
        // Ensure class belongs to this school
        if ($class->grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this class');
        }

        $validated = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => 'required|string|max:100',
            'teacher_name' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:100',
        ]);

        // Verify new grade belongs to this school
        $grade = Grade::findOrFail($validated['grade_id']);
        if ($grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access');
        }

        $class->update($validated);

        return redirect()->route('school.classes.show', $class)
            ->with('success', 'Class updated successfully.');
    }

    /**
     * Remove the specified class.
     */
    public function destroy(GradeClass $class): RedirectResponse
    {
        // Ensure class belongs to this school
        if ($class->grade->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this class');
        }

        // Check if class has students
        if ($class->students()->count() > 0) {
            return redirect()->route('school.classes.index')
                ->with('error', 'Cannot delete class with enrolled students.');
        }

        $class->delete();

        return redirect()->route('school.classes.index')
            ->with('success', 'Class deleted successfully.');
    }
}
