<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthIncident extends Model
{
    protected $fillable = [
        'student_id',
        'incident_date',
        'incident_time',
        'type',
        'description',
        'action_taken',
        'reported_by',
        'parent_notified',
        'parent_notified_at',
        'external_medical_help',
        'external_medical_details',
        'follow_up_required',
        'follow_up_date',
        'follow_up_completed',
        'follow_up_notes',
    ];

    protected function casts(): array
    {
        return [
            'incident_date' => 'date',
            'parent_notified' => 'boolean',
            'parent_notified_at' => 'datetime',
            'external_medical_help' => 'boolean',
            'follow_up_required' => 'boolean',
            'follow_up_date' => 'date',
            'follow_up_completed' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
