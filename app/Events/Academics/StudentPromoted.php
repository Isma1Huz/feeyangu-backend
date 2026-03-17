<?php

namespace App\Events\Academics;

use App\Models\Student;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudentPromoted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Student $student,
        public readonly int $fromClassId,
        public readonly int $toClassId
    ) {}
}
