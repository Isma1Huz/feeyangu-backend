import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface SubjectOption { id: number; name: string; }
interface ClassOption { id: number; name: string; }
interface LessonPlanRow {
  id: number;
  topic: string;
  sub_topic: string | null;
  date: string;
  status: 'draft' | 'published';
  subject: { id: number; name: string };
  class: { id: number; name: string } | null;
}
interface Props extends InertiaSharedProps {
  lessonPlans: LessonPlanRow[];
  subjects: SubjectOption[];
  classes: ClassOption[];
}

const emptyForm = {
  subject_id: '',
  grade_class_id: '',
  topic: '',
  sub_topic: '',
  date: '',
  learning_objectives: '',
  differentiation: '',
  status: 'draft',
};

const statusVariant = (s: string): 'default' | 'secondary' => s === 'published' ? 'default' : 'secondary';

const LessonPlans: React.FC = () => {
  const { toast } = useToast();
  const { lessonPlans, subjects, classes } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<LessonPlanRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: LessonPlanRow) => {
    setEditing(p);
    setForm({
      subject_id: p.subject.id.toString(),
      grade_class_id: p.class?.id?.toString() ?? '',
      topic: p.topic,
      sub_topic: p.sub_topic ?? '',
      date: p.date,
      learning_objectives: '',
      differentiation: '',
      status: p.status,
    });
    setOpen(true);
  };
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const learningObjectives = form.learning_objectives
      ? form.learning_objectives.split(',').map(s => s.trim()).filter(Boolean)
      : null;

    const payload = {
      subject_id: Number(form.subject_id),
      grade_class_id: form.grade_class_id ? Number(form.grade_class_id) : null,
      topic: form.topic,
      sub_topic: form.sub_topic || null,
      date: form.date,
      learning_objectives: learningObjectives,
      differentiation: form.differentiation || null,
      status: form.status,
    };

    if (editing) {
      router.put(`/school/academics/lesson-plans/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Lesson plan updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/academics/lesson-plans', payload, {
        onSuccess: () => { toast({ title: 'Lesson plan created' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/school/academics/lesson-plans/${id}`, {
      onSuccess: () => { toast({ title: 'Lesson plan deleted' }); setDeleteId(null); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Lesson Plans" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Academics &rsaquo; Lesson Plans</p>
            <h1 className="text-2xl font-bold">Lesson Plans</h1>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Lesson Plan</Button>
        </div>

        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Sub-topic</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(lessonPlans ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No lesson plans yet.</TableCell></TableRow>
                )}
                {(lessonPlans ?? []).map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.date}</TableCell>
                    <TableCell className="font-medium">{p.topic}</TableCell>
                    <TableCell>{p.sub_topic ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{p.subject.name}</TableCell>
                    <TableCell>{p.class?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)} className="capitalize">{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lesson Plan' : 'New Lesson Plan'}</DialogTitle>
            <DialogDescription>Fill in the lesson plan details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
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
              <Label>Topic *</Label>
              <Input value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="Lesson topic" />
            </div>
            <div>
              <Label>Sub-topic</Label>
              <Input value={form.sub_topic} onChange={e => set('sub_topic', e.target.value)} placeholder="Optional sub-topic" />
            </div>
            <div>
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <Label>Learning Objectives (comma-separated)</Label>
              <Textarea
                value={form.learning_objectives}
                onChange={e => set('learning_objectives', e.target.value)}
                placeholder="e.g. Understand fractions, Apply addition to real-world problems"
                rows={2}
              />
            </div>
            <div>
              <Label>Differentiation</Label>
              <Textarea
                value={form.differentiation}
                onChange={e => set('differentiation', e.target.value)}
                placeholder="Notes on differentiation for diverse learners"
                rows={2}
              />
            </div>
            {editing && (
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson Plan</DialogTitle>
            <DialogDescription>Are you sure you want to delete this lesson plan? This action cannot be undone.</DialogDescription>
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

export default LessonPlans;
