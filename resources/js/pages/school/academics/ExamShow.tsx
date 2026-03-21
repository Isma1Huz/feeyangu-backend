import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface ExamPaper { id: number; name: string; subject: { id: number; name: string }; max_marks: number; marks_entered: number; average: number; }
interface ExamResultRow { student_id: number; student_name: string; admission_number: string; total_marks: number; percentage: number; grade: string; rank: number; }
interface Exam { id: number; name: string; type: string; term: number; year: number; start_date: string | null; end_date: string | null; status: string; papers: ExamPaper[]; }
interface Props extends InertiaSharedProps { exam: Exam; results: ExamResultRow[] | null; }

const statusVariant = (s: string): 'default' | 'secondary' => {
  if (s === 'published' || s === 'in_progress') return 'default';
  return 'secondary';
};

const ExamShow: React.FC = () => {
  const { exam, results } = usePage<Props>().props;

  return (
    <AppLayout>
      <Head title={exam?.name ?? 'Exam'} />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/school/academics/exams"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
          <h1 className="text-2xl font-bold">{exam?.name}</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Type</CardTitle></CardHeader><CardContent className="capitalize">{exam?.type?.replace('_', ' ')}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Term</CardTitle></CardHeader><CardContent>Term {exam?.term}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Year</CardTitle></CardHeader><CardContent>{exam?.year}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader><CardContent><Badge variant={statusVariant(exam?.status ?? '')}>{exam?.status?.replace('_', ' ')}</Badge></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Exam Papers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Paper Name</TableHead><TableHead>Max Marks</TableHead><TableHead>Marks Entered</TableHead><TableHead>Average</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {(exam?.papers ?? []).map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.subject?.name}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.max_marks}</TableCell>
                    <TableCell>{p.marks_entered}</TableCell>
                    <TableCell>{typeof p.average === 'number' ? p.average.toFixed(1) : '—'}</TableCell>
                    <TableCell>
                      <Link href={`/school/academics/exam-papers/${p.id}/marks`}>
                        <Button size="sm">Enter Marks</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {(exam?.papers ?? []).length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No papers yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {results && results.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Published Results</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map(r => (
                    <TableRow key={r.student_id}>
                      <TableCell className="font-medium">{r.rank}</TableCell>
                      <TableCell>{r.admission_number}</TableCell>
                      <TableCell>{r.student_name}</TableCell>
                      <TableCell>{r.total_marks}</TableCell>
                      <TableCell>{r.percentage?.toFixed(1)}%</TableCell>
                      <TableCell><Badge variant="secondary">{r.grade}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
export default ExamShow;
