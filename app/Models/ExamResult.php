<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    protected $table = 'exam_results';

    protected $fillable = ['exam_id', 'student_id', 'total_marks', 'percentage', 'grade', 'rank', 'remarks'];

    protected function casts(): array
    {
        return [
            'total_marks' => 'float',
            'percentage'  => 'float',
            'rank'        => 'integer',
        ];
    }

    public function exam(): BelongsTo { return $this->belongsTo(AcademicExam::class, 'exam_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
}
