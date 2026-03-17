<?php

namespace App\Listeners\Academics;

use App\Events\Academics\ResultsPublished;

class NotifyResultsPublished
{
    public function handle(ResultsPublished $event): void
    {
        // Future: notify parents/students via communication module
        \Log::info('Exam results published', [
            'exam_id' => $event->exam->id,
            'exam_name' => $event->exam->name,
            'published_by' => $event->publishedBy,
        ]);
    }
}
