<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display portfolio for a specific child.
     */
    public function show(Student $student): Response
    {
        // Verify the parent has access to this student
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access to this student');
        }

        $student->load(['grade', 'class']);

        return Inertia::render('parent/Portfolio', [
            'student' => [
                'id' => (string) $student->id,
                'firstName' => $student->first_name,
                'grade' => $student->grade?->name ?? '',
                'className' => $student->class?->name ?? '',
            ],
            'portfolio' => [
                'studentId' => (string) $student->id,
                'completionPercentage' => 0,
            ],
            'learningAreas' => [],
            'evidence' => [],
        ]);
    }
}
