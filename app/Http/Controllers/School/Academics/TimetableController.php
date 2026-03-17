<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicSubject;
use App\Models\GradeClass;
use App\Models\TimetableEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimetableController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $entries = TimetableEntry::where('school_id', $school->id)
            ->with(['gradeClass.grade', 'subject', 'teacher'])
            ->where(function ($q) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now());
            })
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'day_of_week' => $e->day_of_week,
                'time_slot' => $e->time_slot,
                'duration' => $e->duration,
                'room' => $e->room,
                'class' => $e->gradeClass
                    ? ['id' => $e->gradeClass->id, 'name' => $e->gradeClass->name]
                    : null,
                'subject' => ['id' => $e->subject->id, 'name' => $e->subject->name],
                'teacher' => $e->teacher
                    ? ['id' => $e->teacher->id, 'name' => $e->teacher->name]
                    : null,
            ]);

        $classes = GradeClass::whereHas('grade', fn($q) => $q->where('school_id', $school->id))
            ->with('grade')
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->grade->name . ' ' . $c->name]);

        $subjects = AcademicSubject::where('school_id', $school->id)->get(['id', 'name']);

        return Inertia::render('school/academics/Timetable', [
            'entries' => $entries,
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'grade_class_id' => 'nullable|exists:grade_classes,id',
            'subject_id' => 'required|exists:academic_subjects,id',
            'teacher_id' => 'nullable|exists:users,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday',
            'time_slot' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:15|max:180',
            'room' => 'nullable|string|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        $data['school_id'] = $school->id;
        TimetableEntry::create($data);

        return redirect()->back()->with('success', 'Timetable entry created.');
    }

    public function update(Request $request, TimetableEntry $timetableEntry)
    {
        if ($timetableEntry->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'grade_class_id' => 'nullable|exists:grade_classes,id',
            'subject_id' => 'required|exists:academic_subjects,id',
            'teacher_id' => 'nullable|exists:users,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday',
            'time_slot' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:15|max:180',
            'room' => 'nullable|string|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date',
        ]);

        $timetableEntry->update($data);

        return redirect()->back()->with('success', 'Timetable entry updated.');
    }

    public function destroy(TimetableEntry $timetableEntry)
    {
        if ($timetableEntry->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $timetableEntry->delete();

        return redirect()->back()->with('success', 'Timetable entry deleted.');
    }
}
