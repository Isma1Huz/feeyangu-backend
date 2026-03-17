<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curriculum extends Model
{
    use HasFactory;

    protected $fillable = ['school_id', 'name', 'code', 'type', 'description', 'is_active', 'settings'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'settings' => 'array'];
    }

    public function school(): BelongsTo { return $this->belongsTo(School::class); }
    public function learningAreas(): HasMany { return $this->hasMany(LearningArea::class); }
    public function subjects(): HasMany { return $this->hasMany(AcademicSubject::class); }
    public function gradeScales(): HasMany { return $this->hasMany(GradeScale::class); }

    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeByType($query, $type) { return $query->where('type', $type); }
}
