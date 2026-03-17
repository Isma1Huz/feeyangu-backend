<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModuleTenantOverride extends Model
{
    protected $table = 'module_tenant_overrides';

    protected $fillable = [
        'module_id',
        'school_id',
        'status',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
