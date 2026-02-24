<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthDocument extends Model
{
    protected $fillable = [
        'student_id',
        'type',
        'title',
        'description',
        'file_url',
        'upload_date',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'upload_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
