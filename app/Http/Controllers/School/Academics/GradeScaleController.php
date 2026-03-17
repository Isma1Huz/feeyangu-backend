<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\GradeScale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GradeScaleController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $scales = GradeScale::where('school_id', $school->id)
            ->with('curriculum:id,name')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'is_default' => $s->is_default,
                'levels' => $s->levels,
                'curriculum' => $s->curriculum
                    ? ['id' => $s->curriculum->id, 'name' => $s->curriculum->name]
                    : null,
            ]);

        $curricula = Curriculum::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('school/academics/GradeScales', [
            'gradeScales' => $scales,
            'curricula' => $curricula,
        ]);
    }

    public function store(Request $request)
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'curriculum_id' => 'nullable|exists:curricula,id',
            'levels' => 'required|array',
            'levels.*.grade' => 'required|string',
            'levels.*.min' => 'required|numeric|min:0',
            'levels.*.max' => 'required|numeric|max:100',
            'is_default' => 'boolean',
        ]);

        $data['school_id'] = $school->id;

        if ($data['is_default'] ?? false) {
            GradeScale::where('school_id', $school->id)->update(['is_default' => false]);
        }

        GradeScale::create($data);

        return redirect()->back()->with('success', 'Grade scale created.');
    }

    public function update(Request $request, GradeScale $gradeScale)
    {
        if ($gradeScale->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'curriculum_id' => 'nullable|exists:curricula,id',
            'levels' => 'required|array',
            'is_default' => 'boolean',
        ]);

        if ($data['is_default'] ?? false) {
            GradeScale::where('school_id', $gradeScale->school_id)
                ->where('id', '!=', $gradeScale->id)
                ->update(['is_default' => false]);
        }

        $gradeScale->update($data);

        return redirect()->back()->with('success', 'Grade scale updated.');
    }

    public function destroy(GradeScale $gradeScale)
    {
        if ($gradeScale->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $gradeScale->delete();

        return redirect()->back()->with('success', 'Grade scale deleted.');
    }
}
