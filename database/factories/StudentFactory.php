<?php

namespace Database\Factories;

use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'admission_number' => fake()->unique()->numerify('ADM-####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'grade_id' => Grade::factory(),
            'class_id' => GradeClass::factory(),
            'status' => 'active',
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
