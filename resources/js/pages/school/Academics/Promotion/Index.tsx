import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface PromotionBatch {
    id: number;
    from_year: number;
    to_year: number;
    status: 'pending' | 'completed' | 'rolled_back';
    notes: string | null;
    items_count: number;
    created_at: string;
}

interface Props extends InertiaSharedProps {
    batches: PromotionBatch[];
}

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' => {
    if (s === 'completed') return 'default';
    if (s === 'rolled_back') return 'destructive';
    return 'secondary';
};

const emptyForm = { from_year: String(new Date().getFullYear()), to_year: String(new Date().getFullYear() + 1), notes: '' };

const PromotionIndex: React.FC = () => {
    const { toast } = useToast();
    const { batches } = usePage<Props>().props;
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const handleCreate = () => {
        router.post('/school/academics/promotion', {
            from_year: Number(form.from_year),
            to_year: Number(form.to_year),
            notes: form.notes || null,
        }, {
            onSuccess: () => { toast({ title: 'Promotion batch created' }); setOpen(false); },
            onError: () => toast({ title: 'Error', description: 'Failed to create promotion batch.', variant: 'destructive' } as any),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Promotion" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Academics &rsaquo; Promotion</p>
                        <h1 className="text-2xl font-bold">Student Promotion</h1>
                    </div>
                    <Button onClick={() => { setForm(emptyForm); setOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />New Promotion Batch
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From Year</TableHead>
                                    <TableHead>To Year</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(batches ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No promotion batches yet. Create one to promote students to the next academic year.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(batches ?? []).map(b => (
                                    <TableRow key={b.id}>
                                        <TableCell>{b.from_year}</TableCell>
                                        <TableCell>{b.to_year}</TableCell>
                                        <TableCell>{b.items_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(b.status)} className="capitalize">
                                                {b.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{b.notes ?? '—'}</TableCell>
                                        <TableCell>{b.created_at}</TableCell>
                                        <TableCell>
                                            <Link href={`/school/academics/promotion/${b.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-3 w-3 mr-1" />View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Promotion Batch</DialogTitle>
                        <DialogDescription>
                            Promote all students from one academic year to the next.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>From Year</Label>
                            <Input
                                type="number"
                                value={form.from_year}
                                onChange={e => setForm(f => ({ ...f, from_year: e.target.value }))}
                                placeholder="e.g. 2024"
                            />
                        </div>
                        <div>
                            <Label>To Year</Label>
                            <Input
                                type="number"
                                value={form.to_year}
                                onChange={e => setForm(f => ({ ...f, to_year: e.target.value }))}
                                placeholder="e.g. 2025"
                            />
                        </div>
                        <div>
                            <Label>Notes (optional)</Label>
                            <Textarea
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                placeholder="Any notes about this promotion batch"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create Batch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default PromotionIndex;
