<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\School;
use App\Models\User;
use App\Models\StudentHealthProfile;
use App\Models\EmergencyContact;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    private $studentNames = [
        ['Brian', 'Kariuki'],
        ['Nancy', 'Wambui'],
        ['Kevin', 'Otieno'],
        ['Lucy', 'Auma'],
        ['Michael', 'Omondi'],
        ['Esther', 'Wangari'],
        ['Felix', 'Kiprop'],
        ['Sharon', 'Achieng'],
    ];

    private $bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    private $relationships = ['Mother', 'Father', 'Guardian', 'Uncle', 'Aunt', 'Grandmother', 'Grandfather'];

    public function run(): void
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $parents = User::role('parent')->where('school_id', $school->id)->get();
            $grades = $school->grades()->with('gradeClasses')->get();
            
            for ($i = 0; $i < 8; $i++) {
                $studentName = $this->studentNames[$i];
                $grade = $grades->random();
                $class = $grade->gradeClasses->random();
                
                $student = Student::create([
                    'school_id' => $school->id,
                    'admission_number' => 'ADM2024' . str_pad(($school->id * 100) + $i + 1, 3, '0', STR_PAD_LEFT),
                    'first_name' => $studentName[0],
                    'last_name' => $studentName[1],
                    'grade_id' => $grade->id,
                    'class_id' => $class->id,
                    'status' => 'active',
                ]);

                $assignedParents = $parents->random(rand(1, 2));
                $student->parents()->attach($assignedParents->pluck('id'));

                StudentHealthProfile::create([
                    'student_id' => $student->id,
                    'blood_type' => $this->bloodTypes[array_rand($this->bloodTypes)],
                    'height' => rand(120, 160),
                    'weight' => rand(30, 60),
                    'vision_notes' => rand(0, 1) ? 'Normal vision' : 'Wears glasses',
                    'hearing_notes' => 'Normal',
                    'general_health_status' => 'Good',
                ]);

                for ($j = 0; $j < rand(1, 2); $j++) {
                    EmergencyContact::create([
                        'student_id' => $student->id,
                        'full_name' => $this->generateContactName(),
                        'relationship' => $this->relationships[array_rand($this->relationships)],
                        'primary_phone' => '+2547' . rand(10000000, 99999999),
                        'secondary_phone' => rand(0, 1) ? '+2547' . rand(10000000, 99999999) : null,
                        'priority' => $j + 1,
                        'notes' => 'Available 24/7',
                    ]);
                }
            }
        }
    }

    private function generateContactName(): string
    {
        $firstNames = ['John', 'Mary', 'Peter', 'Jane', 'David', 'Sarah', 'Joseph', 'Grace', 'Daniel', 'Faith'];
        $lastNames = ['Kamau', 'Wanjiru', 'Ochieng', 'Akinyi', 'Kipchoge', 'Muthoni', 'Otieno', 'Njeri', 'Mutua', 'Chebet'];
        
        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }
}
