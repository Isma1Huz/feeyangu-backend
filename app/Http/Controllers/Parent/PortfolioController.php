<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
<<<<<<< copilot/check-backend-inconsistencies
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
=======
     * Display portfolio for a specific child.
     */
    public function show(Student $student): Response
    {
        // Verify the parent has access to this student
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access to this student');
>>>>>>> main
        }

        $student->load(['grade', 'class']);

<<<<<<< copilot/check-backend-inconsistencies
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
=======
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
>>>>>>> main
        ]);
    }
}
