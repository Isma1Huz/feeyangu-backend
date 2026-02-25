<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PTSession extends Model
{
    protected $table = 'pt_sessions';
    
    protected $fillable = [
        'school_id',
        'name',
        'dates',
        'slot_duration_minutes',
        'break_between_slots_minutes',
        'start_time',
        'end_time',
        'venue',
        'parent_instructions',
        'status',
        'booking_deadline',
    ];

    protected function casts(): array
    {
        return [
            'dates' => 'array',
            'booking_deadline' => 'date',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function ptSlots(): HasMany
    {
        return $this->hasMany(PTSlot::class, 'session_id');
    }

    public function ptBookings(): HasMany
    {
        return $this->hasMany(PTBooking::class, 'session_id');
    }
}
