<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeStructure extends Model
{
    use HasFactory;
    protected $fillable = [
        'school_id',
        'name',
        'grade_id',
        'term_id',
        'total_amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class, 'term_id');
    }

    public function feeItems(): HasMany
    {
        return $this->hasMany(FeeItem::class);
    }
}
