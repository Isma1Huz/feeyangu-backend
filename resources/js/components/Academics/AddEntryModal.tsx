import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DAYS = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
];

interface SubjectOption { id: number; name: string; }
interface TeacherOption { id: number; name: string; }

interface EntryForm {
    day_of_week: string;
    period: string;
    subject_id: string;
    teacher_id: string;
    room: string;
    start_time: string;
    end_time: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (form: EntryForm) => void;
    subjects: SubjectOption[];
    teachers: TeacherOption[];
    periods: number;
    defaultDay?: number;
    defaultPeriod?: number;
    title?: string;
    submitting?: boolean;
}

const empty = (day = 1, period = 1): EntryForm => ({
    day_of_week: String(day),
    period: String(period),
    subject_id: '',
    teacher_id: '',
    room: '',
    start_time: '',
    end_time: '',
});

const AddEntryModal: React.FC<Props> = ({
    open,
    onOpenChange,
    onSubmit,
    subjects,
    teachers,
    periods,
    defaultDay = 1,
    defaultPeriod = 1,
    title = 'Add Timetable Entry',
    submitting = false,
}) => {
    const [form, setForm] = useState<EntryForm>(() => empty(defaultDay, defaultPeriod));
    const set = (k: keyof EntryForm, v: string) => setForm(f => ({ ...f, [k]: v }));

    const periodNumbers = Array.from({ length: periods }, (_, i) => i + 1);

    const handleSubmit = () => {
        onSubmit(form);
    };

    return (
        <Dialog open={open} onOpenChange={open => { onOpenChange(open); if (!open) setForm(empty(defaultDay, defaultPeriod)); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Add a new entry to the timetable.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Day *</Label>
                            <Select value={form.day_of_week} onValueChange={v => set('day_of_week', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Period *</Label>
                            <Select value={form.period} onValueChange={v => set('period', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {periodNumbers.map(p => <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label>Subject *</Label>
                        <Select value={form.subject_id} onValueChange={v => set('subject_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Teacher</Label>
                        <Select value={form.teacher_id} onValueChange={v => set('teacher_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {teachers.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Room</Label>
                        <Input value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. Room 1A" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Start Time</Label>
                            <Input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <Input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting || !form.subject_id}>
                        {submitting ? 'Saving...' : 'Add Entry'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEntryModal;
