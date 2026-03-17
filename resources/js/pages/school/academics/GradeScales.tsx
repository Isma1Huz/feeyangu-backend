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
import { Plus, Pencil, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Level { grade: string; min: number; max: number; remarks?: string; }
interface GradeScale { id: number; name: string; is_default: boolean; levels: Level[]; curriculum: { id: number; name: string } | null; }
interface Curriculum { id: number; name: string; }
interface Props extends InertiaSharedProps { gradeScales: GradeScale[]; curricula: Curriculum[]; }

const emptyForm = { name: '', curriculum_id: '', is_default: false, levels: [{ grade: '', min: 0, max: 100, remarks: '' }] as Level[] };

const GradeScales: React.FC = () => {
  const { toast } = useToast();
  const { gradeScales, curricula } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<GradeScale | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (gs: GradeScale) => {
    setEditing(gs);
    setForm({ name: gs.name, curriculum_id: gs.curriculum?.id?.toString() ?? '', is_default: gs.is_default, levels: gs.levels?.length ? gs.levels.map(l => ({ ...l, remarks: l.remarks ?? '' })) : [{ grade: '', min: 0, max: 100, remarks: '' }] });
    setOpen(true);
  };

  const addLevel = () => setForm(f => ({ ...f, levels: [...f.levels, { grade: '', min: 0, max: 100, remarks: '' }] }));
  const removeLevel = (i: number) => setForm(f => ({ ...f, levels: f.levels.filter((_, idx) => idx !== i) }));
  const updateLevel = (i: number, key: keyof Level, value: string | number) => setForm(f => ({ ...f, levels: f.levels.map((l, idx) => idx === i ? { ...l, [key]: value } : l) }));

  const handleSave = () => {
    const payload = { ...form, levels: form.levels };
    if (editing) {
      router.put(`/school/academics/grade-scales/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Grade scale updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/academics/grade-scales', payload, {
        onSuccess: () => { toast({ title: 'Grade scale created' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    router.delete(`/school/academics/grade-scales/${deleteId}`, {
      onSuccess: () => { toast({ title: 'Deleted' }); setDeleteOpen(false); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Grade Scales" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Grade Scales</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Grade Scale</Button>
        </div>
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Curriculum</TableHead><TableHead>Levels</TableHead><TableHead>Default</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {(gradeScales ?? []).map(gs => (
                  <TableRow key={gs.id}>
                    <TableCell className="font-medium">{gs.name}</TableCell>
                    <TableCell>{gs.curriculum?.name ?? '—'}</TableCell>
                    <TableCell>{gs.levels?.length ?? 0}</TableCell>
                    <TableCell>{gs.is_default ? <Badge variant="default">Default</Badge> : null}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(gs)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => { setDeleteId(gs.id); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(gradeScales ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No grade scales yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Edit Grade Scale' : 'Add Grade Scale'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Curriculum</Label>
                <Select value={form.curriculum_id} onValueChange={v => setForm(f => ({ ...f, curriculum_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                  <SelectContent>{(curricula ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Checkbox checked={form.is_default} onCheckedChange={v => setForm(f => ({ ...f, is_default: !!v }))} id="is_default" /><Label htmlFor="is_default">Set as Default</Label></div>
              <div>
                <div className="flex items-center justify-between mb-2"><Label>Grade Levels</Label><Button type="button" size="sm" variant="outline" onClick={addLevel}><PlusCircle className="h-3 w-3 mr-1" />Add Level</Button></div>
                <div className="space-y-2">
                  {form.levels.map((level, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <Input placeholder="Grade" value={level.grade} onChange={e => updateLevel(i, 'grade', e.target.value)} />
                      <Input type="number" placeholder="Min" value={level.min} onChange={e => updateLevel(i, 'min', Number(e.target.value))} />
                      <Input type="number" placeholder="Max" value={level.max} onChange={e => updateLevel(i, 'max', Number(e.target.value))} />
                      <Input placeholder="Remarks" value={level.remarks ?? ''} onChange={e => updateLevel(i, 'remarks', e.target.value)} />
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeLevel(i)} disabled={form.levels.length <= 1}><MinusCircle className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Grade Scale</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};
export default GradeScales;
