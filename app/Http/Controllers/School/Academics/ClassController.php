<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Curriculum;
use App\Models\User;
use App\Services\Academics\ClassService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function __construct(private ClassService $service) {}

    public function index(): Response
    {
        $school = auth()->user()->school;

        $classes = AcademicClass::where('school_id', $school->id)
            ->with(['curriculum:id,name', 'classTeacher:id,name', 'streams'])
            ->latest()
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'code'           => $c->code,
                'academic_year'  => $c->academic_year,
                'is_active'      => $c->is_active,
                'curriculum'     => $c->curriculum ? ['id' => $c->curriculum->id, 'name' => $c->curriculum->name] : null,
                'class_teacher'  => $c->classTeacher ? ['id' => $c->classTeacher->id, 'name' => $c->classTeacher->name] : null,
                'streams_count'  => $c->streams->count(),
            ]);

        $curricula = Curriculum::where('school_id', $school->id)->active()->get(['id', 'name']);
        $teachers  = User::where('school_id', $school->id)->whereHas('roles', fn ($q) => $q->where('name', 'teacher'))->get(['id', 'name']);

        return Inertia::render('school/academics/Classes', [
            'classes'   => $classes,
            'curricula' => $curricula,
            'teachers'  => $teachers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'code'             => 'required|string|max:50',
            'curriculum_id'    => 'nullable|exists:curricula,id',
            'class_teacher_id' => 'nullable|exists:users,id',
            'academic_year'    => 'required|string|max:20',
            'is_active'        => 'boolean',
        ]);

        $data['school_id'] = $school->id;
        $this->service->createClass($data);

        return redirect()->back()->with('success', 'Class created.');
    }

    public function update(Request $request, AcademicClass $academicClass): RedirectResponse
    {
        if ($academicClass->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'code'             => 'required|string|max:50',
            'curriculum_id'    => 'nullable|exists:curricula,id',
            'class_teacher_id' => 'nullable|exists:users,id',
            'academic_year'    => 'required|string|max:20',
            'is_active'        => 'boolean',
        ]);

        $this->service->updateClass($academicClass, $data);

        return redirect()->back()->with('success', 'Class updated.');
    }

    public function destroy(AcademicClass $academicClass): RedirectResponse
    {
        if ($academicClass->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $academicClass->delete();

        return redirect()->back()->with('success', 'Class deleted.');
    }
}
