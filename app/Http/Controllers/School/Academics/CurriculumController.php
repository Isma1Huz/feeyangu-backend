<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $curricula = Curriculum::where('school_id', $school->id)
            ->withCount('subjects')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'type' => $c->type,
                'description' => $c->description,
                'is_active' => $c->is_active,
                'subjects_count' => $c->subjects_count,
            ]);

        return Inertia::render('school/academics/Curricula', ['curricula' => $curricula]);
    }

    public function store(Request $request)
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'type' => 'required|in:cbc,844,cambridge',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $data['school_id'] = $school->id;
        Curriculum::create($data);

        return redirect()->back()->with('success', 'Curriculum created.');
    }

    public function update(Request $request, Curriculum $curriculum)
    {
        if ($curriculum->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'type' => 'required|in:cbc,844,cambridge',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $curriculum->update($data);

        return redirect()->back()->with('success', 'Curriculum updated.');
    }

    public function destroy(Curriculum $curriculum)
    {
        if ($curriculum->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $curriculum->delete();

        return redirect()->back()->with('success', 'Curriculum deleted.');
    }
}
