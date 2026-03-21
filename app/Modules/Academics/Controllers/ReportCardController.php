<?php

namespace App\Modules\Academics\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\Academics\GenerateReportCards;
use App\Models\AcademicExam;
use App\Services\Academics\ReportCardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportCardController extends Controller
{
    public function __construct(private readonly ReportCardService $reportCardService) {}

    /**
     * List exams available for report card generation.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;
        $exams  = AcademicExam::where('school_id', $school->id)
            ->where('status', 'published')
            ->orderByDesc('year')
            ->orderByDesc('term')
            ->get(['id', 'name', 'term', 'year', 'type']);

        return Inertia::render('school/Academics/ReportCards/Index', compact('exams'));
    }

    /**
     * Show report card for a single student in an exam.
     */
    public function show(int $examId, int $studentId): Response
    {
        $school = auth()->user()->school;

        AcademicExam::where('school_id', $school->id)->findOrFail($examId);

        $reportCard = $this->reportCardService->generateForStudent($studentId, $examId);

        return Inertia::render('school/Academics/ReportCards/Show', compact('reportCard'));
    }

    /**
     * Queue generation of report cards for all students in an exam.
     */
    public function generate(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'exam_id' => 'required|integer|exists:academic_exams,id',
        ]);

        $school = auth()->user()->school;
        AcademicExam::where('school_id', $school->id)->findOrFail($validated['exam_id']);

        GenerateReportCards::dispatch($validated['exam_id']);

        return response()->json(['message' => 'Report card generation has been queued.']);
    }
}
