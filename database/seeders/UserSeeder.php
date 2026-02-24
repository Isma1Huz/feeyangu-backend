<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\School;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    private $parentNames = [
        ['John Kamau', 'john.kamau@example.com', '+254712345001'],
        ['Mary Wanjiru', 'mary.wanjiru@example.com', '+254723456001'],
        ['Peter Ochieng', 'peter.ochieng@example.com', '+254734567001'],
        ['Jane Akinyi', 'jane.akinyi@example.com', '+254745678001'],
        ['David Kipchoge', 'david.kipchoge@example.com', '+254756789001'],
        ['Sarah Muthoni', 'sarah.muthoni@example.com', '+254767890001'],
        ['Joseph Otieno', 'joseph.otieno@example.com', '+254778901001'],
        ['Grace Njeri', 'grace.njeri@example.com', '+254789012001'],
        ['Daniel Mutua', 'daniel.mutua@example.com', '+254790123001'],
        ['Faith Chebet', 'faith.chebet@example.com', '+254701234001'],
    ];

    public function run(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@feeyangu.com',
            'password' => Hash::make('password'),
            'phone' => '+254700000000',
        ]);
        $superAdmin->assignRole('super_admin');

        $schools = School::all();
        
        foreach ($schools as $index => $school) {
            $schoolAdmin = User::create([
                'name' => 'Admin ' . $school->name,
                'email' => 'admin' . ($index + 1) . '@school.com',
                'password' => Hash::make('password'),
                'phone' => '+254711' . str_pad($index + 1, 6, '0', STR_PAD_LEFT),
                'school_id' => $school->id,
            ]);
            $schoolAdmin->assignRole('school_admin');

            $accountant = User::create([
                'name' => 'Accountant ' . $school->name,
                'email' => 'accountant' . ($index + 1) . '@school.com',
                'password' => Hash::make('password'),
                'phone' => '+254722' . str_pad($index + 1, 6, '0', STR_PAD_LEFT),
                'school_id' => $school->id,
            ]);
            $accountant->assignRole('accountant');

            for ($i = 0; $i < 8; $i++) {
                $parentData = $this->parentNames[$i];
                $parent = User::create([
                    'name' => $parentData[0],
                    'email' => str_replace('@example.com', ($index + 1) . '@example.com', $parentData[1]),
                    'password' => Hash::make('password'),
                    'phone' => str_replace('001', sprintf('%03d', $index + 1), $parentData[2]),
                    'school_id' => $school->id,
                ]);
                $parent->assignRole('parent');
            }
        }
    }
}
