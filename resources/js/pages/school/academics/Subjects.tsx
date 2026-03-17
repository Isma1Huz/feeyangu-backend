import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface AcademicSubject { id: number; name: string; code: string; is_core: boolean; credits: number; description: string | null; curriculum: { id: number; name: string } | null; }
interface Curriculum { id: number; name: string; }
interface Props extends InertiaSharedProps { subjects: AcademicSubject[]; curricula: Curriculum[]; }

const empty = { name: '', code: '', curriculum_id: '', is_core: true, credits: 1, description: '' };

const Subjects: React.FC = () => {
  const { toast } = useToast();
  const { subjects, curricula } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicSubject | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: AcademicSubject) => { setEditing(s); setForm({ name: s.name, code: s.code, curriculum_id: s.curriculum?.id?.toString() ?? '', is_core: s.is_core, credits: s.credits, description: s.description ?? '' }); setOpen(true); };

  const handleSave = () => {
    const payload = { ...form, credits: Number(form.credits) };
    if (editing) {
      router.put(`/school/academics/subjects/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Subject updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/academics/subjects', payload, {
        onSuccess: () => { toast({ title: 'Subject created' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    router.delete(`/school/academics/subjects/${deleteId}`, {
      onSuccess: () => { toast({ title: 'Deleted' }); setDeleteOpen(false); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Subjects" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Academic Subjects</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
        </div>
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Curriculum</TableHead><TableHead>Type</TableHead><TableHead>Credits</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {(subjects ?? []).map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.code}</TableCell>
                    <TableCell>{s.curriculum?.name ?? '—'}</TableCell>
                    <TableCell><Badge variant={s.is_core ? 'default' : 'secondary'}>{s.is_core ? 'Core' : 'Elective'}</Badge></TableCell>
                    <TableCell>{s.credits}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => { setDeleteId(s.id); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(subjects ?? []).length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No subjects yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Subject' : 'Add Subject'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
              <div><Label>Curriculum</Label>
                <Select value={form.curriculum_id} onValueChange={v => setForm(f => ({ ...f, curriculum_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                  <SelectContent>{(curricula ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Credits</Label><Input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.is_core} onCheckedChange={v => setForm(f => ({ ...f, is_core: !!v }))} id="is_core" /><Label htmlFor="is_core">Core Subject</Label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Subject</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};
export default Subjects;
