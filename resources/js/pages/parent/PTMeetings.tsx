import React, { useState } from 'react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_PT_SESSIONS, MOCK_PT_SLOTS, MOCK_PT_BOOKINGS, PARENT_CHILDREN } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Check, XCircle } from 'lucide-react';

const bookingColors: Record<string, string> = { pending: 'bg-warning/10 text-warning', confirmed: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive', completed: 'bg-primary/10 text-primary', rescheduled: 'bg-muted text-muted-foreground' };

const ParentPTMeetings: React.FC = () => {
  const T = useT();
  const t = T.PT_MEETINGS_TEXT;
  const myBookings = MOCK_PT_BOOKINGS.filter(b => b.parentId === '3');
  const [bookingStep, setBookingStep] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.pageTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">Book and manage parent-teacher meetings.</p>
      </div>

      {/* Available Sessions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Upcoming Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_PT_SESSIONS.filter(s => s.status === 'open').map(session => (
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
      </div>

      {/* My Bookings */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t.myMeetings}</CardTitle></CardHeader>
        <CardContent className="p-0">
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
              {myBookings.map(b => {
                const slot = MOCK_PT_SLOTS.find(s => s.id === b.slotId);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="text-sm">Jane Achieng</TableCell>
                    <TableCell className="text-sm">{b.studentId}</TableCell>
                    <TableCell className="text-sm font-mono">{slot?.date} {slot?.startTime}</TableCell>
                    <TableCell><Badge className={bookingColors[b.status]}>{b.status}</Badge></TableCell>
                    <TableCell>
                      {b.status === 'confirmed' && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="gap-1"><Calendar className="h-3 w-3" />{t.calendar.addToCalendar}</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">{t.booking.cancel}</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {myBookings.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No meetings booked yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default ParentPTMeetings;
