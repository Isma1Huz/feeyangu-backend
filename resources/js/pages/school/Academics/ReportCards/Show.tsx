import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface SubjectResult {
    subject_name: string;
    marks: number | null;
    max_marks: number;
    grade: string | null;
    percentage: number | null;
    is_absent: boolean;
}

interface ReportCard {
    student: {
        id: number;
        full_name: string;
        admission_number: string;
        class_name: string | null;
    };
    exam: {
        id: number;
        name: string;
        term: number;
        year: number;
    };
    results: SubjectResult[];
    total_marks: number;
    total_max_marks: number;
    percentage: number;
    overall_grade: string;
    rank: number | null;
}

interface Props extends InertiaSharedProps {
    reportCard: ReportCard;
}

const ReportCardShow: React.FC = () => {
    const { reportCard } = usePage<Props>().props;

    const handlePrint = () => window.print();

    return (
        <AppLayout>
            <Head title="Report Card" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/school/academics/report-cards">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-1" />Back
                            </Button>
                        </Link>
                        <div>
                            <p className="text-sm text-muted-foreground">Academics &rsaquo; Report Cards</p>
                            <h1 className="text-2xl font-bold">Report Card</h1>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                </div>

                {/* Student Info */}
                <Card>
                    <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{reportCard?.student?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Admission No</p>
                                <p className="font-medium">{reportCard?.student?.admission_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Class</p>
                                <p className="font-medium">{reportCard?.student?.class_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Exam</p>
                                <p className="font-medium">
                                    {reportCard?.exam?.name} — Term {reportCard?.exam?.term}, {reportCard?.exam?.year}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subject Results */}
                <Card>
                    <CardHeader><CardTitle>Subject Results</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Max Marks</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(reportCard?.results ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No results available.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(reportCard?.results ?? []).map((r, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{r.subject_name}</TableCell>
                                        <TableCell>{r.is_absent ? '—' : (r.marks ?? '—')}</TableCell>
                                        <TableCell>{r.max_marks}</TableCell>
                                        <TableCell>
                                            {r.is_absent ? '—' : (r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—')}
                                        </TableCell>
                                        <TableCell>{r.is_absent ? '—' : (r.grade ?? '—')}</TableCell>
                                        <TableCell>
                                            {r.is_absent
                                                ? <Badge variant="destructive">Absent</Badge>
                                                : <Badge variant="default">Present</Badge>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                    <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Marks</p>
                                <p className="text-2xl font-bold">{reportCard?.total_marks ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Out of</p>
                                <p className="text-2xl font-bold">{reportCard?.total_max_marks ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Percentage</p>
                                <p className="text-2xl font-bold">
                                    {reportCard?.percentage != null ? `${reportCard.percentage.toFixed(1)}%` : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Overall Grade</p>
                                <p className="text-2xl font-bold">{reportCard?.overall_grade ?? '—'}</p>
                            </div>
                        </div>
                        {reportCard?.rank != null && (
                            <p className="mt-4 text-sm text-muted-foreground">
                                Class Rank: <span className="font-semibold text-foreground">{reportCard.rank}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ReportCardShow;
