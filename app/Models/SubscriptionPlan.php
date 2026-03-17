<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'price_monthly',
        'price_yearly',
        'student_limit',
        'staff_limit',
        'storage_limit_mb',
        'features',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_monthly'    => 'decimal:2',
            'price_yearly'     => 'decimal:2',
            'student_limit'    => 'integer',
            'staff_limit'      => 'integer',
            'storage_limit_mb' => 'integer',
            'features'         => 'array',
            'is_active'        => 'boolean',
            'sort_order'       => 'integer',
        ];
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'plan_modules')
            ->withPivot('is_included')
            ->withTimestamps();
    }

    public function includedModules(): BelongsToMany
    {
        return $this->modules()->wherePivot('is_included', true);
    }

    public function schools(): HasMany
    {
        return $this->hasMany(School::class, 'plan_id');
    }

    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    /**
     * Check if the plan has an unlimited limit (0 means unlimited).
     */
    public function hasUnlimitedStudents(): bool
    {
        return $this->student_limit === 0;
    }

    public function hasUnlimitedStaff(): bool
    {
        return $this->staff_limit === 0;
    }

    public function hasUnlimitedStorage(): bool
    {
        return $this->storage_limit_mb === 0;
    }
}
