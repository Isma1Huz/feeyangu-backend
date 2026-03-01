<?php

namespace Database\Factories;

use App\Models\Grade;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Grade>
 */
class GradeFactory extends Factory
{
    protected $model = Grade::class;

    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'name' => 'Grade ' . fake()->unique()->numberBetween(1, 100),
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
