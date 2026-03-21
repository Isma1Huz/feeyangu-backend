<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpesaTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'mpesa_receipt',
        'phone_number',
        'transaction_date',
        'amount',
        'account_reference',
        'transaction_desc',
        'result_code',
        'result_desc',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'datetime',
            'amount'           => 'decimal:2',
            'raw_response'     => 'array',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'payment_id');
    }
}
