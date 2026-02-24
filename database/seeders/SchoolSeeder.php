<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\AcademicTerm;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            [
                'name' => 'Nairobi Primary School',
                'owner_name' => 'Dr. James Mwangi',
                'location' => 'Nairobi',
                'status' => 'active',
            ],
            [
                'name' => 'Mombasa High School',
                'owner_name' => 'Mrs. Fatuma Hassan',
                'location' => 'Mombasa',
                'status' => 'active',
            ],
            [
                'name' => 'Kisumu Academy',
                'owner_name' => 'Mr. Peter Ochieng',
                'location' => 'Kisumu',
                'status' => 'active',
            ],
            [
                'name' => 'Eldoret International School',
                'owner_name' => 'Prof. David Kipchoge',
                'location' => 'Eldoret',
                'status' => 'active',
            ],
            [
                'name' => 'Nakuru Girls School',
                'owner_name' => 'Mrs. Grace Wanjiku',
                'location' => 'Nakuru',
                'status' => 'active',
            ],
        ];

        foreach ($schools as $schoolData) {
            $school = School::create($schoolData);

            $this->createGradesAndClasses($school);
            $this->createAcademicTerms($school);
        }
    }

    private function createGradesAndClasses(School $school): void
    {
        $gradeNames = ['Grade 1', 'Grade 2', 'Grade 3', 'Form 1', 'Form 2'];
        
        foreach ($gradeNames as $index => $gradeName) {
            $grade = Grade::create([
                'school_id' => $school->id,
                'name' => $gradeName,
                'sort_order' => $index + 1,
            ]);

            $classNames = ['A', 'B', 'C'];
            foreach ($classNames as $className) {
                GradeClass::create([
                    'grade_id' => $grade->id,
                    'name' => $gradeName . $className,
                    'teacher_name' => $this->generateTeacherName(),
                    'capacity' => rand(30, 40),
                ]);
            }
        }
    }

    private function createAcademicTerms(School $school): void
    {
        $terms = [
            [
                'name' => 'Term 1 2024',
                'year' => 2024,
                'start_date' => '2024-01-08',
                'end_date' => '2024-04-05',
                'status' => 'completed',
            ],
            [
                'name' => 'Term 2 2024',
                'year' => 2024,
                'start_date' => '2024-05-06',
                'end_date' => '2024-08-02',
                'status' => 'completed',
            ],
            [
                'name' => 'Term 3 2024',
                'year' => 2024,
                'start_date' => '2024-09-02',
                'end_date' => '2024-11-15',
                'status' => 'active',
            ],
        ];

        foreach ($terms as $termData) {
            AcademicTerm::create(array_merge($termData, ['school_id' => $school->id]));
        }
    }

    private function generateTeacherName(): string
    {
        $firstNames = ['John', 'Mary', 'Peter', 'Jane', 'David', 'Sarah', 'Joseph', 'Grace', 'Daniel', 'Faith'];
        $lastNames = ['Kamau', 'Wanjiru', 'Ochieng', 'Akinyi', 'Kipchoge', 'Muthoni', 'Otieno', 'Njeri', 'Mutua', 'Chebet'];
        
        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }
}
