<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonPlan extends Model
{
    protected $table = 'lesson_plans';

    protected $fillable = ['school_id', 'teacher_id', 'subject_id', 'grade_class_id', 'topic', 'sub_topic', 'learning_objectives', 'resources', 'lesson_structure', 'assessment_methods', 'differentiation', 'reflection', 'status', 'date'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'learning_objectives' => 'array',
            'resources' => 'array',
            'lesson_structure' => 'array',
            'assessment_methods' => 'array',
        ];
    }

    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(AcademicSubject::class, 'subject_id'); }
    public function gradeClass(): BelongsTo { return $this->belongsTo(GradeClass::class); }
    public function school(): BelongsTo { return $this->belongsTo(School::class); }
}
