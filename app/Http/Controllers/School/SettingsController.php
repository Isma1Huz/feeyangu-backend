<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

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
                'logoUrl' => $school->logo ? Storage::disk('public')->url($school->logo) : null,
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

    /**
     * Upload the school logo.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        // Delete old logo if exists
        if ($school->logo && Storage::disk('public')->exists($school->logo)) {
            Storage::disk('public')->delete($school->logo);
        }

        $path = $request->file('logo')->store('logos', 'public');

        $school->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo uploaded successfully.',
            'logoUrl' => Storage::disk('public')->url($path),
        ]);
    }
}
