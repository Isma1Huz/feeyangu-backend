<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\PTSession;
use App\Models\PTSlot;
use App\Models\PTBooking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PTMeetingsController extends Controller
{
    /**
     * Display PT meetings for the parent.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $studentIds = $user->students()->pluck('students.id');

        // Get schools for this parent's children
        $schoolIds = $user->students()->pluck('school_id')->unique();

        // Open sessions for the parent's schools
        $sessions = PTSession::whereIn('school_id', $schoolIds)
            ->whereIn('status', ['open', 'upcoming'])
            ->orderBy('booking_deadline')
            ->get()
            ->map(fn ($s) => [
                'id' => (string) $s->id,
                'name' => $s->name,
                'dates' => $s->dates ?? [],
                'venue' => $s->venue ?? '',
                'bookingDeadline' => $s->booking_deadline?->format('M d, Y') ?? '',
                'status' => $s->status,
            ]);

        // Available slots (not booked by this parent)
        $bookedSlotIds = PTBooking::where('parent_id', $user->id)->pluck('slot_id');
        $slots = PTSlot::whereHas('session', function ($q) use ($schoolIds) {
            $q->whereIn('school_id', $schoolIds)
              ->whereIn('status', ['open', 'upcoming']);
        })
            ->whereNotIn('id', $bookedSlotIds)
            ->where('status', 'available')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($slot) => [
                'id' => (string) $slot->id,
                'date' => $slot->date?->format('M d, Y') ?? '',
                'startTime' => $slot->start_time ?? '',
                'teacherName' => $slot->teacher_name ?? '',
                'sessionId' => (string) $slot->session_id,
            ]);

        // Parent's bookings
        $bookings = PTBooking::where('parent_id', $user->id)
            ->whereIn('student_id', $studentIds)
            ->with(['slot', 'student'])
            ->latest()
            ->get()
            ->map(fn ($b) => [
                'id' => (string) $b->id,
                'slotId' => (string) $b->slot_id,
                'studentId' => (string) $b->student_id,
                'studentName' => $b->student?->full_name ?? '',
                'teacherName' => $b->slot?->teacher_name ?? '',
                'date' => $b->slot?->date?->format('M d, Y') ?? '',
                'startTime' => $b->slot?->start_time ?? '',
                'status' => $b->status,
            ]);

        return Inertia::render('parent/PTMeetings', [
            'sessions' => $sessions,
            'slots' => $slots,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Book a PT meeting slot.
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        $studentIds = $user->students()->pluck('students.id');

        $validated = $request->validate([
            'slot_id' => 'required|exists:pt_slots,id',
            'student_id' => 'required|exists:students,id',
            'parent_message' => 'nullable|string|max:500',
        ]);

        // Verify parent has access to this student
        if (!$studentIds->contains($validated['student_id'])) {
            abort(403, 'Unauthorized access to this student');
        }

        $slot = PTSlot::findOrFail($validated['slot_id']);

        // Check slot is still available
        if ($slot->status !== 'available') {
            return response()->json(['success' => false, 'message' => 'This slot is no longer available.'], 422);
        }

        // Check parent hasn't already booked in this session
        $existing = PTBooking::where('parent_id', $user->id)
            ->where('student_id', $validated['student_id'])
            ->whereHas('slot', fn ($q) => $q->where('session_id', $slot->session_id))
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'You already have a booking in this session for this student.'], 422);
        }

        $booking = PTBooking::create([
            'slot_id' => $validated['slot_id'],
            'session_id' => $slot->session_id,
            'parent_id' => $user->id,
            'student_id' => $validated['student_id'],
            'status' => 'pending',
            'parent_message' => $validated['parent_message'] ?? null,
            'booked_at' => now(),
        ]);

        // Mark slot as booked
        $slot->update(['status' => 'booked']);

        return response()->json(['success' => true, 'booking_id' => $booking->id, 'message' => 'Meeting booked successfully.']);
    }

    /**
     * Cancel a PT meeting booking.
     */
    public function cancel(PTBooking $booking): JsonResponse
    {
        // Verify parent owns this booking
        if ($booking->parent_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this booking');
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['success' => false, 'message' => 'This booking cannot be cancelled.'], 422);
        }

        // Release the slot
        PTSlot::where('id', $booking->slot_id)->update(['status' => 'available']);
        $booking->update(['status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Booking cancelled successfully.']);
    }
}
