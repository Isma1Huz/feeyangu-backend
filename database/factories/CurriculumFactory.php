<?php

namespace Database\Factories;

use App\Models\Curriculum;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Curriculum>
 */
class CurriculumFactory extends Factory
{
    protected $model = Curriculum::class;

    public function definition(): array
    {
        return [
            'school_id'   => School::factory(),
            'name'        => fake()->randomElement(['CBC Curriculum', '8-4-4 Curriculum', 'Cambridge Curriculum']),
            'code'        => strtoupper(fake()->unique()->lexify('???-####')),
            'type'        => fake()->randomElement(['cbc', '844', 'cambridge']),
            'description' => fake()->optional()->sentence(),
            'is_active'   => true,
        ];
    }
}
