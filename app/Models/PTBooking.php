<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PTBooking extends Model
{
    protected $table = 'pt_bookings';
    
    protected $fillable = [
        'slot_id',
        'session_id',
        'parent_id',
        'student_id',
        'status',
        'parent_message',
        'teacher_notes',
        'reschedule_reason',
        'booked_at',
        'confirmed_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'booked_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(PTSlot::class, 'slot_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(PTSession::class, 'session_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
