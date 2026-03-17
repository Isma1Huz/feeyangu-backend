<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class School extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'owner_name',
        'status',
        'location',
        'logo',
        'motto',
        'email',
        'phone',
        'primary_color',
        'secondary_color',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function academicTerms(): HasMany
    {
        return $this->hasMany(AcademicTerm::class);
    }

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }

    public function schoolPaymentConfigs(): HasMany
    {
        return $this->hasMany(SchoolPaymentConfig::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function expenseRecords(): HasMany
    {
        return $this->hasMany(ExpenseRecord::class);
    }

    public function ptSessions(): HasMany
    {
        return $this->hasMany(PTSession::class);
    }

    public function bankTransactions(): HasMany
    {
        return $this->hasMany(BankTransaction::class);
    }

    public function integrationConfigs(): HasMany
    {
        return $this->hasMany(IntegrationConfig::class);
    }

    public function apiCredentials(): HasMany
    {
        return $this->hasMany(SchoolApiCredential::class);
    }

    public function reconciliationItems(): HasMany
    {
        return $this->hasMany(ReconciliationItem::class);
    }

    /**
     * All modules registered for this school (via pivot table).
     */
    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'module_school')
            ->withPivot(['is_enabled', 'settings', 'permissions_override'])
            ->withTimestamps();
    }

    /**
     * Only the modules that are enabled for this school.
     */
    public function enabledModules(): BelongsToMany
    {
        return $this->modules()->wherePivot('is_enabled', true);
    }

    /**
     * Check whether a given module key is enabled for this school.
     */
    public function isModuleEnabled(string $moduleKey): bool
    {
        return $this->enabledModules()->where('key', $moduleKey)->exists();
    }

    /**
     * Retrieve the settings for a specific module on this school.
     */
    public function getModuleSettings(string $moduleKey): array
    {
        $module = $this->modules()->where('key', $moduleKey)->first();

        return $module ? ($module->pivot->settings ?? []) : [];
    }
}
