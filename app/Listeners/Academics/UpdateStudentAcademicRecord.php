<?php

namespace App\Listeners\Academics;

use App\Events\Academics\StudentPromoted;

class UpdateStudentAcademicRecord
{
    public function handle(StudentPromoted $event): void
    {
        \Log::info('Student promoted', [
            'student_id' => $event->student->id,
            'from_class_id' => $event->fromClassId,
            'to_class_id' => $event->toClassId,
        ]);
    }
}
