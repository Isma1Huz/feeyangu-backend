<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchemeOfWork extends Model
{
    protected $table = 'schemes_of_work';

    protected $fillable = ['school_id', 'teacher_id', 'subject_id', 'grade_class_id', 'term', 'year', 'weeks', 'status'];

    protected function casts(): array
    {
        return ['weeks' => 'array'];
    }

    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(AcademicSubject::class, 'subject_id'); }
    public function gradeClass(): BelongsTo { return $this->belongsTo(GradeClass::class); }
    public function school(): BelongsTo { return $this->belongsTo(School::class); }
}
