import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface SubStrand { id: number; name: string; code: string; }
interface StrandRow { id: number; name: string; code: string; sub_strands: SubStrand[]; }
interface LearningAreaRow { id: number; name: string; code: string; description: string | null; sort_order: number; strands: StrandRow[]; }
interface CurriculumInfo { id: number; name: string; type: string; }
interface Props extends InertiaSharedProps {
  curriculum: CurriculumInfo;
  learningAreas: LearningAreaRow[];
}

const emptyForm = { name: '', code: '', description: '' };

const LearningAreas: React.FC = () => {
  const { toast } = useToast();
  const { curriculum, learningAreas } = usePage<Props>().props;
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<LearningAreaRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (la: LearningAreaRow) => {
    setEditing(la);
    setForm({ name: la.name, code: la.code, description: la.description ?? '' });
    setOpen(true);
  };
  const toggleExpand = (id: number) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const payload = { ...form };
    if (editing) {
      router.put(`/school/academics/curricula/${curriculum.id}/learning-areas/${editing.id}`, payload, {
        onSuccess: () => { toast({ title: 'Learning area updated' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post(`/school/academics/curricula/${curriculum.id}/learning-areas`, payload, {
        onSuccess: () => { toast({ title: 'Learning area created' }); setOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/school/academics/curricula/${curriculum.id}/learning-areas/${id}`, {
      onSuccess: () => { toast({ title: 'Learning area deleted' }); setDeleteId(null); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Learning Areas" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Academics &rsaquo; Curricula &rsaquo; {curriculum.name} &rsaquo; Learning Areas
            </p>
            <h1 className="text-2xl font-bold">Learning Areas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Curriculum: <span className="font-medium">{curriculum.name}</span>
              <Badge variant="secondary" className="ml-2 uppercase text-xs">{curriculum.type}</Badge>
            </p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Learning Area</Button>
        </div>

        <Card>
          <CardContent className="pt-4">
            {(learningAreas ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No learning areas yet. Add one to get started.</p>
            ) : (
              <div className="space-y-2">
                {(learningAreas ?? []).map(la => (
                  <div key={la.id} className="border rounded-md">
                    {/* Learning Area Header */}
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(la.id)}>
                      <div className="flex items-center gap-2">
                        {expanded[la.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-semibold">{la.name}</span>
                        <Badge variant="outline" className="text-xs">{la.code}</Badge>
                        <Badge variant="secondary" className="text-xs">{la.strands?.length ?? 0} strands</Badge>
                      </div>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(la)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(la.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>

                    {/* Expanded: Strands */}
                    {expanded[la.id] && (
                      <div className="border-t bg-muted/20 px-4 py-2 space-y-2">
                        {la.description && <p className="text-sm text-muted-foreground mb-2">{la.description}</p>}
                        {(la.strands ?? []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">No strands defined.</p>
                        ) : (
                          (la.strands ?? []).map(strand => (
                            <div key={strand.id} className="border rounded bg-background">
                              <div className="flex items-center gap-2 p-2">
                                <span className="font-medium text-sm">{strand.name}</span>
                                <Badge variant="outline" className="text-xs">{strand.code}</Badge>
                                <Badge variant="secondary" className="text-xs">{strand.sub_strands?.length ?? 0} sub-strands</Badge>
                              </div>
                              {(strand.sub_strands ?? []).length > 0 && (
                                <div className="border-t px-4 py-1 space-y-1 bg-muted/10">
                                  {(strand.sub_strands ?? []).map(ss => (
                                    <div key={ss.id} className="flex items-center gap-2 text-sm py-0.5">
                                      <span className="text-muted-foreground">›</span>
                                      <span>{ss.name}</span>
                                      <Badge variant="outline" className="text-xs">{ss.code}</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Learning Area' : 'Add Learning Area'}</DialogTitle>
            <DialogDescription>Define a learning area for the {curriculum.name} curriculum.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <Label>Code *</Label>
              <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. MATH" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
            </div>
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
            <DialogTitle>Delete Learning Area</DialogTitle>
            <DialogDescription>This will also delete all strands and sub-strands. This action cannot be undone.</DialogDescription>
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

export default LearningAreas;
