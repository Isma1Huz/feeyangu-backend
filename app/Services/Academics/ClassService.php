<?php

namespace App\Services\Academics;

use App\Models\AcademicClass;
use Illuminate\Support\Facades\DB;

class ClassService
{
    public function createClass(array $data): AcademicClass
    {
        return DB::transaction(function () use ($data) {
            $class = AcademicClass::create([
                'school_id'        => auth()->user()->school_id,
                'name'             => $data['name'],
                'code'             => $data['code'],
                'curriculum_id'    => $data['curriculum_id'] ?? null,
                'class_teacher_id' => $data['class_teacher_id'] ?? null,
                'academic_year'    => $data['academic_year'],
                'is_active'        => $data['is_active'] ?? true,
            ]);

            if (!empty($data['streams'])) {
                foreach ($data['streams'] as $stream) {
                    $class->streams()->create($stream);
                }
            }

            return $class;
        });
    }

    public function updateClass(AcademicClass $class, array $data): AcademicClass
    {
        $class->update([
            'name'             => $data['name'],
            'code'             => $data['code'],
            'curriculum_id'    => $data['curriculum_id'] ?? null,
            'class_teacher_id' => $data['class_teacher_id'] ?? null,
            'academic_year'    => $data['academic_year'],
            'is_active'        => $data['is_active'] ?? $class->is_active,
        ]);

        return $class->fresh();
    }
}
