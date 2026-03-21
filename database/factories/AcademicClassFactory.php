<?php

namespace Database\Factories;

use App\Models\AcademicClass;
use App\Models\Curriculum;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicClass>
 */
class AcademicClassFactory extends Factory
{
    protected $model = AcademicClass::class;

    public function definition(): array
    {
        return [
            'school_id'        => School::factory(),
            'name'             => fake()->randomElement(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']),
            'code'             => strtoupper(fake()->lexify('???')),
            'curriculum_id'    => null,
            'class_teacher_id' => null,
            'academic_year'    => (string) fake()->year(),
            'is_active'        => true,
        ];
    }
}
