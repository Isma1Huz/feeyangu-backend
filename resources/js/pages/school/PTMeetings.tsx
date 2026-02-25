import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_PT_SESSIONS, MOCK_PT_SLOTS, MOCK_PT_BOOKINGS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, Download } from 'lucide-react';

const sessionColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-success/10 text-success',
  closed: 'bg-warning/10 text-warning',
  completed: 'bg-primary/10 text-primary',
};

const SchoolPTMeetings: React.FC = () => {
  const T = useT();
  const t = T.PT_MEETINGS_TEXT;
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage parent-teacher meeting sessions and bookings.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />{t.session.create}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PT_SESSIONS.map(session => {
          const totalSlots = MOCK_PT_SLOTS.filter(s => s.sessionId === session.id).length;
          const bookedSlots = MOCK_PT_SLOTS.filter(s => s.sessionId === session.id && s.status === 'booked').length;
          return (
            <Card key={session.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/school/pt-meetings/${session.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{session.name}</h3>
                  <Badge className={sessionColors[session.status]}>{session.status}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><Calendar className="h-3.5 w-3.5 inline mr-1" />{session.dates.join(', ')}</p>
                  <p><Users className="h-3.5 w-3.5 inline mr-1" />{session.venue}</p>
                  <p>Slots: {bookedSlots}/{totalSlots} booked</p>
                  <p>Booking deadline: {session.bookingDeadline}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Bookings */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Bookings</CardTitle>
            <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" />Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PT_BOOKINGS.map(b => {
                const slot = MOCK_PT_SLOTS.find(s => s.id === b.slotId);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="text-sm">{b.parentId === '3' ? 'David Ochieng' : `Parent ${b.parentId}`}</TableCell>
                    <TableCell className="text-sm">{b.studentId}</TableCell>
                    <TableCell className="text-sm">Jane Achieng</TableCell>
                    <TableCell className="text-sm font-mono">{slot?.date} {slot?.startTime}</TableCell>
                    <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolPTMeetings;
