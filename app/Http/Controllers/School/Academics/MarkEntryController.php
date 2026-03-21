<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\ExamPaper;
use App\Models\Student;
use App\Models\StudentMark;
use App\Services\Academics\MarkEntryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarkEntryController extends Controller
{
    public function __construct(private MarkEntryService $service) {}

    public function index(ExamPaper $examPaper)
    {
        $school = auth()->user()->school;

        if ($examPaper->exam->school_id !== $school->id) {
            abort(403);
        }

        $grid = $this->service->getMarkEntryGrid($examPaper->id, $school->id);

        return Inertia::render('school/academics/MarkEntry', [
            'examPaper' => [
                'id' => $examPaper->id,
                'name' => $examPaper->name,
                'max_marks' => $examPaper->max_marks,
                'exam' => ['id' => $examPaper->exam->id, 'name' => $examPaper->exam->name],
                'subject' => ['id' => $examPaper->subject->id, 'name' => $examPaper->subject->name],
            ],
            'students' => $grid['students'],
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

        // Re-key by student_id for the service
        $marksKeyed = [];
        foreach ($data['marks'] as $mark) {
            $marksKeyed[$mark['student_id']] = [
                'marks_obtained' => $mark['marks_obtained'] ?? null,
                'is_absent'      => $mark['is_absent'] ?? false,
                'remarks'        => $mark['remarks'] ?? null,
            ];
        }

        $this->service->saveMarks($examPaper->id, $marksKeyed, auth()->id(), $school->id);

        return redirect()->back()->with('success', 'Marks saved successfully.');
    }

    public function getStats(ExamPaper $examPaper)
    {
        $school = auth()->user()->school;

        if ($examPaper->exam->school_id !== $school->id) {
            abort(403);
        }

        return response()->json($this->service->getStats($examPaper->id));
    }
}
