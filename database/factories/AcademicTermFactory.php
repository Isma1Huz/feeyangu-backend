<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicTerm>
 */
class AcademicTermFactory extends Factory
{
    protected $model = AcademicTerm::class;

    public function definition(): array
    {
        $year = fake()->numberBetween(2024, 2026);
        $termNumber = fake()->numberBetween(1, 3);

        return [
            'school_id' => School::factory(),
            'name' => 'Term ' . $termNumber,
            'year' => $year,
            'start_date' => "{$year}-01-01",
            'end_date' => "{$year}-04-30",
            'status' => fake()->randomElement(['active', 'upcoming', 'completed']),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    public function upcoming(): static
    {
        return $this->state(['status' => 'upcoming']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }
}
