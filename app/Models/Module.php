<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'key',
        'icon',
        'description',
        'dependencies',
        'permissions',
        'settings',
        'sort_order',
        'is_core',
        'is_active',
        'is_globally_disabled',
    ];

    protected function casts(): array
    {
        return [
            'dependencies'         => 'array',
            'permissions'          => 'array',
            'settings'             => 'array',
            'is_core'              => 'boolean',
            'is_active'            => 'boolean',
            'is_globally_disabled' => 'boolean',
        ];
    }

    /**
     * The schools that have this module enabled/disabled.
     */
    public function schools(): BelongsToMany
    {
        return $this->belongsToMany(School::class, 'module_school')
            ->withPivot(['is_enabled', 'settings', 'permissions_override'])
            ->withTimestamps();
    }

    /**
     * Plans that include this module.
     */
    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(SubscriptionPlan::class, 'plan_modules')
            ->withPivot('is_included')
            ->withTimestamps();
    }

    /**
     * Per-tenant status overrides for this module.
     */
    public function tenantOverrides(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ModuleTenantOverride::class);
    }

    /**
     * Get the dependency Module models for this module.
     */
    public function getDependencyModules(): \Illuminate\Database\Eloquent\Collection
    {
        if (empty($this->dependencies)) {
            return collect();
        }

        return static::whereIn('key', $this->dependencies)->get();
    }

    /**
     * Scope: only active modules.
     */
    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }
}
