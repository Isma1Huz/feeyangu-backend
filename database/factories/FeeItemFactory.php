<?php

namespace Database\Factories;

use App\Models\FeeItem;
use App\Models\FeeStructure;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FeeItem>
 */
class FeeItemFactory extends Factory
{
    protected $model = FeeItem::class;

    public function definition(): array
    {
        return [
            'fee_structure_id' => FeeStructure::factory(),
            'name' => fake()->randomElement(['Tuition', 'Activity Fee', 'Library Fee', 'Sports Fee', 'Lab Fee']),
            'amount' => fake()->numberBetween(1000, 50000) * 100, // in cents
        ];
    }
}
