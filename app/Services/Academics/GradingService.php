<?php

namespace App\Services\Academics;

use App\Models\AcademicExam;
use App\Models\ExamResult;
use App\Models\GradeScale;
use App\Models\StudentMark;
use Illuminate\Support\Collection;

class GradingService
{
    /**
     * Determine the letter grade for a given percentage using the school's grade scale.
     */
    public function getGrade(float $percentage, int $schoolId, ?int $curriculumId = null): string
    {
        $gradeScale = GradeScale::where('school_id', $schoolId)
            ->when($curriculumId, fn ($q) => $q->where('curriculum_id', $curriculumId))
            ->where('is_default', true)
            ->first();

        if ($gradeScale) {
            return $gradeScale->getGradeForMarks($percentage) ?? $this->getDefaultGrade($percentage);
        }

        return $this->getDefaultGrade($percentage);
    }

    /**
     * Calculate the grade and remarks for a student's marks on an exam paper.
     */
    public function gradeStudentMark(StudentMark $mark): array
    {
        $examPaper  = $mark->examPaper;
        $maxMarks   = $examPaper->max_marks ?? 100;
        $percentage = $maxMarks > 0 ? round(($mark->marks_obtained / $maxMarks) * 100, 2) : 0;

        $grade = $this->getGrade($percentage, $mark->school_id ?? $examPaper->exam?->school_id ?? 0);

        return [
            'grade'      => $grade,
            'percentage' => $percentage,
            'remarks'    => $this->getRemarks($grade),
        ];
    }

    /**
     * Compute a ranked summary for all students in an exam.
     */
    public function computeExamRankings(int $examId): Collection
    {
        $exam = AcademicExam::with(['papers.marks', 'papers'])->findOrFail($examId);

        $marksByStudent = $exam->papers
            ->flatMap(fn ($paper) => $paper->marks)
            ->groupBy('student_id');

        $maxMarks = $exam->papers->sum('max_marks');

        $results = $marksByStudent->map(function ($marks, $studentId) use ($maxMarks, $exam) {
            $totalObtained = $marks->whereNotNull('marks_obtained')->sum('marks_obtained');
            $percentage    = $maxMarks > 0 ? round(($totalObtained / $maxMarks) * 100, 2) : 0;

            return [
                'student_id'   => $studentId,
                'total_marks'  => $totalObtained,
                'max_marks'    => $maxMarks,
                'percentage'   => $percentage,
                'grade'        => $this->getGrade($percentage, $exam->school_id),
            ];
        })->values()->sortByDesc('percentage')->values();

        return $results->map(function ($result, $index) {
            return array_merge($result, ['rank' => $index + 1]);
        });
    }

    /**
     * Default grading scale when no school-specific scale is configured.
     */
    public function getDefaultGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 80 => 'A',
            $percentage >= 75 => 'A-',
            $percentage >= 70 => 'B+',
            $percentage >= 65 => 'B',
            $percentage >= 60 => 'B-',
            $percentage >= 55 => 'C+',
            $percentage >= 50 => 'C',
            $percentage >= 45 => 'C-',
            $percentage >= 40 => 'D+',
            $percentage >= 35 => 'D',
            $percentage >= 30 => 'D-',
            default           => 'E',
        };
    }

    /**
     * Get remarks string for a given grade.
     */
    public function getRemarks(string $grade): string
    {
        return match ($grade) {
            'A', 'A-'       => 'Excellent',
            'B+', 'B', 'B-' => 'Very Good',
            'C+', 'C', 'C-' => 'Average',
            'D+', 'D', 'D-' => 'Below Average',
            default         => 'Fail',
        };
    }
}
