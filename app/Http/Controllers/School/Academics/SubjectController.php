<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicSubject;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $subjects = AcademicSubject::where('school_id', $school->id)
            ->with('curriculum:id,name')
            ->latest()
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'is_core' => $s->is_core,
                'credits' => $s->credits,
                'description' => $s->description,
                'curriculum' => $s->curriculum
                    ? ['id' => $s->curriculum->id, 'name' => $s->curriculum->name]
                    : null,
            ]);

        $curricula = Curriculum::where('school_id', $school->id)->active()->get(['id', 'name']);

        return Inertia::render('school/academics/Subjects', [
            'subjects' => $subjects,
            'curricula' => $curricula,
        ]);
    }

    public function store(Request $request)
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'curriculum_id' => 'nullable|exists:curricula,id',
            'is_core' => 'boolean',
            'credits' => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        $data['school_id'] = $school->id;
        AcademicSubject::create($data);

        return redirect()->back()->with('success', 'Subject created.');
    }

    public function update(Request $request, AcademicSubject $subject)
    {
        if ($subject->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'curriculum_id' => 'nullable|exists:curricula,id',
            'is_core' => 'boolean',
            'credits' => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        $subject->update($data);

        return redirect()->back()->with('success', 'Subject updated.');
    }

    public function destroy(AcademicSubject $subject)
    {
        if ($subject->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted.');
    }
}
