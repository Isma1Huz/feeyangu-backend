import React from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface PromotionItem {
    id: number;
    student: { id: number; full_name: string; admission_number: string };
    fromClass: { id: number; name: string } | null;
    toClass: { id: number; name: string } | null;
    status: 'pending' | 'promoted' | 'skipped';
}

interface PromotionBatch {
    id: number;
    from_year: number;
    to_year: number;
    status: 'pending' | 'completed' | 'rolled_back';
    notes: string | null;
    items: PromotionItem[];
    created_at: string;
}

interface Props extends InertiaSharedProps {
    batch: PromotionBatch;
}

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' => {
    if (s === 'completed' || s === 'promoted') return 'default';
    if (s === 'rolled_back') return 'destructive';
    return 'secondary';
};

const PromotionShow: React.FC = () => {
    const { toast } = useToast();
    const { batch } = usePage<Props>().props;

    const handleExecute = () => {
        router.post(`/school/academics/promotion/${batch?.id}/execute`, {}, {
            onSuccess: () => toast({ title: 'Promotion executed successfully' }),
            onError: () => toast({ title: 'Error', description: 'Failed to execute promotion.', variant: 'destructive' } as any),
            preserveState: false,
        });
    };

    const handleRollback = () => {
        router.post(`/school/academics/promotion/${batch?.id}/rollback`, {}, {
            onSuccess: () => toast({ title: 'Promotion rolled back' }),
            onError: () => toast({ title: 'Error', description: 'Failed to rollback promotion.', variant: 'destructive' } as any),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Promotion Batch" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/school/academics/promotion">
                            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                        </Link>
                        <div>
                            <p className="text-sm text-muted-foreground">Academics &rsaquo; Promotion</p>
                            <h1 className="text-2xl font-bold">
                                Promotion: {batch?.from_year} → {batch?.to_year}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {batch?.status === 'pending' && (
                            <Button onClick={handleExecute} className="bg-green-600 hover:bg-green-700">
                                <Play className="h-4 w-4 mr-2" />Execute Promotion
                            </Button>
                        )}
                        {batch?.status === 'completed' && (
                            <Button variant="destructive" onClick={handleRollback}>
                                <RotateCcw className="h-4 w-4 mr-2" />Rollback
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">From Year</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{batch?.from_year}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">To Year</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{batch?.to_year}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Students</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{batch?.items?.length ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
                        <CardContent>
                            <Badge variant={statusVariant(batch?.status ?? '')} className="capitalize">
                                {batch?.status?.replace('_', ' ')}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {batch?.notes && (
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{batch.notes}</CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader><CardTitle>Promotion Items ({batch?.items?.length ?? 0} students)</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admission No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>From Class</TableHead>
                                    <TableHead>To Class</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(batch?.items ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No items in this batch.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(batch?.items ?? []).map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.student?.admission_number}</TableCell>
                                        <TableCell className="font-medium">{item.student?.full_name}</TableCell>
                                        <TableCell>{item.fromClass?.name ?? '—'}</TableCell>
                                        <TableCell>{item.toClass?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(item.status)} className="capitalize">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default PromotionShow;
