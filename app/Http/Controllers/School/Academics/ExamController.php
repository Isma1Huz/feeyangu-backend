<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicExam;
use App\Models\AcademicSubject;
use App\Models\ExamPaper;
use App\Services\Academics\ExamService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function __construct(private ExamService $examService) {}

    public function index()
    {
        $school = auth()->user()->school;

        $exams = AcademicExam::where('school_id', $school->id)
            ->withCount('papers')
            ->latest()
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'type' => $e->type,
                'term' => $e->term,
                'year' => $e->year,
                'start_date' => $e->start_date?->format('Y-m-d'),
                'end_date' => $e->end_date?->format('Y-m-d'),
                'status' => $e->status,
                'papers_count' => $e->papers_count,
            ]);

        $subjects = AcademicSubject::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('school/academics/Exams', [
            'exams' => $exams,
            'subjects' => $subjects,
        ]);
    }

    public function show(AcademicExam $exam)
    {
        if ($exam->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $exam->load(['papers.subject', 'papers.marks.student']);

        $publishedResults = null;
        if ($exam->status === 'published') {
            $publishedResults = $exam->results()
                ->with('student:id,first_name,last_name,admission_number')
                ->orderBy('rank')
                ->get()
                ->map(fn($r) => [
                    'student_id'       => $r->student_id,
                    'student_name'     => $r->student->first_name . ' ' . $r->student->last_name,
                    'admission_number' => $r->student->admission_number,
                    'total_marks'      => $r->total_marks,
                    'percentage'       => $r->percentage,
                    'grade'            => $r->grade,
                    'rank'             => $r->rank,
                ]);
        }

        return Inertia::render('school/academics/ExamShow', [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'type' => $exam->type,
                'term' => $exam->term,
                'year' => $exam->year,
                'start_date' => $exam->start_date?->format('Y-m-d'),
                'end_date' => $exam->end_date?->format('Y-m-d'),
                'status' => $exam->status,
                'papers' => $exam->papers->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'subject' => ['id' => $p->subject->id, 'name' => $p->subject->name],
                    'max_marks' => $p->max_marks,
                    'marks_entered' => $p->marks->count(),
                    'average' => round($p->getAverage(), 2),
                ]),
            ],
            'results' => $publishedResults,
        ]);
    }

    public function store(Request $request)
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cat,end_term,mock,final',
            'term' => 'required|integer|min:1|max:3',
            'year' => 'required|integer|min:2000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'papers' => 'nullable|array',
            'papers.*.subject_id' => 'required|exists:academic_subjects,id',
            'papers.*.name' => 'required|string',
            'papers.*.max_marks' => 'required|integer|min:1',
        ]);

        $exam = AcademicExam::create([
            'school_id' => $school->id,
            'name' => $data['name'],
            'type' => $data['type'],
            'term' => $data['term'],
            'year' => $data['year'],
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'status' => 'draft',
        ]);

        if (!empty($data['papers'])) {
            foreach ($data['papers'] as $paper) {
                ExamPaper::create([
                    'exam_id' => $exam->id,
                    'subject_id' => $paper['subject_id'],
                    'name' => $paper['name'],
                    'max_marks' => $paper['max_marks'],
                ]);
            }
        }

        return redirect()->back()->with('success', 'Exam created.');
    }

    public function update(Request $request, AcademicExam $exam)
    {
        if ($exam->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cat,end_term,mock,final',
            'term' => 'required|integer|min:1|max:3',
            'year' => 'required|integer|min:2000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'in:draft,published,in_progress,completed',
        ]);

        $exam->update($data);

        return redirect()->back()->with('success', 'Exam updated.');
    }

    public function destroy(AcademicExam $exam)
    {
        if ($exam->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $exam->delete();

        return redirect()->back()->with('success', 'Exam deleted.');
    }

    public function publish(AcademicExam $exam)
    {
        if ($exam->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $this->examService->publishResults($exam->id);

        return redirect()->back()->with('success', 'Exam results published.');
    }

    public function results(AcademicExam $exam)
    {
        if ($exam->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $results = $this->examService->calculateResults($exam->id);

        return response()->json($results);
    }
}
