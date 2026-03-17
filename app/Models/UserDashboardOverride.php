<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDashboardOverride extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'config_key',
        'config_value',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'config_value' => 'boolean',
            'created_at'   => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
