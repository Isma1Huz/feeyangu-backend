<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Display the platform billing page.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Mock data for now - in production, this would come from a subscription management system
        $currentPlan = 'standard';
        $nextBillingDate = now()->addMonth()->format('M d, Y');
        
        // Mock payment history
        $paymentHistory = [
            [
                'id' => 1,
                'date' => now()->subMonth()->format('M d, Y'),
                'amount' => 5000,
                'method' => 'M-Pesa',
                'status' => 'completed',
                'reference' => 'SUB' . strtoupper(substr(md5(rand()), 0, 10)),
            ],
            [
                'id' => 2,
                'date' => now()->subMonths(2)->format('M d, Y'),
                'amount' => 5000,
                'method' => 'M-Pesa',
                'status' => 'completed',
                'reference' => 'SUB' . strtoupper(substr(md5(rand()), 0, 10)),
            ],
            [
                'id' => 3,
                'date' => now()->subMonths(3)->format('M d, Y'),
                'amount' => 5000,
                'method' => 'Bank Transfer',
                'status' => 'completed',
                'reference' => 'SUB' . strtoupper(substr(md5(rand()), 0, 10)),
            ],
        ];

        return Inertia::render('school/PlatformBilling', [
            'currentPlan' => $currentPlan,
            'nextBillingDate' => $nextBillingDate,
            'paymentHistory' => $paymentHistory,
        ]);
    }
}
