<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SettingsController extends Controller
{
    /**
     * Display the school settings page.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        return Inertia::render('school/Settings', [
            'school' => [
                'name' => $school->name,
                'motto' => $school->motto ?? '',
                'location' => $school->location ?? '',
                'email' => $school->email ?? '',
                'phone' => $school->phone ?? '',
                'primaryColor' => $school->primary_color ?? '#8B0000',
                'secondaryColor' => $school->secondary_color ?? '#FFD700',
            ],
        ]);
    }

    /**
     * Update the school settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'motto' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'primary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $school->update($validated);

        return redirect()->route('school.settings.index')
            ->with('success', 'Settings updated successfully.');
    }
}
