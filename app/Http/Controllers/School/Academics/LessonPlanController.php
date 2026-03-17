<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use App\Models\AcademicSubject;
use App\Models\GradeClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonPlanController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $plans = LessonPlan::where('school_id', $school->id)
            ->with(['subject', 'gradeClass.grade'])
            ->latest('date')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'topic' => $p->topic,
                'sub_topic' => $p->sub_topic,
                'date' => $p->date?->format('Y-m-d'),
                'status' => $p->status,
                'subject' => ['id' => $p->subject->id, 'name' => $p->subject->name],
                'class' => $p->gradeClass
                    ? ['id' => $p->gradeClass->id, 'name' => $p->gradeClass->grade->name . ' ' . $p->gradeClass->name]
                    : null,
            ]);

        $subjects = AcademicSubject::where('school_id', $school->id)->get(['id', 'name']);
        $classes = GradeClass::whereHas('grade', fn($q) => $q->where('school_id', $school->id))
            ->with('grade')
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->grade->name . ' ' . $c->name]);

        return Inertia::render('school/academics/LessonPlans', [
            'lessonPlans' => $plans,
            'subjects' => $subjects,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'subject_id' => 'required|exists:academic_subjects,id',
            'grade_class_id' => 'nullable|exists:grade_classes,id',
            'topic' => 'required|string|max:255',
            'sub_topic' => 'nullable|string|max:255',
            'date' => 'required|date',
            'learning_objectives' => 'nullable|array',
            'resources' => 'nullable|array',
            'differentiation' => 'nullable|string',
        ]);

        $data['school_id'] = $school->id;
        $data['teacher_id'] = auth()->id();
        $data['status'] = 'draft';

        LessonPlan::create($data);

        return redirect()->back()->with('success', 'Lesson plan created.');
    }

    public function update(Request $request, LessonPlan $lessonPlan)
    {
        if ($lessonPlan->school_id !== auth()->user()->school_id) abort(403);

        $data = $request->validate([
            'topic' => 'required|string|max:255',
            'sub_topic' => 'nullable|string|max:255',
            'date' => 'required|date',
            'subject_id' => 'required|exists:academic_subjects,id',
            'grade_class_id' => 'nullable|exists:grade_classes,id',
            'status' => 'in:draft,published',
            'differentiation' => 'nullable|string',
            'reflection' => 'nullable|string',
        ]);

        $lessonPlan->update($data);

        return redirect()->back()->with('success', 'Lesson plan updated.');
    }

    public function destroy(LessonPlan $lessonPlan)
    {
        if ($lessonPlan->school_id !== auth()->user()->school_id) abort(403);
        $lessonPlan->delete();
        return redirect()->back()->with('success', 'Lesson plan deleted.');
    }
}
