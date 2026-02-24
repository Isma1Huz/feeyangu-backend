<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentHealthProfile extends Model
{
    protected $fillable = [
        'student_id',
        'blood_type',
        'height',
        'weight',
        'vision_notes',
        'hearing_notes',
        'general_health_status',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
