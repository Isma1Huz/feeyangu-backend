<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffDirectPermission extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'staff_id',
        'permission_id',
        'assigned_by',
        'assigned_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'expires_at'  => 'datetime',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function permission(): BelongsTo
    {
        return $this->belongsTo(\Spatie\Permission\Models\Permission::class, 'permission_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
