<?php

namespace Database\Factories;

use App\Models\Grade;
use App\Models\GradeClass;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GradeClass>
 */
class GradeClassFactory extends Factory
{
    protected $model = GradeClass::class;

    public function definition(): array
    {
        return [
            'grade_id' => Grade::factory(),
            'name' => fake()->randomElement(['A', 'B', 'C', 'D']),
            'teacher_name' => fake()->name(),
            'capacity' => fake()->numberBetween(20, 50),
        ];
    }
}
