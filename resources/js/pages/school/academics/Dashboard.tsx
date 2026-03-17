import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookOpen, ClipboardList, FileText, Zap } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface Stats { total_curricula: number; total_subjects: number; total_exams: number; active_exams: number; }
interface RecentExam { id: number; name: string; type: string; term: number; year: number; status: string; }
interface Props extends InertiaSharedProps { stats: Stats; recentExams: RecentExam[]; }

const statusVariant = (s: string) => s === 'published' ? 'default' : s === 'in_progress' ? 'default' : s === 'completed' ? 'secondary' : 'secondary';

const Dashboard: React.FC = () => {
  const { stats, recentExams } = usePage<Props>().props;
  return (
    <AppLayout>
      <Head title="Academics Dashboard" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Academics Hub</h1>
          <div className="flex gap-2">
            <Link href="/school/academics/curricula"><Button variant="outline">Curricula</Button></Link>
            <Link href="/school/academics/subjects"><Button variant="outline">Subjects</Button></Link>
            <Link href="/school/academics/exams"><Button>Exams</Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Curricula</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_curricula ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Subjects</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_subjects ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Exams</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_exams ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Exams</CardTitle><Zap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.active_exams ?? 0}</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Recent Exams</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Term</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {(recentExams ?? []).map(e => (
                  <TableRow key={e.id}>
                    <TableCell><Link href={`/school/academics/exams/${e.id}`} className="text-blue-600 hover:underline">{e.name}</Link></TableCell>
                    <TableCell className="capitalize">{e.type}</TableCell>
                    <TableCell>Term {e.term}</TableCell>
                    <TableCell>{e.year}</TableCell>
                    <TableCell><Badge variant={statusVariant(e.status)}>{e.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {(recentExams ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No exams yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
export default Dashboard;
