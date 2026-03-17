<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentMark extends Model
{
    protected $table = 'student_marks';

    protected $fillable = ['school_id', 'exam_paper_id', 'student_id', 'marks_obtained', 'grade', 'remarks', 'entered_by', 'entered_at', 'is_absent'];

    protected function casts(): array
    {
        return ['entered_at' => 'datetime', 'is_absent' => 'boolean', 'marks_obtained' => 'float'];
    }

    public function examPaper(): BelongsTo { return $this->belongsTo(ExamPaper::class, 'exam_paper_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
    public function enteredBy(): BelongsTo { return $this->belongsTo(User::class, 'entered_by'); }
}
