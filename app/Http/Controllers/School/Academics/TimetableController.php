<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\AcademicSubject;
use App\Models\GradeClass;
use App\Models\TimetableEntry;
use App\Models\User;
use App\Services\Academics\TimetableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    public function __construct(private TimetableService $service) {}

    public function index(): Response
    {
        $school = auth()->user()->school;

        $entries = TimetableEntry::where('school_id', $school->id)
            ->with(['gradeClass.grade', 'stream', 'subject', 'teacher'])
            ->where(function ($q) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now());
            })
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($e) => [
                'id'          => $e->id,
                'day_of_week' => $e->day_of_week,
                'time_slot'   => $e->start_time ?? $e->time_slot,
                'start_time'  => $e->start_time ?? $e->time_slot,
                'end_time'    => $e->end_time,
                'duration'    => $e->duration,
                'room'        => $e->room,
                'class'       => $e->gradeClass
                    ? ['id' => $e->gradeClass->id, 'name' => ($e->gradeClass->grade->name ?? '') . ' ' . $e->gradeClass->name]
                    : null,
                'stream'      => $e->stream ? ['id' => $e->stream->id, 'name' => $e->stream->name] : null,
                'subject'     => ['id' => $e->subject->id, 'name' => $e->subject->name],
                'teacher'     => $e->teacher
                    ? ['id' => $e->teacher->id, 'name' => $e->teacher->name]
                    : null,
            ]);

        $classes = GradeClass::whereHas('grade', fn ($q) => $q->where('school_id', $school->id))
            ->with('grade')
            ->get()
            ->map(fn ($c) => [
                'id'   => $c->id,
                'name' => ($c->grade->name ?? '') . ' ' . $c->name,
            ]);

        $subjects = AcademicSubject::where('school_id', $school->id)->get(['id', 'name']);

        $teachers = User::where('school_id', $school->id)
            ->whereHas('roles', fn ($q) => $q->where('name', 'teacher'))
            ->get(['id', 'name']);

        return Inertia::render('school/academics/Timetable', [
            'entries'   => $entries,
            'classes'   => $classes,
            'subjects'  => $subjects,
            'teachers'  => $teachers,
            'timeSlots' => $this->service->getTimeSlots(),
            'days'      => $this->service->getDays(),
        ]);
    }

    public function classTimetable(GradeClass $gradeClass, Request $request): JsonResponse
    {
        if ($gradeClass->grade->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $streamId = $request->integer('stream_id') ?: null;
        $timetable = $this->service->generateClassTimetable($gradeClass->id, $streamId);

        return response()->json(['timetable' => $timetable, 'class' => ['id' => $gradeClass->id, 'name' => $gradeClass->grade->name . ' ' . $gradeClass->name]]);
    }

    public function teacherTimetable(User $teacher): JsonResponse
    {
        if ($teacher->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $timetable = $this->service->generateTeacherTimetable($teacher->id);

        return response()->json(['timetable' => $timetable, 'teacher' => ['id' => $teacher->id, 'name' => $teacher->name]]);
    }

    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $data = $request->validate([
            'grade_class_id' => 'nullable|exists:grade_classes,id',
            'stream_id'      => 'nullable|exists:streams,id',
            'subject_id'     => 'required|exists:academic_subjects,id',
            'teacher_id'     => 'nullable|exists:users,id',
            'day_of_week'    => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i|after:start_time',
            'room'           => 'nullable|string|max:100',
            'effective_from' => 'required|date',
            'effective_to'   => 'nullable|date|after_or_equal:effective_from',
        ]);

        $conflicts = $this->service->checkConflicts([$data]);
        if (!empty($conflicts)) {
            return back()->withErrors(['conflicts' => $conflicts]);
        }

        $data['school_id'] = $school->id;
        $data['time_slot'] = $data['start_time'];
        $data['duration'] = $this->computeDuration($data['start_time'], $data['end_time']);
        TimetableEntry::create($data);

        return redirect()->back()->with('success', 'Timetable entry created.');
    }

    public function update(Request $request, TimetableEntry $timetableEntry): RedirectResponse
    {
        if ($timetableEntry->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'grade_class_id' => 'nullable|exists:grade_classes,id',
            'stream_id'      => 'nullable|exists:streams,id',
            'subject_id'     => 'required|exists:academic_subjects,id',
            'teacher_id'     => 'nullable|exists:users,id',
            'day_of_week'    => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i|after:start_time',
            'room'           => 'nullable|string|max:100',
            'effective_from' => 'required|date',
            'effective_to'   => 'nullable|date|after_or_equal:effective_from',
        ]);

        $conflicts = $this->service->checkConflicts([$data], $timetableEntry->id);
        if (!empty($conflicts)) {
            return back()->withErrors(['conflicts' => $conflicts]);
        }

        $data['time_slot'] = $data['start_time'];
        $data['duration'] = $this->computeDuration($data['start_time'], $data['end_time']);
        $timetableEntry->update($data);

        return redirect()->back()->with('success', 'Timetable entry updated.');
    }

    public function destroy(TimetableEntry $timetableEntry): RedirectResponse
    {
        if ($timetableEntry->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $timetableEntry->delete();

        return redirect()->back()->with('success', 'Timetable entry deleted.');
    }

    public function checkConflicts(Request $request): JsonResponse
    {
        $request->validate([
            'entries'                  => 'required|array',
            'entries.*.day_of_week'    => 'required|string',
            'entries.*.start_time'     => 'required|string',
            'entries.*.end_time'       => 'required|string',
            'entries.*.effective_from' => 'nullable|date',
        ]);

        $conflicts = $this->service->checkConflicts($request->input('entries'));

        return response()->json(['conflicts' => $conflicts]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'entry_id'     => 'required|integer|exists:timetable_entries,id',
            'new_time'     => 'required|date_format:H:i',
            'new_end_time' => 'required|date_format:H:i|after:new_time',
        ]);

        $entry = TimetableEntry::findOrFail($request->entry_id);

        if ($entry->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $entry->update([
            'start_time' => $request->new_time,
            'end_time'   => $request->new_end_time,
            'time_slot'  => $request->new_time,
            'duration'   => $this->computeDuration($request->new_time, $request->new_end_time),
        ]);

        return response()->json(['success' => true]);
    }

    private function computeDuration(string $startTime, string $endTime): int
    {
        [$sh, $sm] = explode(':', $startTime);
        [$eh, $em] = explode(':', $endTime);

        return ((int) $eh * 60 + (int) $em) - ((int) $sh * 60 + (int) $sm);
    }
}
