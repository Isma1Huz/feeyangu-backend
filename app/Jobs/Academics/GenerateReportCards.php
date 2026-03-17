<?php

namespace App\Jobs\Academics;

use App\Models\AcademicExam;
use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateReportCards implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $examId,
        public readonly int $schoolId,
        public readonly ?int $classId = null
    ) {}

    public function handle(): void
    {
        $exam = AcademicExam::with('papers.marks.student')->findOrFail($this->examId);

        $studentsQuery = Student::where('school_id', $this->schoolId)
            ->where('status', 'active');

        if ($this->classId) {
            $studentsQuery->where('class_id', $this->classId);
        }

        $students = $studentsQuery->get();

        // Future: generate PDF report cards using DomPDF
        Log::info('Report cards generation triggered', [
            'exam_id' => $this->examId,
            'students_count' => $students->count(),
        ]);
    }
}
