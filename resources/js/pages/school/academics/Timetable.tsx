import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface TimetableEntryRow {
  id: number;
  day_of_week: string;
  time_slot: string;
  duration: number;
  room: string | null;
  class: { id: number; name: string } | null;
  subject: { id: number; name: string };
  teacher: { id: number; name: string } | null;
}
interface ClassOption { id: number; name: string; }
interface SubjectOption { id: number; name: string; }
interface Props extends InertiaSharedProps {
  entries: TimetableEntryRow[];
  classes: ClassOption[];
  subjects: SubjectOption[];
}

const DAYS: TimetableEntryRow['day_of_week'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const emptyForm = {
  grade_class_id: '',
  subject_id: '',
  day_of_week: 'monday',
  time_slot: '08:00',
  duration: '45',
  room: '',
  effective_from: '',
};

const Timetable: React.FC = () => {
  const { toast } = useToast();
  const { entries, classes, subjects } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<TimetableEntryRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (e: TimetableEntryRow) => {
    setEditing(e);
    setForm({
      grade_class_id: e.class?.id?.toString() ?? '',
      subject_id: e.subject.id.toString(),
      day_of_week: e.day_of_week,
      time_slot: e.time_slot,
      duration: e.duration.toString(),
      room: e.room ?? '',
      effective_from: '',
    });
    setOpen(true);
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    const payload = {
      ...form,
      grade_class_id: form.grade_class_id || null,
      duration: Number(form.duration),
    };
    if (editing) {
      router.put(`/school/academics/timetable/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Entry updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/academics/timetable', payload, {
        onSuccess: () => { toast({ title: 'Entry added' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/school/academics/timetable/${id}`, {
      onSuccess: () => { toast({ title: 'Entry removed' }); setDeleteId(null); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  // Build grid: day -> time_slot -> entries
  const gridMap: Record<string, Record<string, TimetableEntryRow[]>> = {};
  (entries ?? []).forEach(e => {
    if (!gridMap[e.day_of_week]) gridMap[e.day_of_week] = {};
    if (!gridMap[e.day_of_week][e.time_slot]) gridMap[e.day_of_week][e.time_slot] = [];
    gridMap[e.day_of_week][e.time_slot].push(e);
  });
  const allTimeSlots = [...new Set((entries ?? []).map(e => e.time_slot))].sort();

  return (
    <AppLayout>
      <Head title="Timetable" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Academics &rsaquo; Timetable</p>
            <h1 className="text-2xl font-bold">Timetable</h1>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
        </div>

        {/* Weekly Grid */}
        <Card>
          <CardHeader><CardTitle>Weekly Grid</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {allTimeSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No timetable entries yet.</p>
            ) : (
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted text-left w-24">Time</th>
                    {DAYS.map(d => (
                      <th key={d} className="border p-2 bg-muted capitalize text-center">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTimeSlots.map(slot => (
                    <tr key={slot}>
                      <td className="border p-2 font-medium text-center bg-muted/40">{slot}</td>
                      {DAYS.map(day => {
                        const cellEntries = gridMap[day]?.[slot] ?? [];
                        return (
                          <td key={day} className="border p-2 align-top min-w-[120px]">
                            {cellEntries.map(e => (
                              <div key={e.id} className="text-xs bg-primary/10 rounded px-1 py-0.5 mb-1">
                                <div className="font-medium">{e.subject.name}</div>
                                {e.class && <div className="text-muted-foreground">{e.class.name}</div>}
                                {e.room && <div className="text-muted-foreground">Room: {e.room}</div>}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* List Table */}
        <Card>
          <CardHeader><CardTitle>All Entries</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(entries ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No entries found.</TableCell></TableRow>
                )}
                {(entries ?? []).map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="capitalize">{e.day_of_week}</TableCell>
                    <TableCell>{e.time_slot}</TableCell>
                    <TableCell>{e.subject.name}</TableCell>
                    <TableCell>{e.class?.name ?? '—'}</TableCell>
                    <TableCell>{e.teacher?.name ?? '—'}</TableCell>
                    <TableCell>{e.duration} min</TableCell>
                    <TableCell>{e.room ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Entry' : 'Add Timetable Entry'}</DialogTitle>
            <DialogDescription>Fill in the timetable entry details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Class (optional)</Label>
              <Select value={form.grade_class_id} onValueChange={v => set('grade_class_id', v)}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All classes</SelectItem>
                  {(classes ?? []).map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Select value={form.subject_id} onValueChange={v => set('subject_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {(subjects ?? []).map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Day of Week *</Label>
              <Select value={form.day_of_week} onValueChange={v => set('day_of_week', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Slot *</Label>
              <Input type="time" value={form.time_slot} onChange={e => set('time_slot', e.target.value)} />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min={15} max={180} value={form.duration} onChange={e => set('duration', e.target.value)} />
            </div>
            <div>
              <Label>Room (optional)</Label>
              <Input value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. Room 1A" />
            </div>
            {!editing && (
              <div>
                <Label>Effective From *</Label>
                <Input type="date" value={form.effective_from} onChange={e => set('effective_from', e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>Are you sure you want to remove this timetable entry?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Timetable;
