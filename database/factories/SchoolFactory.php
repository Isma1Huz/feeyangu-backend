<?php

namespace Database\Factories;

use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\School>
 */
class SchoolFactory extends Factory
{
    protected $model = School::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company() . ' Academy',
            'owner_name' => fake()->name(),
            'status' => 'active',
            'location' => fake()->city(),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function suspended(): static
    {
        return $this->state(['status' => 'suspended']);
    }
}
