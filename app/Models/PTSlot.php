<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PTSlot extends Model
{
    protected $table = 'pt_slots';
    
    protected $fillable = [
        'session_id',
        'teacher_name',
        'date',
        'start_time',
        'end_time',
        'status',
        'blocked_reason',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(PTSession::class, 'session_id');
    }

    public function ptBooking(): HasOne
    {
        return $this->hasOne(PTBooking::class, 'slot_id');
    }
}
