<?php

namespace App\Events\Academics;

use App\Models\AcademicExam;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ResultsPublished
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly AcademicExam $exam,
        public readonly int $publishedBy
    ) {}
}
