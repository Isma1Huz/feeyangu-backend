<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubStrand extends Model
{
    protected $fillable = ['strand_id', 'name', 'code', 'description', 'sort_order'];

    public function strand(): BelongsTo { return $this->belongsTo(Strand::class); }
    public function learningOutcomes(): HasMany { return $this->hasMany(LearningOutcome::class); }
}
