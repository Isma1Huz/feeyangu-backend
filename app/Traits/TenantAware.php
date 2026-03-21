<?php

namespace App\Traits;

use App\Models\School;
use Illuminate\Database\Eloquent\Builder;

trait TenantAware
{
    /**
     * Boot the trait: automatically scope queries to the current tenant.
     */
    public static function bootTenantAware(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = static::resolveTenantId();

            if ($tenantId) {
                $builder->where(static::getTenantColumn(), $tenantId);
            }
        });

        static::creating(function ($model) {
            if (empty($model->{static::getTenantColumn()})) {
                $tenantId = static::resolveTenantId();
                if ($tenantId) {
                    $model->{static::getTenantColumn()} = $tenantId;
                }
            }
        });
    }

    /**
     * The column used to identify the tenant. Override in the model if needed.
     */
    protected static function getTenantColumn(): string
    {
        return 'school_id';
    }

    /**
     * Resolve the current tenant's ID from the authenticated user.
     */
    protected static function resolveTenantId(): ?int
    {
        $user = auth()->user();

        if (!$user) {
            return null;
        }

        if ($user->hasRole('super_admin')) {
            return null;
        }

        return $user->school_id ?? null;
    }

    /**
     * Get the tenant (school) this model belongs to.
     */
    public function tenant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(School::class, static::getTenantColumn());
    }
}
