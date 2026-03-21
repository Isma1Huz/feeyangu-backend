<?php

namespace App\Services\Academics;

use App\Models\ExamPaper;
use App\Models\Student;
use App\Models\StudentMark;
use Illuminate\Support\Facades\DB;

class MarkEntryService
{
    /**
     * Save (upsert) marks for all students in a single exam paper.
     *
     * @param  array<int, array{marks_obtained?: float|null, is_absent?: bool, remarks?: string|null}>  $marks  Keyed by student_id
     */
    public function saveMarks(int $examPaperId, array $marks, int $userId, int $schoolId): void
    {
        DB::transaction(function () use ($examPaperId, $marks, $userId, $schoolId) {
            foreach ($marks as $studentId => $data) {
                StudentMark::updateOrCreate(
                    ['exam_paper_id' => $examPaperId, 'student_id' => $studentId],
                    [
                        'school_id'      => $schoolId,
                        'marks_obtained' => ($data['is_absent'] ?? false) ? null : ($data['marks_obtained'] ?? null),
                        'is_absent'      => $data['is_absent'] ?? false,
                        'remarks'        => $data['remarks'] ?? null,
                        'entered_by'     => $userId,
                        'entered_at'     => now(),
                    ]
                );
            }
        });
    }

    /**
     * Build the mark-entry grid: list of students with their existing marks.
     */
    public function getMarkEntryGrid(int $examPaperId, int $schoolId): array
    {
        $examPaper = ExamPaper::with('subject', 'exam')->findOrFail($examPaperId);

        $students = Student::where('school_id', $schoolId)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number']);

        $marks = StudentMark::where('exam_paper_id', $examPaperId)
            ->get()
            ->keyBy('student_id');

        return [
            'exam_paper' => $examPaper,
            'students'   => $students->map(function ($s) use ($marks) {
                $mark = $marks->get($s->id);
                return [
                    'id'               => $s->id,
                    'full_name'        => $s->first_name . ' ' . $s->last_name,
                    'admission_number' => $s->admission_number,
                    'marks'            => $mark?->marks_obtained,
                    'grade'            => $mark?->grade,
                    'is_absent'        => $mark?->is_absent ?? false,
                    'remarks'          => $mark?->remarks ?? '',
                ];
            })->values()->all(),
        ];
    }

    /**
     * Compute basic statistics for an exam paper.
     */
    public function getStats(int $examPaperId): array
    {
        $marks = StudentMark::where('exam_paper_id', $examPaperId)
            ->whereNotNull('marks_obtained')
            ->pluck('marks_obtained')
            ->map(fn ($v) => (float) $v);

        if ($marks->isEmpty()) {
            return [
                'average'            => null,
                'highest'            => null,
                'lowest'             => null,
                'median'             => null,
                'standard_deviation' => null,
                'count'              => 0,
                'distribution'       => ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0],
            ];
        }

        $sorted = $marks->sort()->values();
        $count  = $sorted->count();
        $mean   = $marks->avg();

        $median = $count % 2 === 0
            ? ($sorted[$count / 2 - 1] + $sorted[$count / 2]) / 2
            : $sorted[(int) ($count / 2)];

        $variance = $marks->map(fn ($m) => ($m - $mean) ** 2)->sum() / $count;

        return [
            'average'            => round($mean, 2),
            'highest'            => $marks->max(),
            'lowest'             => $marks->min(),
            'median'             => round($median, 2),
            'standard_deviation' => round(sqrt($variance), 2),
            'count'              => $count,
            'distribution'       => [
                'A' => $marks->filter(fn ($m) => $m >= 80)->count(),
                'B' => $marks->filter(fn ($m) => $m >= 70 && $m < 80)->count(),
                'C' => $marks->filter(fn ($m) => $m >= 60 && $m < 70)->count(),
                'D' => $marks->filter(fn ($m) => $m >= 50 && $m < 60)->count(),
                'E' => $marks->filter(fn ($m) => $m < 50)->count(),
            ],
        ];
    }

    /**
     * Validate that mark values are within bounds.
     *
     * @param  array<int, float|null>  $marks  Keyed by student_id
     * @return array<int, string>  Validation errors keyed by student_id
     */
    public function validateMarks(array $marks, float $maxMarks): array
    {
        $errors = [];
        foreach ($marks as $studentId => $value) {
            if ($value !== null && ($value < 0 || $value > $maxMarks)) {
                $errors[$studentId] = "Marks must be between 0 and {$maxMarks}";
            }
        }
        return $errors;
    }
}
