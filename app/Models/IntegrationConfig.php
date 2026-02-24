<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationConfig extends Model
{
    protected $fillable = [
        'school_id',
        'provider',
        'display_name',
        'status',
        'last_synced_at',
        'sync_frequency',
        'items_synced',
        'sync_errors',
    ];

    protected function casts(): array
    {
        return [
            'last_synced_at' => 'datetime',
            'items_synced' => 'integer',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
