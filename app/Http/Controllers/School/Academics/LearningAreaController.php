<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\LearningArea;
use App\Models\Strand;
use App\Models\SubStrand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LearningAreaController extends Controller
{
    public function index(Curriculum $curriculum)
    {
        if ($curriculum->school_id !== auth()->user()->school_id) abort(403);

        $learningAreas = LearningArea::where('curriculum_id', $curriculum->id)
            ->with(['strands.subStrands'])
            ->orderBy('sort_order')
            ->get()
            ->map(fn($la) => [
                'id' => $la->id,
                'name' => $la->name,
                'code' => $la->code,
                'description' => $la->description,
                'sort_order' => $la->sort_order,
                'strands' => $la->strands->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                    'sub_strands' => $s->subStrands->map(fn($ss) => [
                        'id' => $ss->id,
                        'name' => $ss->name,
                        'code' => $ss->code,
                    ])->all(),
                ])->all(),
            ]);

        return Inertia::render('school/academics/LearningAreas', [
            'curriculum' => [
                'id' => $curriculum->id,
                'name' => $curriculum->name,
                'type' => $curriculum->type,
            ],
            'learningAreas' => $learningAreas,
        ]);
    }

    public function store(Request $request, Curriculum $curriculum)
    {
        if ($curriculum->school_id !== auth()->user()->school_id) abort(403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $data['curriculum_id'] = $curriculum->id;
        $data['sort_order'] = LearningArea::where('curriculum_id', $curriculum->id)->max('sort_order') + 1;

        LearningArea::create($data);

        return redirect()->back()->with('success', 'Learning area created.');
    }

    public function update(Request $request, Curriculum $curriculum, LearningArea $learningArea)
    {
        if ($curriculum->school_id !== auth()->user()->school_id) abort(403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $learningArea->update($data);

        return redirect()->back()->with('success', 'Learning area updated.');
    }

    public function destroy(Curriculum $curriculum, LearningArea $learningArea)
    {
        if ($curriculum->school_id !== auth()->user()->school_id) abort(403);
        $learningArea->delete();
        return redirect()->back()->with('success', 'Learning area deleted.');
    }

    public function storeStrand(Request $request, LearningArea $learningArea)
    {
        if ($learningArea->curriculum->school_id !== auth()->user()->school_id) abort(403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
        ]);
        $data['learning_area_id'] = $learningArea->id;
        $data['sort_order'] = Strand::where('learning_area_id', $learningArea->id)->max('sort_order') + 1;
        Strand::create($data);

        return redirect()->back()->with('success', 'Strand created.');
    }
}
