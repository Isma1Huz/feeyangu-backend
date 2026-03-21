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
use Spatie\Permission\Models\Role;

class StaffManagementController extends Controller
{
    private const ALLOWED_ROLES = ['accountant', 'teacher', 'deputy_principal', 'librarian', 'nurse', 'driver'];

    /**
     * Display a listing of staff users in the school.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;

        abort_unless($school, 403, 'No school assigned to user.');

        $query = $school->users()->with('roles');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $request->role));
        }

        $staff = $query->latest()->get()->map(fn ($user) => [
            'id'         => (string) $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->getRoleNames()->first() ?? 'N/A',
            'status'     => $user->email_verified_at ? 'active' : 'inactive',
            'lastLogin'  => $user->updated_at?->diffForHumans() ?? 'Never',
            'created_at' => $user->created_at->format('M d, Y'),
        ]);

        $availableRoles = Role::whereIn('name', self::ALLOWED_ROLES)->orderBy('name')->pluck('name');

        return Inertia::render('school/StaffManagement/Index', compact('staff', 'availableRoles'));
    }

    /**
     * Show form to add a new staff member.
     */
    public function create(): Response
    {
        $availableRoles = Role::whereIn('name', self::ALLOWED_ROLES)->orderBy('name')->pluck('name');

        return Inertia::render('school/StaffManagement/Create', compact('availableRoles'));
    }

    /**
     * Store a new staff member.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;
        abort_unless($school, 403, 'No school assigned to user.');

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'role'     => 'required|in:' . implode(',', self::ALLOWED_ROLES),
            'password' => ['required', Password::defaults()],
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'school_id' => $school->id,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('school.staff.index')
            ->with('success', 'Staff member added successfully.');
    }

    /**
     * Show a specific staff member.
     */
    public function show(int $id): Response
    {
        $school = auth()->user()->school;
        $user   = $school->users()->with('roles')->findOrFail($id);

        return Inertia::render('school/StaffManagement/Show', compact('user'));
    }

    /**
     * Show edit form for a staff member.
     */
    public function edit(int $id): Response
    {
        $school         = auth()->user()->school;
        $user           = $school->users()->with('roles')->findOrFail($id);
        $availableRoles = Role::whereIn('name', self::ALLOWED_ROLES)->orderBy('name')->pluck('name');

        return Inertia::render('school/StaffManagement/Edit', compact('user', 'availableRoles'));
    }

    /**
     * Update a staff member's details.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $user   = $school->users()->findOrFail($id);

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$id}",
            'role'  => 'required|in:' . implode(',', self::ALLOWED_ROLES),
        ]);

        $user->update(['name' => $validated['name'], 'email' => $validated['email']]);
        $user->syncRoles([$validated['role']]);

        return redirect()->route('school.staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    /**
     * Remove a staff member.
     */
    public function destroy(int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $user   = $school->users()->findOrFail($id);

        $user->delete();

        return redirect()->route('school.staff.index')
            ->with('success', 'Staff member removed.');
    }
}
