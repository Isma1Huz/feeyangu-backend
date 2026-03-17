<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeScale extends Model
{
    protected $fillable = ['school_id', 'curriculum_id', 'name', 'levels', 'is_default'];

    protected function casts(): array
    {
        return ['levels' => 'array', 'is_default' => 'boolean'];
    }

    public function school(): BelongsTo { return $this->belongsTo(School::class); }
    public function curriculum(): BelongsTo { return $this->belongsTo(Curriculum::class); }

    public function getGradeForMarks(float $marks): ?string
    {
        foreach ($this->levels as $level) {
            if ($marks >= $level['min'] && $marks <= $level['max']) {
                return $level['grade'];
            }
        }
        return null;
    }
}
