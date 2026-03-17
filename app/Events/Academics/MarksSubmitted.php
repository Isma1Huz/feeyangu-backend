<?php

namespace App\Events\Academics;

use App\Models\ExamPaper;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MarksSubmitted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ExamPaper $examPaper,
        public readonly int $marksCount,
        public readonly int $submittedBy
    ) {}
}
