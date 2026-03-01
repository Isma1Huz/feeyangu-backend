<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BankTransaction extends Model
{
    protected $fillable = [
        'school_id',
        'bank',
        'date',
        'description',
        'reference',
        'amount',
        'balance',
        'type',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function reconciliationItem(): HasOne
    {
        return $this->hasOne(ReconciliationItem::class);
    }
}
