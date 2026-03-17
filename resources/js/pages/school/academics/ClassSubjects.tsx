import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface SubjectOption { id: number; name: string; code: string; }
interface TeacherOption { id: number; name: string; }
interface ClassSubjectRow { id: number; subject: SubjectOption; teacher: TeacherOption | null; periods_per_week: number; }
interface GradeClassInfo { id: number; name: string; grade: { id: number; name: string }; }
interface Props extends InertiaSharedProps {
  gradeClass: GradeClassInfo;
  classSubjects: ClassSubjectRow[];
  availableSubjects: SubjectOption[];
  teachers: TeacherOption[];
}

const emptyForm = { subject_id: '', teacher_id: '', periods_per_week: '5' };

const ClassSubjects: React.FC = () => {
  const { toast } = useToast();
  const { gradeClass, classSubjects, availableSubjects, teachers } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ClassSubjectRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (cs: ClassSubjectRow) => {
    setEditing(cs);
    setForm({
      subject_id: cs.subject.id.toString(),
      teacher_id: cs.teacher?.id?.toString() ?? '',
      periods_per_week: cs.periods_per_week.toString(),
    });
    setOpen(true);
  };
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const payload = {
      subject_id: editing ? undefined : Number(form.subject_id),
      teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      periods_per_week: Number(form.periods_per_week),
    };
    if (editing) {
      router.put(`/school/classes/${gradeClass.id}/subjects/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Subject updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post(`/school/classes/${gradeClass.id}/subjects`, { ...payload, subject_id: Number(form.subject_id) }, {
        onSuccess: () => { toast({ title: 'Subject assigned' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to assign.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/school/classes/${gradeClass.id}/subjects/${id}`, {
      onSuccess: () => { toast({ title: 'Subject removed' }); setDeleteId(null); },
      onError: () => toast({ title: 'Error', description: 'Failed to remove.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Class Subjects" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Academics &rsaquo; Grades &amp; Classes &rsaquo; {gradeClass.grade.name} {gradeClass.name} &rsaquo; Subjects
            </p>
            <h1 className="text-2xl font-bold">
              {gradeClass.grade.name} {gradeClass.name} — Subjects
            </h1>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Assign Subject</Button>
        </div>

        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Periods/Week</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(classSubjects ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No subjects assigned yet.</TableCell></TableRow>
                )}
                {(classSubjects ?? []).map(cs => (
                  <TableRow key={cs.id}>
                    <TableCell className="font-medium">{cs.subject.name}</TableCell>
                    <TableCell>{cs.subject.code}</TableCell>
                    <TableCell>{cs.teacher?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{cs.periods_per_week}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cs)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(cs.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <DialogTitle>{editing ? 'Edit Subject Assignment' : 'Assign Subject'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update teacher or periods for this subject.' : 'Assign a subject to this class.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!editing && (
              <div>
                <Label>Subject *</Label>
                <Select value={form.subject_id} onValueChange={v => set('subject_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {(availableSubjects ?? []).map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Teacher (optional)</Label>
              <Select value={form.teacher_id} onValueChange={v => set('teacher_id', v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {(teachers ?? []).map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Periods per Week</Label>
              <Input type="number" min={0} max={30} value={form.periods_per_week} onChange={e => set('periods_per_week', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Assign'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Subject</DialogTitle>
            <DialogDescription>Remove this subject from the class? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ClassSubjects;
