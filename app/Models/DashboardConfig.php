<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardConfig extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_type',
        'config_key',
        'config_value',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'config_value' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(School::class, 'tenant_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
