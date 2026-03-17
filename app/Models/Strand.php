<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Strand extends Model
{
    protected $fillable = ['learning_area_id', 'name', 'code', 'description', 'sort_order'];

    public function learningArea(): BelongsTo { return $this->belongsTo(LearningArea::class); }
    public function subStrands(): HasMany { return $this->hasMany(SubStrand::class); }
}
