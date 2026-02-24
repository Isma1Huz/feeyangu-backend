<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalCondition extends Model
{
    protected $fillable = [
        'student_id',
        'name',
        'type',
        'severity',
        'diagnosed_date',
        'treating_doctor',
        'management_notes',
        'emergency_action_plan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'diagnosed_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
