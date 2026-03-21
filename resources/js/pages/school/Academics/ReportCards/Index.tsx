import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface AcademicExam {
    id: number;
    name: string;
    term: number;
    year: number;
    type: string;
}

interface Props extends InertiaSharedProps {
    exams: AcademicExam[];
}

const ReportCardsIndex: React.FC = () => {
    const { toast } = useToast();
    const { exams } = usePage<Props>().props;
    const [generateOpen, setGenerateOpen] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = () => {
        if (!selectedExamId) return;
        setGenerating(true);
        router.post('/school/academics/report-cards/generate', { exam_id: Number(selectedExamId) }, {
            onSuccess: () => {
                toast({ title: 'Report cards generation queued', description: 'Report cards are being generated in the background.' });
                setGenerateOpen(false);
                setSelectedExamId('');
            },
            onError: () => toast({ title: 'Error', description: 'Failed to generate report cards.', variant: 'destructive' } as any),
            onFinish: () => setGenerating(false),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Report Cards" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Academics &rsaquo; Report Cards</p>
                        <h1 className="text-2xl font-bold">Report Cards</h1>
                    </div>
                    <Button onClick={() => setGenerateOpen(true)}>
                        <FileText className="h-4 w-4 mr-2" />Generate Report Cards
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(exams ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No published exams available for report card generation.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(exams ?? []).map(exam => (
                                    <TableRow key={exam.id}>
                                        <TableCell className="font-medium">{exam.name}</TableCell>
                                        <TableCell className="capitalize">{exam.type.replace(/_/g, ' ')}</TableCell>
                                        <TableCell>Term {exam.term}</TableCell>
                                        <TableCell>{exam.year}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => { setSelectedExamId(String(exam.id)); setGenerateOpen(true); }}
                                            >
                                                <RefreshCw className="h-3 w-3 mr-1" />Generate
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Report Cards</DialogTitle>
                        <DialogDescription>
                            Select an exam to generate report cards for all students.
                            This will be processed in the background.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Exam</Label>
                            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                                <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                                <SelectContent>
                                    {(exams ?? []).map(e => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.name} — Term {e.term}, {e.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerate} disabled={!selectedExamId || generating}>
                            {generating ? 'Generating...' : 'Generate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default ReportCardsIndex;
