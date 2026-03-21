<?php

namespace App\Services\Academics;

use App\Models\AcademicExam;
use App\Models\ExamResult;
use App\Models\GradeScale;
use App\Models\School;
use App\Models\Student;
use Illuminate\Support\Collection;

class ReportCardService
{
    public function __construct(private readonly GradingService $gradingService) {}

    /**
     * Generate a report card data array for a single student in an exam.
     */
    public function generateForStudent(int $studentId, int $examId): array
    {
        $exam    = AcademicExam::with(['papers.marks', 'papers.subject', 'school'])->findOrFail($examId);
        $student = Student::findOrFail($studentId);

        $subjectResults = $exam->papers->map(function ($paper) use ($studentId) {
            $mark = $paper->marks->firstWhere('student_id', $studentId);

            return [
                'subject'         => $paper->subject->name ?? 'Unknown',
                'marks_obtained'  => $mark?->marks_obtained,
                'max_marks'       => $paper->max_marks,
                'is_absent'       => $mark?->is_absent ?? false,
                'grade'           => $mark ? $this->gradingService->getGrade(
                    $paper->max_marks > 0 ? ($mark->marks_obtained / $paper->max_marks) * 100 : 0,
                    $exam->school_id
                ) : null,
                'remarks'         => $mark?->remarks,
            ];
        });

        $totalObtained = $subjectResults->sum('marks_obtained');
        $totalMax      = $exam->papers->sum('max_marks');
        $percentage    = $totalMax > 0 ? round(($totalObtained / $totalMax) * 100, 2) : 0;
        $overallGrade  = $this->gradingService->getGrade($percentage, $exam->school_id);

        // Compute rank from stored results
        $rank = ExamResult::where('exam_id', $examId)
            ->orderByDesc('percentage')
            ->pluck('student_id')
            ->search($studentId);

        return [
            'student'         => [
                'id'             => $student->id,
                'name'           => $student->full_name ?? $student->name,
                'registration'   => $student->registration_number ?? $student->reg_number,
            ],
            'exam'            => [
                'id'   => $exam->id,
                'name' => $exam->name,
                'term' => $exam->term,
                'year' => $exam->year,
                'type' => $exam->type,
            ],
            'subject_results' => $subjectResults->values()->all(),
            'summary'         => [
                'total_marks'   => $totalObtained,
                'max_marks'     => $totalMax,
                'percentage'    => $percentage,
                'overall_grade' => $overallGrade,
                'rank'          => $rank !== false ? $rank + 1 : null,
            ],
        ];
    }

    /**
     * Generate report cards for all students in an exam.
     */
    public function generateForExam(int $examId): Collection
    {
        $exam = AcademicExam::with(['papers.marks'])->findOrFail($examId);

        $studentIds = $exam->papers
            ->flatMap(fn ($paper) => $paper->marks->pluck('student_id'))
            ->unique();

        return $studentIds->map(fn ($studentId) => $this->generateForStudent($studentId, $examId));
    }
}
