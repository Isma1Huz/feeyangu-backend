<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SettingsController extends Controller
{
    /**
     * Display the platform settings.
     */
    public function index(): Response
    {
        // In a real implementation, these would come from a settings table or config
        $settings = [
            'platformName' => config('app.name', 'Feeyangu'),
            'supportEmail' => config('mail.from.address', 'support@feeyangu.com'),
            'currency' => 'KES',
            'maintenance' => config('app.maintenance', false),
            'emailNotifications' => true,
            'smsNotifications' => false,
            'paymentAlerts' => true,
            'overdueReminders' => true,
        ];

        return Inertia::render('admin/Settings', $settings);
    }

    /**
     * Update the platform settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platformName' => 'nullable|string|max:255',
            'supportEmail' => 'nullable|email|max:255',
            'currency' => 'nullable|string|max:10',
            'maintenance' => 'nullable|boolean',
            'emailNotifications' => 'nullable|boolean',
            'smsNotifications' => 'nullable|boolean',
            'paymentAlerts' => 'nullable|boolean',
            'overdueReminders' => 'nullable|boolean',
        ]);

        // In a real implementation, save these to a settings table or update config
        // For now, just return success

        return redirect()->route('admin.settings.index')
            ->with('success', 'Settings updated successfully.');
    }
}
