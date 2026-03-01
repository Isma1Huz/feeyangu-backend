<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of all users across the platform.
     */
    public function index(Request $request): Response
    {
        $query = User::with(['school', 'roles']);

        // Filter by role if provided
        if ($request->has('role') && $request->role !== 'all') {
            $query->role($request->role);
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()
            ->paginate(20)
            ->through(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first() ?? 'N/A',
                    'school' => $user->school->name ?? 'N/A',
                    'school_id' => $user->school_id ? (string) $user->school_id : null,
                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                    'lastLogin' => $user->updated_at ? $user->updated_at->diffForHumans() : 'Never',
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        $schools = School::orderBy('name')->get()->map(fn ($s) => [
            'id' => (string) $s->id,
            'name' => $s->name,
        ]);

        return Inertia::render('admin/Users', [
            'users' => $users->items(),
            'filters' => $request->only(['role', 'search']),
            'schools' => $schools,
        ]);
    }

    /**
     * Store a newly created user (accountant/school_admin).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role' => 'required|in:accountant,school_admin,parent',
            'school_id' => 'nullable|exists:schools,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'school_id' => $validated['school_id'] ?? null,
            'email_verified_at' => now(), // Auto-verify admin-created users
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:accountant,school_admin,parent',
            'school_id' => 'nullable|exists:schools,id',
            'status' => 'required|in:active,inactive',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'school_id' => $validated['school_id'] ?? null,
            'email_verified_at' => $validated['status'] === 'active' ? ($user->email_verified_at ?? now()) : null,
        ]);

        // Sync role
        $user->syncRoles([$validated['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deleting super admins
        if ($user->hasRole('super_admin')) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Cannot delete super admin accounts.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
