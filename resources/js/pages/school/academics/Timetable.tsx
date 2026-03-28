import React, { useState, useCallback, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import axios from 'axios';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface TimetableEntryRow {
    id: number;
    day_of_week: string;
    time_slot: string;
    start_time: string;
    end_time: string | null;
    duration: number;
    room: string | null;
    class: { id: number; name: string } | null;
    stream: { id: number; name: string } | null;
    subject: { id: number; name: string };
    teacher: { id: number; name: string } | null;
}

interface ClassOption { id: number; name: string; }
interface SubjectOption { id: number; name: string; }
interface TeacherOption { id: number; name: string; }

interface Props extends InertiaSharedProps {
    entries: TimetableEntryRow[];
    classes: ClassOption[];
    subjects: SubjectOption[];
    teachers: TeacherOption[];
    timeSlots: string[];
    days: string[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const emptyForm = {
    grade_class_id: '',
    stream_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 'monday',
    start_time: '08:00',
    end_time: '09:00',
    room: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
};

// --- Draggable Entry Card ---
function DraggableEntryCard({
    entry,
    view,
    onEdit,
    onDelete,
}: {
    entry: TimetableEntryRow;
    view: string;
    onEdit: (e: TimetableEntryRow) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-primary/10 rounded p-2 text-xs cursor-default mb-1 group hover:bg-primary/20 transition-colors"
        >
            <div className="flex items-start gap-1">
                <span
                    {...attributes}
                    {...listeners}
                    className="cursor-grab mt-0.5 text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-3 w-3" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{entry.subject.name}</div>
                    {view === 'class' ? (
                        <div className="text-muted-foreground truncate">{entry.teacher?.name ?? '—'}</div>
                    ) : (
                        <div className="text-muted-foreground truncate">{entry.class?.name ?? '—'}</div>
                    )}
                    {entry.room && <div className="text-muted-foreground truncate">{entry.room}</div>}
                    <div className="text-muted-foreground mt-0.5">
                        {entry.start_time?.slice(0, 5) || entry.time_slot?.slice(0, 5)}
                        {entry.end_time ? `–${entry.end_time.slice(0, 5)}` : ''}
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(entry)} className="text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => onDelete(entry.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Timetable Grid ---
function TimetableGrid({
    entries,
    days,
    timeSlots,
    view,
    onEdit,
    onDelete,
}: {
    entries: TimetableEntryRow[];
    days: string[];
    timeSlots: string[];
    view: string;
    onEdit: (e: TimetableEntryRow) => void;
    onDelete: (id: number) => void;
}) {
    const gridMap: Record<string, Record<string, TimetableEntryRow[]>> = {};
    
    entries.forEach(e => {
        const slot = (e.start_time || e.time_slot)?.slice(0, 5);
        if (!slot) return;
        if (!gridMap[e.day_of_week]) gridMap[e.day_of_week] = {};
        if (!gridMap[e.day_of_week][slot]) gridMap[e.day_of_week][slot] = [];
        gridMap[e.day_of_week][slot].push(e);
    });

    const allSlots = useMemo(() => {
        return [...new Set([...timeSlots, ...entries.map(e => (e.start_time || e.time_slot)?.slice(0, 5)).filter(Boolean)])].sort();
    }, [entries, timeSlots]);

    return (
        <div className="border rounded-lg overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-muted">
                        <th className="border p-3 w-24 text-left font-medium">Time</th>
                        {days.map(day => (
                            <th key={day} className="border p-3 capitalize text-left min-w-[140px] font-medium">{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {allSlots.map(slot => (
                        <tr key={slot}>
                            <td className="border p-2 font-medium bg-muted/30 text-center align-top w-20">{slot}</td>
                            {days.map(day => {
                                const cellEntries = gridMap[day]?.[slot] ?? [];
                                return (
                                    <td key={`${day}-${slot}`} className="border p-1 align-top min-w-[140px] min-h-[60px]">
                                        {cellEntries.map(e => (
                                            <DraggableEntryCard
                                                key={e.id}
                                                entry={e}
                                                view={view}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        ))}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Main Component ---
const Timetable: React.FC = () => {
    const { toast } = useToast();
    const { entries: initialEntries, classes, subjects, teachers, timeSlots, days } = usePage<Props>().props;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const [entries, setEntries] = useState<TimetableEntryRow[]>(initialEntries ?? []);
    const [view, setView] = useState<'all' | 'class' | 'teacher'>('all');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [filteredEntries, setFilteredEntries] = useState<TimetableEntryRow[] | null>(null);
    const [loadingView, setLoadingView] = useState(false);

    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editing, setEditing] = useState<TimetableEntryRow | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [activeEntry, setActiveEntry] = useState<TimetableEntryRow | null>(null);

    const displayedEntries = view === 'all' ? entries : (filteredEntries ?? entries);
    const displayedDays = days?.length ? days : DAYS;
    const displayedSlots = timeSlots?.length ? timeSlots : ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

    // --- Load filtered timetable ---
    const loadClassTimetable = useCallback(async (classId: string) => {
        if (!classId) return;
        setLoadingView(true);
        try {
            const res = await axios.get(`/school/academics/timetable/class/${classId}`);
            const flat: TimetableEntryRow[] = Object.values(res.data.timetable).flat() as TimetableEntryRow[];
            setFilteredEntries(flat);
        } catch {
            toast({ title: 'Error', description: 'Failed to load class timetable.', variant: 'destructive' });
        } finally {
            setLoadingView(false);
        }
    }, [toast]);

    const loadTeacherTimetable = useCallback(async (teacherId: string) => {
        if (!teacherId) return;
        setLoadingView(true);
        try {
            const res = await axios.get(`/school/academics/timetable/teacher/${teacherId}`);
            const flat: TimetableEntryRow[] = Object.values(res.data.timetable).flat() as TimetableEntryRow[];
            setFilteredEntries(flat);
        } catch {
            toast({ title: 'Error', description: 'Failed to load teacher timetable.', variant: 'destructive' });
        } finally {
            setLoadingView(false);
        }
    }, [toast]);

    // --- Drag & Drop ---
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const entry = entries.find(e => e.id === event.active.id);
        setActiveEntry(entry ?? null);
    }, [entries]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        setActiveEntry(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const draggedEntry = entries.find(e => e.id === active.id);
        const targetEntry = entries.find(e => e.id === over.id);
        if (!draggedEntry || !targetEntry) return;

        const newTime = targetEntry.start_time || targetEntry.time_slot;
        const newEndTime = targetEntry.end_time || newTime;
        if (!newTime) return;

        try {
            await axios.post('/school/academics/timetable/reorder', {
                entry_id: draggedEntry.id,
                new_time: newTime.slice(0, 5),
                new_end_time: newEndTime.slice(0, 5),
            });

            setEntries(prev => prev.map(e => {
                if (e.id === draggedEntry.id) {
                    return { ...e, start_time: newTime, end_time: newEndTime, time_slot: newTime };
                }
                return e;
            }));

            toast({ title: 'Entry moved' });
        } catch {
            toast({ title: 'Error', description: 'Failed to move entry.', variant: 'destructive' });
        }
    }, [entries, toast]);

    // --- Form Helpers ---
    const setFormField = useCallback((key: string, val: string) => {
        setForm(f => ({ ...f, [key]: val }));
    }, []);

    const openCreate = useCallback(() => {
        setEditing(null);
        setForm(emptyForm);
        setFormErrors({});
        setOpen(true);
    }, []);

    const openEdit = useCallback((entry: TimetableEntryRow) => {
        setEditing(entry);
        setForm({
            grade_class_id: entry.class?.id?.toString() ?? '',
            stream_id: entry.stream?.id?.toString() ?? '',
            subject_id: entry.subject.id.toString(),
            teacher_id: entry.teacher?.id?.toString() ?? '',
            day_of_week: entry.day_of_week,
            start_time: (entry.start_time || entry.time_slot)?.slice(0, 5) ?? '08:00',
            end_time: entry.end_time?.slice(0, 5) ?? '09:00',
            room: entry.room ?? '',
            effective_from: new Date().toISOString().split('T')[0],
            effective_to: '',
        });
        setFormErrors({});
        setOpen(true);
    }, []);

    const handleSave = useCallback(() => {
        // Validate required fields
        if (!form.subject_id) {
            setFormErrors({ subject_id: 'Subject is required' });
            toast({ title: 'Validation Error', description: 'Please select a subject.', variant: 'destructive' });
            return;
        }
        if (!form.start_time || !form.end_time) {
            toast({ title: 'Validation Error', description: 'Start and end times are required.', variant: 'destructive' });
            return;
        }
        if (!form.effective_from) {
            toast({ title: 'Validation Error', description: 'Effective from date is required.', variant: 'destructive' });
            return;
        }

        const payload = {
            ...form,
            grade_class_id: form.grade_class_id || null,
            stream_id: form.stream_id || null,
            teacher_id: form.teacher_id || null,
            effective_to: form.effective_to || null,
        };

        if (editing) {
            router.put(`/school/academics/timetable/${editing.id}`, payload, {
                onSuccess: () => { toast({ title: 'Entry updated' }); setOpen(false); },
                onError: (errors) => {
                    setFormErrors(errors);
                    if (errors.conflicts) {
                        toast({ 
                            title: 'Conflict detected', 
                            description: Array.isArray(errors.conflicts) ? errors.conflicts.join(', ') : errors.conflicts, 
                            variant: 'destructive' 
                        });
                    }
                },
                preserveState: false,
            });
        } else {
            router.post('/school/academics/timetable', payload, {
                onSuccess: () => { toast({ title: 'Entry added' }); setOpen(false); },
                onError: (errors) => {
                    setFormErrors(errors);
                    if (errors.conflicts) {
                        toast({ 
                            title: 'Conflict detected', 
                            description: Array.isArray(errors.conflicts) ? errors.conflicts.join(', ') : errors.conflicts, 
                            variant: 'destructive' 
                        });
                    }
                },
                preserveState: false,
            });
        }
    }, [form, editing, toast]);

    const handleDelete = useCallback((id: number) => {
        router.delete(`/school/academics/timetable/${id}`, {
            onSuccess: () => { 
                toast({ title: 'Entry removed' }); 
                setDeleteId(null); 
                setEntries(prev => prev.filter(e => e.id !== id)); 
            },
            onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' }),
            preserveState: false,
        });
    }, [toast]);

    return (
        <AppLayout>
            <Head title="Timetable" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Academics › Timetable</p>
                        <h1 className="text-2xl font-bold">Timetable</h1>
                    </div>
                    <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
                </div>

                {/* View Controls */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <Tabs value={view} onValueChange={v => { setView(v as any); setFilteredEntries(null); setSelectedClass(''); setSelectedTeacher(''); }}>
                                <TabsList>
                                    <TabsTrigger value="all">All Entries</TabsTrigger>
                                    <TabsTrigger value="class">By Class</TabsTrigger>
                                    <TabsTrigger value="teacher">By Teacher</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {view === 'class' && (
                                <div className="flex items-center gap-2 flex-1 max-w-xs">
                                    <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); loadClassTimetable(v); }}>
                                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                                        <SelectContent>
                                            {(classes ?? []).map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {view === 'teacher' && (
                                <div className="flex items-center gap-2 flex-1 max-w-xs">
                                    <Select value={selectedTeacher} onValueChange={v => { setSelectedTeacher(v); loadTeacherTimetable(v); }}>
                                        <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                        <SelectContent>
                                            {(teachers ?? []).map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {loadingView && <span className="text-sm text-muted-foreground">Loading…</span>}
                        </div>
                    </CardContent>
                </Card>

                {/* Drag-and-drop weekly grid */}
                <Card>
                    <CardHeader><CardTitle>Weekly Grid</CardTitle></CardHeader>
                    <CardContent>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <TimetableGrid
                                entries={displayedEntries}
                                days={displayedDays}
                                timeSlots={displayedSlots}
                                view={view}
                                onEdit={openEdit}
                                onDelete={setDeleteId}
                            />
                            <DragOverlay>
                                {activeEntry && (
                                    <div className="bg-primary/20 border border-primary rounded p-2 text-xs shadow-lg w-32">
                                        <div className="font-medium">{activeEntry.subject.name}</div>
                                        <div className="text-muted-foreground">{activeEntry.start_time?.slice(0, 5) || activeEntry.time_slot?.slice(0, 5)}</div>
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
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
                                    <TableHead>Start</TableHead>
                                    <TableHead>End</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Teacher</TableHead>
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
                                        <TableCell>{(e.start_time || e.time_slot)?.slice(0, 5)}</TableCell>
                                        <TableCell>{e.end_time?.slice(0, 5) ?? '—'}</TableCell>
                                        <TableCell>{e.subject.name}</TableCell>
                                        <TableCell>
                                            {e.class?.name ?? '—'}
                                            {e.stream && <Badge variant="outline" className="ml-1 text-xs">{e.stream.name}</Badge>}
                                        </TableCell>
                                        <TableCell>{e.teacher?.name ?? '—'}</TableCell>
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
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Entry' : 'Add Timetable Entry'}</DialogTitle>
                        <DialogDescription>Fill in the timetable entry details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {formErrors.conflicts && (
                            <div className="flex items-start gap-2 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    {Array.isArray(formErrors.conflicts)
                                        ? formErrors.conflicts.map((c, i) => <div key={i}>{c}</div>)
                                        : formErrors.conflicts}
                                </div>
                            </div>
                        )}

                        <div>
                            <Label>Class (optional)</Label>
                            <Select 
                                value={form.grade_class_id || undefined} 
                                onValueChange={v => setFormField('grade_class_id', v)}
                            >
                                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                                <SelectContent>
                                    {(classes ?? []).map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Subject *</Label>
                            <Select 
                                value={form.subject_id || undefined} 
                                onValueChange={v => setFormField('subject_id', v)}
                                required
                            >
                                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {(subjects ?? []).map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {formErrors.subject_id && <p className="text-xs text-destructive mt-1">{formErrors.subject_id}</p>}
                        </div>

                        <div>
                            <Label>Teacher (optional)</Label>
                            <Select 
                                value={form.teacher_id || undefined} 
                                onValueChange={v => setFormField('teacher_id', v)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                <SelectContent>
                                    {(teachers ?? []).map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Day *</Label>
                                <Select value={form.day_of_week} onValueChange={v => setFormField('day_of_week', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {DAYS.map(d => <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Room (optional)</Label>
                                <Input value={form.room} onChange={e => setFormField('room', e.target.value)} placeholder="e.g. Room 1A" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Start Time *</Label>
                                <Input type="time" value={form.start_time} onChange={e => setFormField('start_time', e.target.value)} />
                                {formErrors.start_time && <p className="text-xs text-destructive mt-1">{formErrors.start_time}</p>}
                            </div>
                            <div>
                                <Label>End Time *</Label>
                                <Input type="time" value={form.end_time} onChange={e => setFormField('end_time', e.target.value)} />
                                {formErrors.end_time && <p className="text-xs text-destructive mt-1">{formErrors.end_time}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Effective From *</Label>
                                <Input type="date" value={form.effective_from} onChange={e => setFormField('effective_from', e.target.value)} />
                                {formErrors.effective_from && <p className="text-xs text-destructive mt-1">{formErrors.effective_from}</p>}
                            </div>
                            <div>
                                <Label>Effective To (optional)</Label>
                                <Input type="date" value={form.effective_to} onChange={e => setFormField('effective_to', e.target.value)} />
                            </div>
                        </div>
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