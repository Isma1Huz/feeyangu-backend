<?php

namespace Database\Factories;

use App\Models\School;
use App\Models\SchoolRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolRole>
 */
class SchoolRoleFactory extends Factory
{
    protected $model = SchoolRole::class;

    public function definition(): array
    {
        return [
            'tenant_id'   => School::factory(),
            'name'        => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'is_system'   => false,
            'created_by'  => null,
        ];
    }

    public function systemRole(): static
    {
        return $this->state(['is_system' => true]);
    }

    public function forSchool(School $school): static
    {
        return $this->state(['tenant_id' => $school->id]);
    }
}
