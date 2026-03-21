<?php

namespace App\Services\Academics;

use App\Models\TimetableEntry;

class TimetableService
{
    public function checkConflicts(array $entries, ?int $excludeId = null): array
    {
        $conflicts = [];

        foreach ($entries as $entry) {
            $baseQuery = TimetableEntry::where('day_of_week', $entry['day_of_week'])
                ->where('effective_from', '<=', $entry['effective_from'] ?? now()->toDateString())
                ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', $entry['effective_from'] ?? now()->toDateString()))
                ->where(function ($q) use ($entry) {
                    $q->where(fn ($q2) => $q2->where('start_time', '<', $entry['end_time'])->where('end_time', '>', $entry['start_time']));
                });

            if ($excludeId) {
                $baseQuery->where('id', '!=', $excludeId);
            }

            // Teacher conflict check
            if (!empty($entry['teacher_id'])) {
                $teacherConflict = (clone $baseQuery)
                    ->where('teacher_id', $entry['teacher_id'])
                    ->exists();

                if ($teacherConflict) {
                    $conflicts[] = "Teacher conflict on {$entry['day_of_week']} at {$entry['start_time']}–{$entry['end_time']}";
                }
            }

            // Room conflict check
            if (!empty($entry['room'])) {
                $roomConflict = (clone $baseQuery)
                    ->where('room', $entry['room'])
                    ->exists();

                if ($roomConflict) {
                    $conflicts[] = "Room '{$entry['room']}' already booked on {$entry['day_of_week']} at {$entry['start_time']}–{$entry['end_time']}";
                }
            }

            // Class conflict check (same class cannot have two subjects at the same time)
            if (!empty($entry['grade_class_id'])) {
                $classConflict = (clone $baseQuery)
                    ->where('grade_class_id', $entry['grade_class_id'])
                    ->when(!empty($entry['stream_id']), fn ($q) => $q->where(fn ($q2) => $q2->whereNull('stream_id')->orWhere('stream_id', $entry['stream_id'])))
                    ->exists();

                if ($classConflict) {
                    $conflicts[] = "Class conflict on {$entry['day_of_week']} at {$entry['start_time']}–{$entry['end_time']}";
                }
            }
        }

        return $conflicts;
    }

    public function generateTeacherTimetable(int $teacherId): array
    {
        $entries = TimetableEntry::with(['gradeClass.grade', 'stream', 'subject'])
            ->where('teacher_id', $teacherId)
            ->active()
            ->orderBy('start_time')
            ->get()
            ->map(fn ($e) => $this->formatEntry($e, 'teacher'));

        $timetable = [];
        foreach ($this->getDays() as $day) {
            $timetable[$day] = $entries->filter(fn ($e) => $e['day_of_week'] === $day)->values()->all();
        }

        return $timetable;
    }

    public function generateClassTimetable(int $classId, ?int $streamId = null): array
    {
        $entries = TimetableEntry::with(['subject', 'teacher', 'stream'])
            ->where('grade_class_id', $classId)
            ->when($streamId, fn ($q) => $q->where(fn ($q2) => $q2->whereNull('stream_id')->orWhere('stream_id', $streamId)))
            ->active()
            ->orderBy('start_time')
            ->get()
            ->map(fn ($e) => $this->formatEntry($e, 'class'));

        $timetable = [];
        foreach ($this->getDays() as $day) {
            $timetable[$day] = $entries->filter(fn ($e) => $e['day_of_week'] === $day)->values()->all();
        }

        return $timetable;
    }

    public function getTimeSlots(): array
    {
        return ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    }

    public function getDays(): array
    {
        return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    }

    private function formatEntry(TimetableEntry $entry, string $view): array
    {
        $data = [
            'id'         => $entry->id,
            'day_of_week' => $entry->day_of_week,
            'start_time' => $entry->start_time ?? $entry->time_slot,
            'end_time'   => $entry->end_time,
            'duration'   => $entry->duration,
            'room'       => $entry->room,
            'subject'    => $entry->subject ? ['id' => $entry->subject->id, 'name' => $entry->subject->name] : null,
            'stream'     => $entry->stream ? ['id' => $entry->stream->id, 'name' => $entry->stream->name] : null,
        ];

        if ($view === 'teacher') {
            $data['academic_class'] = $entry->gradeClass
                ? ['id' => $entry->gradeClass->id, 'name' => ($entry->gradeClass->grade->name ?? '') . ' ' . $entry->gradeClass->name]
                : null;
        } else {
            $data['teacher'] = $entry->teacher
                ? ['id' => $entry->teacher->id, 'name' => $entry->teacher->name]
                : null;
        }

        return $data;
    }
}
