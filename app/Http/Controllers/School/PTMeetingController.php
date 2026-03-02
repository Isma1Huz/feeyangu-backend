<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PTMeetingController extends Controller
{
    /**
     * Display PT meetings sessions, slots, and bookings for the school.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $sessions = $school->ptSessions()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($session) => [
                'id'              => (string) $session->id,
                'name'            => $session->name,
                'dates'           => $session->dates ?? [],
                'venue'           => $session->venue,
                'status'          => $session->status,
                'bookingDeadline' => $session->booking_deadline?->format('Y-m-d'),
            ]);

        $sessionIds = $school->ptSessions()->pluck('id');

        $slots = \App\Models\PTSlot::whereIn('session_id', $sessionIds)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn($slot) => [
                'id'          => (string) $slot->id,
                'sessionId'   => (string) $slot->session_id,
                'teacherName' => $slot->teacher_name ?? '',
                'date'        => $slot->date->format('Y-m-d'),
                'startTime'   => $slot->start_time,
                'status'      => $slot->status,
            ]);

        $bookings = \App\Models\PTBooking::whereIn('session_id', $sessionIds)
            ->with(['parent:id,name', 'student:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($booking) => [
                'id'         => (string) $booking->id,
                'slotId'     => (string) $booking->slot_id,
                'parentId'   => (string) $booking->parent_id,
                'parentName' => $booking->parent?->name ?? 'N/A',
                'studentId'  => (string) $booking->student_id,
                'studentName' => $booking->student
                    ? "{$booking->student->first_name} {$booking->student->last_name}"
                    : 'N/A',
                'status'     => $booking->status,
            ]);

        return Inertia::render('school/PTMeetings', [
            'sessions' => $sessions,
            'slots'    => $slots,
            'bookings' => $bookings,
        ]);
    }
}
