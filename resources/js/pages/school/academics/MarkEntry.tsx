import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface ExamPaperProps { id: number; name: string; max_marks: number; exam: { id: number; name: string }; subject: { id: number; name: string }; }
interface StudentMarkEntry { id: number; full_name: string; admission_number: string; marks: number | null; grade: string | null; is_absent: boolean; }
interface Props extends InertiaSharedProps { examPaper: ExamPaperProps; students: StudentMarkEntry[]; }

const MarkEntry: React.FC = () => {
  const { toast } = useToast();
  const { examPaper, students: initialStudents } = usePage<Props>().props;
  const [marks, setMarks] = useState<Record<number, { marks: string; is_absent: boolean; remarks: string }>>(() => {
    const init: Record<number, { marks: string; is_absent: boolean; remarks: string }> = {};
    (initialStudents ?? []).forEach(s => { init[s.id] = { marks: s.marks != null ? String(s.marks) : '', is_absent: s.is_absent, remarks: '' }; });
    return init;
  });

  const handleSave = () => {
    const payload = (initialStudents ?? []).map(s => ({
      student_id: s.id,
      marks: marks[s.id]?.is_absent ? null : Number(marks[s.id]?.marks ?? 0),
      is_absent: marks[s.id]?.is_absent ?? false,
      remarks: marks[s.id]?.remarks ?? '',
    }));
    router.post(`/school/academics/exam-papers/${examPaper?.id}/marks`, { marks: payload }, {
      onSuccess: () => toast({ title: 'Marks saved successfully' }),
      onError: () => toast({ title: 'Error', description: 'Failed to save marks.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  return (
    <AppLayout>
      <Head title="Mark Entry" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/school/academics/exams/${examPaper?.exam?.id}`}><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold">{examPaper?.name}</h1>
            <p className="text-muted-foreground">{examPaper?.exam?.name} &mdash; {examPaper?.subject?.name} &mdash; Max: {examPaper?.max_marks}</p>
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Student Marks</CardTitle>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Marks</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Admission No</TableHead><TableHead>Student Name</TableHead><TableHead>Marks</TableHead><TableHead>Absent</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>
                {(initialStudents ?? []).map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.admission_number}</TableCell>
                    <TableCell>{s.full_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        value={marks[s.id]?.marks ?? ''}
                        disabled={marks[s.id]?.is_absent}
                        min={0}
                        max={examPaper?.max_marks}
                        onChange={e => setMarks(m => ({ ...m, [s.id]: { ...m[s.id], marks: e.target.value } }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={marks[s.id]?.is_absent ?? false}
                        onCheckedChange={v => setMarks(m => ({ ...m, [s.id]: { ...m[s.id], is_absent: !!v, marks: !!v ? '' : m[s.id]?.marks ?? '' } }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={marks[s.id]?.remarks ?? ''}
                        placeholder="Optional"
                        onChange={e => setMarks(m => ({ ...m, [s.id]: { ...m[s.id], remarks: e.target.value } }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(initialStudents ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No students enrolled</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
export default MarkEntry;
