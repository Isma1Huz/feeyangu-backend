export type SlotStatus = 'available' | 'booked' | 'blocked' | 'completed';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed';
export type SessionStatus = 'draft' | 'open' | 'closed' | 'completed';

export interface PTSession {
  id: string;
  schoolId: string;
  name: string;
  dates: string[];
  slotDurationMinutes: number;
  breakBetweenSlotsMinutes: number;
  startTime: string;
  endTime: string;
  teacherIds: string[];
  venue: string;
  parentInstructions: string;
  status: SessionStatus;
  bookingDeadline: string;
  createdAt: string;
}

export interface PTSlot {
  id: string;
  sessionId: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  blockedReason?: string;
}

export interface PTBooking {
  id: string;
  slotId: string;
  sessionId: string;
  parentId: string;
  studentId: string;
  teacherId: string;
  status: BookingStatus;
  parentMessage: string;
  teacherNotes: string;
  rescheduleReason: string;
  bookedAt: string;
  confirmedAt: string;
  completedAt: string;
}
