<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSubject extends Model
{
    protected $table = 'class_subjects';

    protected $fillable = ['grade_class_id', 'subject_id', 'teacher_id', 'periods_per_week'];

    public function gradeClass(): BelongsTo { return $this->belongsTo(GradeClass::class); }
    public function subject(): BelongsTo { return $this->belongsTo(AcademicSubject::class, 'subject_id'); }
    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
}
