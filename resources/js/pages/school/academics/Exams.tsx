import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface AcademicExam { id: number; name: string; type: string; term: number; year: number; start_date: string | null; end_date: string | null; status: 'draft' | 'published' | 'in_progress' | 'completed'; papers_count: number; }
interface AcademicSubject { id: number; name: string; }
interface Props extends InertiaSharedProps { exams: AcademicExam[]; subjects: AcademicSubject[]; }

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' => {
  if (s === 'published') return 'default';
  if (s === 'in_progress') return 'default';
  if (s === 'completed') return 'secondary';
  return 'secondary';
};

const empty = { name: '', type: 'end_term', term: '1', year: String(new Date().getFullYear()), start_date: '', end_date: '' };

const Exams: React.FC = () => {
  const { toast } = useToast();
  const { exams } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicExam | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (e: AcademicExam) => { setEditing(e); setForm({ name: e.name, type: e.type, term: String(e.term), year: String(e.year), start_date: e.start_date ?? '', end_date: e.end_date ?? '' }); setOpen(true); };

  const handleSave = () => {
    const payload = { ...form, term: Number(form.term), year: Number(form.year) };
    if (editing) {
      router.put(`/school/academics/exams/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Exam updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/academics/exams', payload, {
        onSuccess: () => { toast({ title: 'Exam created' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    router.delete(`/school/academics/exams/${deleteId}`, {
      onSuccess: () => { toast({ title: 'Deleted' }); setDeleteOpen(false); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  const handlePublish = (id: number) => {
    router.post(`/school/academics/exams/${id}/publish`, {}, {
      onSuccess: () => toast({ title: 'Exam published' }),
      onError: () => toast({ title: 'Error', description: 'Failed to publish.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Exams" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Exams</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Exam</Button>
        </div>
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Term</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead><TableHead>Papers</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {(exams ?? []).map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="capitalize">{e.type.replace('_', ' ')}</TableCell>
                    <TableCell>Term {e.term}</TableCell>
                    <TableCell>{e.year}</TableCell>
                    <TableCell><Badge variant={statusVariant(e.status)}>{e.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{e.papers_count}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/school/academics/exams/${e.id}`}><Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button></Link>
                        <Button size="sm" variant="outline" onClick={() => openEdit(e)}><Pencil className="h-3 w-3" /></Button>
                        {e.status === 'draft' && <Button size="sm" variant="default" onClick={() => handlePublish(e.id)}>Publish</Button>}
                        <Button size="sm" variant="destructive" onClick={() => { setDeleteId(e.id); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(exams ?? []).length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No exams yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Exam' : 'Add Exam'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cat">CAT</SelectItem><SelectItem value="end_term">End Term</SelectItem><SelectItem value="mock">Mock</SelectItem><SelectItem value="final">Final</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Term</Label>
                <Select value={form.term} onValueChange={v => setForm(f => ({ ...f, term: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">Term 1</SelectItem><SelectItem value="2">Term 2</SelectItem><SelectItem value="3">Term 3</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Exam</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};
export default Exams;
