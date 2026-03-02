<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display a student's portfolio for a linked parent.
     * Portfolio data model is not yet implemented — returns empty scaffold.
     */
    public function show(Student $student): Response
    {
        $parent = auth()->user();

        // Verify the parent is linked to this student
        $linked = $parent->students()->where('students.id', $student->id)->exists();
        if (!$linked) {
            abort(403, 'You are not linked to this student');
        }

        $student->load(['grade', 'class']);

        $studentData = [
            'id'        => (string) $student->id,
            'firstName' => $student->first_name,
            'lastName'  => $student->last_name,
            'grade'     => $student->grade?->name ?? '',
            'className' => $student->class?->name ?? '',
        ];

        return Inertia::render('parent/Portfolio', [
            'student'       => $studentData,
            'portfolio'     => ['completionPercentage' => 0, 'evidenceItems' => []],
            'learningAreas' => [],
            'evidence'      => [],
        ]);
    }
}
