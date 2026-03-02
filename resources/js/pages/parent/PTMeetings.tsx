import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';
import { Calendar, Clock, XCircle } from 'lucide-react';

const bookingColors: Record<string, string> = { pending: 'bg-warning/10 text-warning', confirmed: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive', completed: 'bg-primary/10 text-primary', rescheduled: 'bg-muted text-muted-foreground' };

interface PTSession {
  id: string;
  name: string;
  dates: string[];
  venue: string;
  bookingDeadline: string;
  status: string;
}

interface PTSlot {
  id: string;
  date: string;
  startTime: string;
  teacherName: string;
  sessionId: string;
}

interface PTBooking {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  teacherName: string;
  date: string;
  startTime: string;
  status: string;
}

interface Props extends InertiaSharedProps {
  sessions: PTSession[];
  slots: PTSlot[];
  bookings: PTBooking[];
}

const ParentPTMeetings: React.FC = () => {
  const { sessions, slots, bookings: initialBookings } = usePage<Props>().props;
  const T = useT();
  const t = T.PT_MEETINGS_TEXT;
  const { toast } = useToast();
  const [bookings, setBookings] = useState(initialBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      const response = await fetch(`/parent/pt-meetings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        toast({ title: 'Booking Cancelled', description: data.message });
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel booking. Please try again.', variant: 'destructive' });
    } finally {
      setCancelling(null);
    }
  };

  return (
    <AppLayout>
      <Head title={t.pageTitle} />
      <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.pageTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">Book and manage parent-teacher meetings.</p>
      </div>

      {/* Available Sessions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Upcoming Sessions</h2>
        {sessions.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              No open sessions available at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(session => (
              <Card key={session.id} className="shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{session.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1"><Calendar className="h-3.5 w-3.5 inline mr-1" />{session.dates.join(', ')}</p>
                  <p className="text-sm text-muted-foreground">{session.venue}</p>
                  <p className="text-xs text-muted-foreground mt-2">Booking deadline: {session.bookingDeadline}</p>
                  <Button className="mt-3 gap-2 w-full" size="sm"><Clock className="h-3.5 w-3.5" />{t.bookMeeting}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Bookings */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t.myMeetings}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="text-sm">{b.teacherName || '—'}</TableCell>
                    <TableCell className="text-sm">{b.studentName}</TableCell>
                    <TableCell className="text-sm font-mono whitespace-nowrap">{b.date} {b.startTime}</TableCell>
                    <TableCell><Badge className={bookingColors[b.status] ?? 'bg-muted text-muted-foreground'}>{b.status}</Badge></TableCell>
                    <TableCell>
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <div className="flex gap-1 flex-wrap">
                          {b.status === 'confirmed' && (
                            <Button variant="outline" size="sm" className="gap-1 text-xs"><Calendar className="h-3 w-3" />{t.calendar.addToCalendar}</Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive gap-1 text-xs"
                            disabled={cancelling === b.id}
                            onClick={() => handleCancel(b.id)}
                          >
                            <XCircle className="h-3 w-3" />{t.booking.cancel}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No meetings booked yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
};
export default ParentPTMeetings;
