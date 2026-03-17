<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimetableEntry extends Model
{
    protected $table = 'timetable_entries';

    protected $fillable = ['school_id', 'grade_class_id', 'subject_id', 'teacher_id', 'day_of_week', 'time_slot', 'duration', 'room', 'effective_from', 'effective_to'];

    protected function casts(): array
    {
        return ['effective_from' => 'date', 'effective_to' => 'date'];
    }

    public function gradeClass(): BelongsTo { return $this->belongsTo(GradeClass::class); }
    public function subject(): BelongsTo { return $this->belongsTo(AcademicSubject::class, 'subject_id'); }
    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
    public function school(): BelongsTo { return $this->belongsTo(School::class); }

    public function scopeForDay($query, $day) { return $query->where('day_of_week', $day); }
    public function scopeForTeacher($query, $teacherId) { return $query->where('teacher_id', $teacherId); }
    public function scopeForClass($query, $classId) { return $query->where('grade_class_id', $classId); }
}
