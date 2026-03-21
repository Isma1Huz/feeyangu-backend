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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface AcademicClass {
    id: number;
    name: string;
    code: string;
    academic_year: string;
    is_active: boolean;
    curriculum: { id: number; name: string } | null;
    class_teacher: { id: number; name: string } | null;
    streams_count: number;
}

interface Curriculum { id: number; name: string; }
interface Teacher { id: number; name: string; }

interface Props extends InertiaSharedProps {
    classes: AcademicClass[];
    curricula: Curriculum[];
    teachers: Teacher[];
}

const empty = {
    name: '',
    code: '',
    curriculum_id: '',
    class_teacher_id: '',
    academic_year: new Date().getFullYear().toString(),
    is_active: true,
};

const Classes: React.FC = () => {
    const { toast } = useToast();
    const { classes, curricula, teachers } = usePage<Props>().props;
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editing, setEditing] = useState<AcademicClass | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);

    const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
    const openEdit = (c: AcademicClass) => {
        setEditing(c);
        setForm({
            name: c.name,
            code: c.code,
            curriculum_id: c.curriculum?.id?.toString() ?? '',
            class_teacher_id: c.class_teacher?.id?.toString() ?? '',
            academic_year: c.academic_year,
            is_active: c.is_active,
        });
        setOpen(true);
    };
    const confirmDelete = (id: number) => { setDeleteId(id); setDeleteOpen(true); };

    const handleSave = () => {
        const payload = {
            ...form,
            curriculum_id: form.curriculum_id ? Number(form.curriculum_id) : null,
            class_teacher_id: form.class_teacher_id ? Number(form.class_teacher_id) : null,
        };
        if (editing) {
            router.put(`/school/academics/academic-classes/${editing.id}`, payload, {
                onSuccess: () => { toast({ title: 'Class updated' }); setOpen(false); },
                onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
                preserveState: false,
            });
        } else {
            router.post('/school/academics/academic-classes', payload, {
                onSuccess: () => { toast({ title: 'Class created' }); setOpen(false); },
                onError: () => toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' } as any),
                preserveState: false,
            });
        }
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/school/academics/academic-classes/${deleteId}`, {
            onSuccess: () => { toast({ title: 'Deleted' }); setDeleteOpen(false); },
            onError: () => toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' } as any),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Academic Classes" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Academic Classes</h1>
                    <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Class</Button>
                </div>
                <Card>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Curriculum</TableHead>
                                    <TableHead>Class Teacher</TableHead>
                                    <TableHead>Streams</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(classes ?? []).map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.code}</TableCell>
                                        <TableCell>{c.academic_year}</TableCell>
                                        <TableCell>{c.curriculum?.name ?? '—'}</TableCell>
                                        <TableCell>{c.class_teacher?.name ?? '—'}</TableCell>
                                        <TableCell>{c.streams_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.is_active ? 'default' : 'secondary'}>
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => confirmDelete(c.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(classes ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">No academic classes yet</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Create / Edit Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Edit Class' : 'Add Class'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Code</Label>
                                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Academic Year</Label>
                                <Input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} placeholder="e.g. 2024" />
                            </div>
                            <div>
                                <Label>Curriculum</Label>
                                <Select value={form.curriculum_id} onValueChange={v => setForm(f => ({ ...f, curriculum_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                                    <SelectContent>
                                        {(curricula ?? []).map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Class Teacher</Label>
                                <Select value={form.class_teacher_id} onValueChange={v => setForm(f => ({ ...f, class_teacher_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                    <SelectContent>
                                        {(teachers ?? []).map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={form.is_active}
                                    onCheckedChange={v => setForm(f => ({ ...f, is_active: Boolean(v) }))}
                                />
                                <Label>Active</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Class</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this class? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default Classes;
