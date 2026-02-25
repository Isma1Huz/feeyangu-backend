<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SchoolController extends Controller
{
    /**
     * Display a listing of schools.
     */
    public function index(Request $request): Response
    {
        $query = School::query();

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by name or location
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%")
                  ->orWhere('owner_name', 'like', "%{$request->search}%");
            });
        }

        // Order by most recent first
        $schools = $query->withCount(['students', 'users'])
            ->latest()
            ->paginate(15)
            ->through(function ($school) {
                return [
                    'id' => (string) $school->id,
                    'name' => $school->name,
                    'owner' => $school->owner_name ?? 'N/A',
                    'location' => $school->location ?? 'N/A',
                    'status' => $school->status,
                    'logo' => $school->logo,
                    'studentCount' => $school->students_count,
                    'feesCollected' => \App\Models\PaymentTransaction::where('school_id', $school->id)
                        ->where('status', 'completed')
                        ->sum('amount') / 100, // Convert cents to KES
                    'created_at' => $school->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('admin/Schools', [
            'schools' => $schools->items(), // Get just the data array, not pagination object
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new school.
     */
    public function create(): Response
    {
        return Inertia::render('admin/SchoolCreate');
    }

    /**
     * Store a newly created school in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'logo' => 'nullable|string|max:500',
            'status' => 'required|in:active,pending,suspended',
        ]);

        $school = School::create($validated);

        return redirect()->route('admin.schools.show', $school)
            ->with('success', 'School created successfully.');
    }

    /**
     * Display the specified school.
     */
    public function show(School $school): Response
    {
        $school->load([
            'students' => function ($query) {
                $query->latest()->take(10);
            },
            'users' => function ($query) {
                $query->latest()->take(10);
            },
            'grades',
            'academicTerms',
        ]);

        $statistics = [
            'total_students' => $school->students()->count(),
            'active_students' => $school->students()->where('status', 'active')->count(),
            'total_users' => $school->users()->count(),
            'total_grades' => $school->grades()->count(),
            'total_revenue' => $school->paymentTransactions()
                ->where('status', 'completed')
                ->sum('amount') / 100,
        ];

        return Inertia::render('admin/SchoolShow', [
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
                'owner_name' => $school->owner_name,
                'location' => $school->location,
                'status' => $school->status,
                'logo' => $school->logo,
                'created_at' => $school->created_at->format('M d, Y'),
                'updated_at' => $school->updated_at->format('M d, Y'),
            ],
            'statistics' => $statistics,
            'recentStudents' => $school->students->map(function ($student) {
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'admission_number' => $student->admission_number,
                    'status' => $student->status,
                ];
            }),
            'recentUsers' => $school->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                ];
            }),
        ]);
    }

    /**
     * Show the form for editing the specified school.
     */
    public function edit(School $school): Response
    {
        return Inertia::render('admin/SchoolEdit', [
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
                'owner_name' => $school->owner_name,
                'location' => $school->location,
                'status' => $school->status,
                'logo' => $school->logo,
            ],
        ]);
    }

    /**
     * Update the specified school in storage.
     */
    public function update(Request $request, School $school): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'logo' => 'nullable|string|max:500',
            'status' => 'required|in:active,pending,suspended',
        ]);

        $school->update($validated);

        return redirect()->route('admin.schools.show', $school)
            ->with('success', 'School updated successfully.');
    }

    /**
     * Remove the specified school from storage.
     */
    public function destroy(School $school): RedirectResponse
    {
        $school->delete();

        return redirect()->route('admin.schools.index')
            ->with('success', 'School deleted successfully.');
    }
}
