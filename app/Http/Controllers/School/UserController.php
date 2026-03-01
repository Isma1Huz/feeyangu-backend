<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users in the school.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $query = $school->users()->with('roles');

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()->get()->map(function ($user) {
            return [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first() ?? 'N/A',
                'status' => $user->email_verified_at ? 'active' : 'inactive',
                'lastLogin' => $user->updated_at ? $user->updated_at->diffForHumans() : 'Never',
                'created_at' => $user->created_at->format('M d, Y'),
            ];
        });

        return Inertia::render('school/Users', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created accountant user in the school.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'school_id' => $school->id,
            'email_verified_at' => now(),
        ]);

        // School admin can only create accountants
        $user->assignRole('accountant');

        return redirect()->route('school.users.index')
            ->with('success', 'Accountant created successfully.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $school = auth()->user()->school;

        if (!$school || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'status' => 'required|in:active,inactive',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'email_verified_at' => $validated['status'] === 'active' ? ($user->email_verified_at ?? now()) : null,
        ]);

        return redirect()->route('school.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        $school = auth()->user()->school;

        if (!$school || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }

        // Prevent deleting school admins
        if ($user->hasRole('school_admin')) {
            return redirect()->route('school.users.index')
                ->with('error', 'Cannot delete school admin accounts.');
        }

        $user->delete();

        return redirect()->route('school.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
