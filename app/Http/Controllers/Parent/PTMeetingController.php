<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PTMeetingController extends Controller
{
    /**
     * Display PT meeting sessions and the parent's own bookings.
     */
    public function index(): Response
    {
        $parent = auth()->user();
        $school = $parent->school;

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
                'date'        => $slot->date->format('Y-m-d'),
                'startTime'   => $slot->start_time,
                'teacherName' => $slot->teacher_name ?? '',
            ]);

        // Only return this parent's own bookings
        $bookings = \App\Models\PTBooking::where('parent_id', $parent->id)
            ->whereIn('session_id', $sessionIds)
            ->with('student:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($booking) => [
                'id'        => (string) $booking->id,
                'slotId'    => (string) $booking->slot_id,
                'studentId' => (string) $booking->student_id,
                'studentName' => $booking->student
                    ? "{$booking->student->first_name} {$booking->student->last_name}"
                    : 'N/A',
                'status'    => $booking->status,
            ]);

        return Inertia::render('parent/PTMeetings', [
            'sessions' => $sessions,
            'slots'    => $slots,
            'bookings' => $bookings,
        ]);
    }
}
