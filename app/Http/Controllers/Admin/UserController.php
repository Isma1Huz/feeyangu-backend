<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of all users across the platform.
     */
    public function index(Request $request): Response
    {
        $query = User::with('school');

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
                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                    'lastLogin' => $user->updated_at ? $user->updated_at->diffForHumans() : 'Never',
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('admin/Users', [
            'users' => $users->items(),
            'filters' => $request->only(['role', 'search']),
        ]);
    }
}
