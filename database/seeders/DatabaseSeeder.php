<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            SchoolSeeder::class,
            UserSeeder::class,
            StudentSeeder::class,
            FeeStructureSeeder::class,
            AdditionalDataSeeder::class,
        ]);
    }
}
