<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FeeStructure>
 */
class FeeStructureFactory extends Factory
{
    protected $model = FeeStructure::class;

    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'name' => fake()->randomElement(['Tuition Fees', 'School Fees', 'Term Fees']) . ' - ' . fake()->year(),
            'grade_id' => Grade::factory(),
            'term_id' => AcademicTerm::factory(),
            'total_amount' => fake()->numberBetween(10000, 100000) * 100, // in cents
            'status' => fake()->randomElement(['active', 'inactive']),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}
