<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\DashboardConfig;
use App\Models\User;
use App\Models\UserDashboardOverride;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardConfigController extends Controller
{
    private const USER_TYPES = ['parent', 'student', 'teacher', 'staff', 'principal'];

    /**
     * Default dashboard config keys and their default visibility values.
     */
    private const DEFAULT_CONFIGS = [
        'show_fee_balance'       => true,
        'show_attendance_summary' => true,
        'show_academic_results'  => true,
        'show_upcoming_events'   => true,
        'show_notifications'     => true,
        'show_payment_history'   => true,
        'show_timetable'         => true,
        'show_homework'          => false,
        'show_health_summary'    => false,
        'show_transport_info'    => false,
    ];

    /**
     * Show configuration grid for all user types.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        $configs = [];
        foreach (self::USER_TYPES as $userType) {
            $existing = DashboardConfig::where('tenant_id', $school->id)
                ->where('user_type', $userType)
                ->pluck('config_value', 'config_key')
                ->toArray();

            $merged = [];
            foreach (self::DEFAULT_CONFIGS as $key => $default) {
                $merged[$key] = $existing[$key] ?? $default;
            }

            $configs[$userType] = $merged;
        }

        return Inertia::render('school/settings/DashboardVisibility', [
            'configs'         => $configs,
            'userTypes'       => self::USER_TYPES,
            'availableWidgets' => array_keys(self::DEFAULT_CONFIGS),
        ]);
    }

    /**
     * Update visibility settings for a specific user type.
     */
    public function updateForUserType(Request $request, string $userType): RedirectResponse
    {
        if (!in_array($userType, self::USER_TYPES, true)) {
            abort(422, 'Invalid user type.');
        }

        $school = auth()->user()->school;

        $validated = $request->validate([
            'config' => 'required|array',
        ]);

        foreach ($validated['config'] as $key => $value) {
            if (!array_key_exists($key, self::DEFAULT_CONFIGS)) {
                continue;
            }

            DashboardConfig::updateOrCreate(
                [
                    'tenant_id' => $school->id,
                    'user_type' => $userType,
                    'config_key' => $key,
                ],
                [
                    'config_value' => (bool) $value,
                    'created_by'   => auth()->id(),
                ]
            );
        }

        return back()->with('success', "Dashboard settings updated for {$userType}s.");
    }

    /**
     * Set an individual user override for a dashboard widget.
     */
    public function overrideForUser(Request $request, int $userId): RedirectResponse
    {
        $school = auth()->user()->school;
        $user   = User::where('school_id', $school->id)->findOrFail($userId);

        $validated = $request->validate([
            'config_key'   => 'required|string',
            'config_value' => 'required|boolean',
        ]);

        UserDashboardOverride::updateOrCreate(
            ['user_id' => $userId, 'config_key' => $validated['config_key']],
            ['config_value' => $validated['config_value']]
        );

        return back()->with('success', "Override set for {$user->name}.");
    }

    /**
     * Reset all overrides for a user type to school defaults.
     */
    public function resetToDefault(string $userType): RedirectResponse
    {
        if (!in_array($userType, self::USER_TYPES, true)) {
            abort(422, 'Invalid user type.');
        }

        $school = auth()->user()->school;

        DashboardConfig::where('tenant_id', $school->id)
            ->where('user_type', $userType)
            ->delete();

        return back()->with('success', "Dashboard settings for {$userType}s reset to defaults.");
    }
}
