<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningArea extends Model
{
    protected $fillable = ['curriculum_id', 'name', 'code', 'description', 'sort_order'];

    public function curriculum(): BelongsTo { return $this->belongsTo(Curriculum::class); }
    public function strands(): HasMany { return $this->hasMany(Strand::class); }
}
