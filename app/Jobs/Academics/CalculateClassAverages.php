<?php

namespace App\Jobs\Academics;

use App\Models\AcademicExam;
use App\Models\ExamPaper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CalculateClassAverages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $examId
    ) {}

    public function handle(): void
    {
        $exam = AcademicExam::with('papers.marks')->findOrFail($this->examId);

        foreach ($exam->papers as $paper) {
            $avg = $paper->marks()->whereNotNull('marks_obtained')->avg('marks_obtained');
            Log::info('Paper average calculated', [
                'paper_id' => $paper->id,
                'average' => round($avg ?? 0, 2),
            ]);
        }
    }
}
