<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'             => 'Basic',
                'code'             => 'basic',
                'description'      => 'Perfect for small schools getting started with digital management.',
                'price_monthly'    => 5000.00,
                'price_yearly'     => 50000.00,
                'student_limit'    => 200,
                'staff_limit'      => 20,
                'storage_limit_mb' => 2048,
                'features'         => [
                    'Core management',
                    'Academic records',
                    'Attendance tracking',
                    'Parent communication',
                ],
                'is_active'  => true,
                'sort_order' => 1,
            ],
            [
                'name'             => 'Standard',
                'code'             => 'standard',
                'description'      => 'Ideal for growing schools that need finance and parent portal features.',
                'price_monthly'    => 12000.00,
                'price_yearly'     => 120000.00,
                'student_limit'    => 500,
                'staff_limit'      => 50,
                'storage_limit_mb' => 10240,
                'features'         => [
                    'Everything in Basic',
                    'Finance module',
                    'Parent portal',
                    'Extended communication tools',
                ],
                'is_active'  => true,
                'sort_order' => 2,
            ],
            [
                'name'             => 'Premium',
                'code'             => 'premium',
                'description'      => 'For established schools needing transport, store, and NEMIS integration.',
                'price_monthly'    => 25000.00,
                'price_yearly'     => 250000.00,
                'student_limit'    => 1000,
                'staff_limit'      => 100,
                'storage_limit_mb' => 51200,
                'features'         => [
                    'Everything in Standard',
                    'Transport management',
                    'Store & inventory',
                    'NEMIS integration',
                    'Student portal',
                ],
                'is_active'  => true,
                'sort_order' => 3,
            ],
            [
                'name'             => 'Enterprise',
                'code'             => 'enterprise',
                'description'      => 'Unlimited access to all modules for large institutions.',
                'price_monthly'    => 45000.00,
                'price_yearly'     => 450000.00,
                'student_limit'    => 0, // unlimited
                'staff_limit'      => 0, // unlimited
                'storage_limit_mb' => 0, // unlimited
                'features'         => [
                    'All modules included',
                    'Unlimited students & staff',
                    'Unlimited storage',
                    'Priority support',
                    'Custom integrations',
                ],
                'is_active'  => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::updateOrCreate(['code' => $planData['code']], $planData);
        }

        // Map modules to plans
        $this->attachPlanModules();
    }

    private function attachPlanModules(): void
    {
        $basic      = SubscriptionPlan::where('code', 'basic')->first();
        $standard   = SubscriptionPlan::where('code', 'standard')->first();
        $premium    = SubscriptionPlan::where('code', 'premium')->first();
        $enterprise = SubscriptionPlan::where('code', 'enterprise')->first();

        if (!$basic || !$standard || !$premium || !$enterprise) {
            return;
        }

        // Basic plan modules
        $basicModuleKeys = ['academics', 'finance', 'attendance', 'communication'];

        // Standard adds on top of Basic
        $standardModuleKeys = array_merge($basicModuleKeys, ['parent_portal']);

        // Premium adds on top of Standard
        $premiumModuleKeys = array_merge($standardModuleKeys, ['transport', 'store', 'nemis', 'student_portal']);

        // Enterprise gets everything
        $allModuleKeys = Module::active()->pluck('key')->toArray();

        $this->syncPlanModules($basic, $basicModuleKeys);
        $this->syncPlanModules($standard, $standardModuleKeys);
        $this->syncPlanModules($premium, $premiumModuleKeys);
        $this->syncPlanModules($enterprise, $allModuleKeys);
    }

    private function syncPlanModules(SubscriptionPlan $plan, array $moduleKeys): void
    {
        $modules = Module::whereIn('key', $moduleKeys)->get();

        $syncData = [];
        foreach ($modules as $module) {
            $syncData[$module->id] = ['is_included' => true];
        }

        $plan->modules()->sync($syncData);
    }
}
