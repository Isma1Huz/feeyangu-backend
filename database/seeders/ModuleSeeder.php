<?php

namespace Database\Seeders;

use App\Services\ModuleService;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleService::class)->registerModules();
        $this->command->info('Modules seeded successfully.');
    }
}
