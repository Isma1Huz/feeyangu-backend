<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
{
    /**
     * Display the integrations management page.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Mock integrations data - in production, this would come from a database table
        $integrations = [
            [
                'id' => 1,
                'provider' => 'xero',
                'status' => 'connected',
                'lastSyncedAt' => now()->subHours(2)->toISOString(),
                'syncFrequency' => 'daily',
                'itemsSynced' => 1247,
                'syncErrors' => 0,
            ],
            [
                'id' => 2,
                'provider' => 'quickbooks',
                'status' => 'disconnected',
                'lastSyncedAt' => null,
                'syncFrequency' => null,
                'itemsSynced' => 0,
                'syncErrors' => 0,
            ],
        ];

        return Inertia::render('accountant/Integrations', [
            'integrations' => $integrations,
        ]);
    }
}
