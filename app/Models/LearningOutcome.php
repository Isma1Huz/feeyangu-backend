<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningOutcome extends Model
{
    protected $fillable = ['sub_strand_id', 'name', 'code', 'description'];

    public function subStrand(): BelongsTo { return $this->belongsTo(SubStrand::class); }
}
