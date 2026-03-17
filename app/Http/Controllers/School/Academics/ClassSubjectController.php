<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\GradeClass;
use App\Models\AcademicSubject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassSubjectController extends Controller
{
    public function index(GradeClass $gradeClass)
    {
        if ($gradeClass->grade->school_id !== auth()->user()->school_id) abort(403);

        $classSubjects = ClassSubject::where('grade_class_id', $gradeClass->id)
            ->with(['subject', 'teacher'])
            ->get()
            ->map(fn($cs) => [
                'id' => $cs->id,
                'subject' => ['id' => $cs->subject->id, 'name' => $cs->subject->name, 'code' => $cs->subject->code],
                'teacher' => $cs->teacher ? ['id' => $cs->teacher->id, 'name' => $cs->teacher->name] : null,
                'periods_per_week' => $cs->periods_per_week,
            ]);

        $school = auth()->user()->school;
        $availableSubjects = AcademicSubject::where('school_id', $school->id)->get(['id', 'name', 'code']);
        $teachers = User::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('school/academics/ClassSubjects', [
            'gradeClass' => [
                'id' => $gradeClass->id,
                'name' => $gradeClass->name,
                'grade' => ['id' => $gradeClass->grade->id, 'name' => $gradeClass->grade->name],
            ],
            'classSubjects' => $classSubjects,
            'availableSubjects' => $availableSubjects,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request, GradeClass $gradeClass)
    {
        if ($gradeClass->grade->school_id !== auth()->user()->school_id) abort(403);

        $data = $request->validate([
            'subject_id' => 'required|exists:academic_subjects,id',
            'teacher_id' => 'nullable|exists:users,id',
            'periods_per_week' => 'integer|min:0|max:30',
        ]);
        $data['grade_class_id'] = $gradeClass->id;

        ClassSubject::updateOrCreate(
            ['grade_class_id' => $gradeClass->id, 'subject_id' => $data['subject_id']],
            ['teacher_id' => $data['teacher_id'] ?? null, 'periods_per_week' => $data['periods_per_week'] ?? 0]
        );

        return redirect()->back()->with('success', 'Subject assigned to class.');
    }

    public function update(Request $request, GradeClass $gradeClass, ClassSubject $classSubject)
    {
        if ($gradeClass->grade->school_id !== auth()->user()->school_id) abort(403);

        $data = $request->validate([
            'teacher_id' => 'nullable|exists:users,id',
            'periods_per_week' => 'integer|min:0|max:30',
        ]);

        $classSubject->update($data);
        return redirect()->back()->with('success', 'Class subject updated.');
    }

    public function destroy(GradeClass $gradeClass, ClassSubject $classSubject)
    {
        if ($gradeClass->grade->school_id !== auth()->user()->school_id) abort(403);
        $classSubject->delete();
        return redirect()->back()->with('success', 'Subject removed from class.');
    }
}
