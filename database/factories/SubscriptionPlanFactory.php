<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    public function definition(): array
    {
        return [
            'name'             => fake()->words(2, true) . ' Plan',
            'code'             => fake()->unique()->slug(2),
            'description'      => fake()->sentence(),
            'price_monthly'    => fake()->randomElement([5000, 10000, 15000, 25000]),
            'price_yearly'     => fake()->randomElement([50000, 100000, 150000, 250000]),
            'student_limit'    => fake()->randomElement([100, 200, 500, 0]),
            'staff_limit'      => fake()->randomElement([10, 20, 50, 0]),
            'storage_limit_mb' => fake()->randomElement([1024, 5120, 10240, 0]),
            'features'         => ['Feature A', 'Feature B'],
            'is_active'        => true,
            'sort_order'       => fake()->numberBetween(1, 10),
        ];
    }

    public function active(): static
    {
        return $this->state(['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function unlimited(): static
    {
        return $this->state([
            'student_limit'    => 0,
            'staff_limit'      => 0,
            'storage_limit_mb' => 0,
        ]);
    }
}
