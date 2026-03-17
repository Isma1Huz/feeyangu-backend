<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicExam extends Model
{
    use HasFactory;

    protected $table = 'academic_exams';

    protected $fillable = ['school_id', 'name', 'type', 'term', 'year', 'start_date', 'end_date', 'status', 'settings'];

    protected function casts(): array
    {
        return ['start_date' => 'date', 'end_date' => 'date', 'settings' => 'array'];
    }

    public function school(): BelongsTo { return $this->belongsTo(School::class); }
    public function papers(): HasMany { return $this->hasMany(ExamPaper::class, 'exam_id'); }
}
