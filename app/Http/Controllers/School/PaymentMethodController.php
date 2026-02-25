<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    /**
     * Display the payment methods configuration page.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Mock payment configurations - in production, this would come from a database table
        // For now, return default providers that need configuration
        $paymentConfigs = [
            [
                'id' => 'spc_1',
                'provider' => 'mpesa',
                'enabled' => true,
                'accountNumber' => '247247',
                'accountName' => $school->name,
                'paybillNumber' => '247247',
                'order' => 1,
            ],
            [
                'id' => 'spc_2',
                'provider' => 'airtel_money',
                'enabled' => false,
                'accountNumber' => '',
                'accountName' => '',
                'order' => 2,
            ],
            [
                'id' => 'spc_3',
                'provider' => 'equity_bank',
                'enabled' => false,
                'accountNumber' => '',
                'accountName' => '',
                'order' => 3,
            ],
        ];

        return Inertia::render('school/PaymentMethods', [
            'paymentConfigs' => $paymentConfigs,
        ]);
    }
}
