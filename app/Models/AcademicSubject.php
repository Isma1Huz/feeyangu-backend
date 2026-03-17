<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicSubject extends Model
{
    use HasFactory;

    protected $table = 'academic_subjects';

    protected $fillable = ['school_id', 'curriculum_id', 'name', 'code', 'is_core', 'credits', 'description'];

    protected function casts(): array
    {
        return ['is_core' => 'boolean'];
    }

    public function school(): BelongsTo { return $this->belongsTo(School::class); }
    public function curriculum(): BelongsTo { return $this->belongsTo(Curriculum::class); }
    public function examPapers(): HasMany { return $this->hasMany(ExamPaper::class, 'subject_id'); }
    public function classSubjects(): HasMany { return $this->hasMany(ClassSubject::class, 'subject_id'); }
}
