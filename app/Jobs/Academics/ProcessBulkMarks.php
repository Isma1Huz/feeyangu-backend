<?php

namespace App\Jobs\Academics;

use App\Models\ExamPaper;
use App\Models\StudentMark;
use App\Events\Academics\MarksSubmitted;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBulkMarks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $examPaperId,
        public readonly array $marksData,
        public readonly int $schoolId,
        public readonly int $submittedBy
    ) {}

    public function handle(): void
    {
        $examPaper = ExamPaper::findOrFail($this->examPaperId);

        $saved = 0;
        foreach ($this->marksData as $mark) {
            $marksObtained = $mark['is_absent'] ? null : ($mark['marks_obtained'] ?? null);
            // Cap marks at the exam paper's maximum
            if ($marksObtained !== null && $marksObtained > $examPaper->max_marks) {
                $marksObtained = $examPaper->max_marks;
            }
            StudentMark::updateOrCreate(
                ['exam_paper_id' => $this->examPaperId, 'student_id' => $mark['student_id']],
                [
                    'school_id' => $this->schoolId,
                    'marks_obtained' => $marksObtained,
                    'is_absent' => $mark['is_absent'] ?? false,
                    'remarks' => $mark['remarks'] ?? null,
                    'entered_by' => $this->submittedBy,
                    'entered_at' => now(),
                ]
            );
            $saved++;
        }

        MarksSubmitted::dispatch($examPaper, $saved, $this->submittedBy);

        Log::info('Bulk marks processed', [
            'exam_paper_id' => $this->examPaperId,
            'marks_saved' => $saved,
        ]);
    }
}
