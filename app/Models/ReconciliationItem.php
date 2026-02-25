<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReconciliationItem extends Model
{
    protected $fillable = [
        'school_id',
        'bank_transaction_id',
        'system_payment_id',
        'status',
        'confidence',
        'matched_at',
        'matched_by',
    ];

    protected function casts(): array
    {
        return [
            'matched_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function bankTransaction(): BelongsTo
    {
        return $this->belongsTo(BankTransaction::class);
    }

    public function systemPayment(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'system_payment_id');
    }

    public function matcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'matched_by');
    }
}
