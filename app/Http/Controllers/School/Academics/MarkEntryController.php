<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\ExamPaper;
use App\Models\Student;
use App\Models\StudentMark;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarkEntryController extends Controller
{
    public function index(ExamPaper $examPaper)
    {
        $school = auth()->user()->school;

        if ($examPaper->exam->school_id !== $school->id) {
            abort(403);
        }

        $students = Student::where('school_id', $school->id)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number']);

        $marks = StudentMark::where('exam_paper_id', $examPaper->id)
            ->get()
            ->keyBy('student_id');

        return Inertia::render('school/academics/MarkEntry', [
            'examPaper' => [
                'id' => $examPaper->id,
                'name' => $examPaper->name,
                'max_marks' => $examPaper->max_marks,
                'exam' => ['id' => $examPaper->exam->id, 'name' => $examPaper->exam->name],
                'subject' => ['id' => $examPaper->subject->id, 'name' => $examPaper->subject->name],
            ],
            'students' => $students->map(fn($s) => [
                'id' => $s->id,
                'full_name' => $s->first_name . ' ' . $s->last_name,
                'admission_number' => $s->admission_number,
                'marks' => $marks->get($s->id)?->marks_obtained,
                'grade' => $marks->get($s->id)?->grade,
                'is_absent' => $marks->get($s->id)?->is_absent ?? false,
            ]),
        ]);
    }

    public function save(Request $request, ExamPaper $examPaper)
    {
        $school = auth()->user()->school;

        if ($examPaper->exam->school_id !== $school->id) {
            abort(403);
        }

        $maxMarks = $examPaper->max_marks;

        $data = $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.marks_obtained' => ['nullable', 'numeric', 'min:0', "max:{$maxMarks}"],
            'marks.*.is_absent' => 'boolean',
            'marks.*.remarks' => 'nullable|string',
        ]);

        foreach ($data['marks'] as $mark) {
            $isAbsent = $mark['is_absent'] ?? false;

            StudentMark::updateOrCreate(
                ['exam_paper_id' => $examPaper->id, 'student_id' => $mark['student_id']],
                [
                    'school_id' => $school->id,
                    'marks_obtained' => $isAbsent ? null : ($mark['marks_obtained'] ?? null),
                    'is_absent' => $isAbsent,
                    'remarks' => $mark['remarks'] ?? null,
                    'entered_by' => auth()->id(),
                    'entered_at' => now(),
                ]
            );
        }

        return redirect()->back()->with('success', 'Marks saved successfully.');
    }
}
