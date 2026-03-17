<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPaper extends Model
{
    protected $table = 'exam_papers';

    protected $fillable = ['exam_id', 'subject_id', 'name', 'max_marks', 'weight', 'date', 'start_time', 'duration', 'venue', 'instructions'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function exam(): BelongsTo { return $this->belongsTo(AcademicExam::class, 'exam_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(AcademicSubject::class, 'subject_id'); }
    public function marks(): HasMany { return $this->hasMany(StudentMark::class, 'exam_paper_id'); }

    public function getAverage(): float
    {
        return $this->marks()->whereNotNull('marks_obtained')->avg('marks_obtained') ?? 0;
    }

    public function getHighest(): float
    {
        return $this->marks()->whereNotNull('marks_obtained')->max('marks_obtained') ?? 0;
    }

    public function getLowest(): float
    {
        return $this->marks()->whereNotNull('marks_obtained')->min('marks_obtained') ?? 0;
    }
}
