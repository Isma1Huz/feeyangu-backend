<?php

namespace App\Services\Academics;

use App\Models\AcademicExam;
use App\Models\ExamResult;
use App\Models\GradeScale;
use Illuminate\Support\Facades\DB;

class ExamService
{
    /**
     * Calculate results for an exam without persisting them.
     */
    public function calculateResults(int $examId): array
    {
        $exam = AcademicExam::with(['papers.marks', 'papers.subject'])->findOrFail($examId);

        $maxMarks = $exam->papers->sum('max_marks');

        // Group all marks by student_id
        $marksByStudent = $exam->papers
            ->flatMap(fn ($paper) => $paper->marks)
            ->groupBy('student_id');

        // Try to find a default grade scale for this school
        $gradeScale = GradeScale::where('school_id', $exam->school_id)
            ->where('is_default', true)
            ->first();

        $results = [];

        foreach ($marksByStudent as $studentId => $marks) {
            $totalMarks = $marks->whereNotNull('marks_obtained')->sum('marks_obtained');
            $percentage = $maxMarks > 0 ? round(($totalMarks / $maxMarks) * 100, 2) : 0;

            $grade = $gradeScale
                ? ($gradeScale->getGradeForMarks($percentage) ?? $this->getDefaultGrade($percentage))
                : $this->getDefaultGrade($percentage);

            $results[] = [
                'student_id'        => $studentId,
                'total_marks'       => $totalMarks,
                'percentage'        => $percentage,
                'grade'             => $grade,
                'subject_breakdown' => $marks->map(fn ($m) => [
                    'subject' => $m->examPaper->subject->name ?? '',
                    'marks'   => $m->marks_obtained,
                    'max'     => $m->examPaper->max_marks,
                ])->values()->all(),
            ];
        }

        // Sort by percentage descending and assign rank
        usort($results, fn ($a, $b) => $b['percentage'] <=> $a['percentage']);

        foreach ($results as $index => &$result) {
            $result['rank'] = $index + 1;
        }
        unset($result);

        return $results;
    }

    /**
     * Persist calculated results and mark exam as published.
     */
    public function publishResults(int $examId): void
    {
        $exam    = AcademicExam::findOrFail($examId);
        $results = $this->calculateResults($examId);

        DB::transaction(function () use ($exam, $results) {
            foreach ($results as $result) {
                ExamResult::updateOrCreate(
                    ['exam_id' => $exam->id, 'student_id' => $result['student_id']],
                    [
                        'total_marks' => $result['total_marks'],
                        'percentage'  => $result['percentage'],
                        'grade'       => $result['grade'],
                        'rank'        => $result['rank'],
                    ]
                );
            }

            $exam->update(['status' => 'published']);
        });
    }

    private function getDefaultGrade(float $percentage): string
    {
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B';
        if ($percentage >= 60) return 'C';
        if ($percentage >= 50) return 'D';
        return 'E';
    }
}
