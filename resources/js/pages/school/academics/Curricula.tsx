import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Curriculum { id: number; name: string; code: string; type: 'cbc' | '844' | 'cambridge'; description: string | null; is_active: boolean; subjects_count: number; }
interface Props extends InertiaSharedProps { curricula: Curriculum[]; }

const empty = { name: '', code: '', type: 'cbc' as const, description: '', is_active: true };

const Curricula: React.FC = () => {
  const { toast } = useToast();
  const { curricula } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Curriculum | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Curriculum) => { setEditing(c); setForm({ name: c.name, code: c.code, type: c.type, description: c.description ?? '', is_active: c.is_active }); setOpen(true); };
  const confirmDelete = (id: number) => { setDeleteId(id); setDeleteOpen(true); };

  const handleSave = () => {
    const payload = { ...form };
    if (editing) {
      router.put(`/school/academics/curricula/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Curriculum updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/academics/curricula', payload, {
        onSuccess: () => { toast({ title: 'Curriculum created' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    router.delete(`/school/academics/curricula/${deleteId}`, {
      onSuccess: () => { toast({ title: 'Deleted' }); setDeleteOpen(false); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Curricula" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Curricula</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Curriculum</Button>
        </div>
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Subjects</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {(curricula ?? []).map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.code}</TableCell>
                    <TableCell className="uppercase">{c.type}</TableCell>
                    <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>{c.subjects_count}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete(c.id)}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(curricula ?? []).length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No curricula yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Curriculum' : 'Add Curriculum'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cbc">CBC</SelectItem><SelectItem value="844">8-4-4</SelectItem><SelectItem value="cambridge">Cambridge</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: !!v }))} id="is_active" /><Label htmlFor="is_active">Active</Label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Curriculum</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};
export default Curricula;
