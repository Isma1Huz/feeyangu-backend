<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Allergy extends Model
{
    protected $fillable = [
        'student_id',
        'allergen',
        'allergen_category',
        'reaction_type',
        'severity',
        'emergency_protocol',
        'epi_pen_available',
        'epi_pen_location',
    ];

    protected function casts(): array
    {
        return [
            'epi_pen_available' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
