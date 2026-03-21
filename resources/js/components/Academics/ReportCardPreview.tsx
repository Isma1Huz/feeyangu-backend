import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, X } from 'lucide-react';

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
        full_name: string;
        admission_number: string;
        class_name?: string | null;
    };
    exam: {
        name: string;
        term: number;
        year: number;
    };
    results: SubjectResult[];
    total_marks: number;
    total_max_marks: number;
    percentage: number;
    overall_grade: string;
    rank?: number | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportCard: ReportCard | null;
}

const ReportCardPreview: React.FC<Props> = ({ open, onOpenChange, reportCard }) => {
    const handlePrint = () => {
        window.print();
    };

    if (!reportCard) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Report Card Preview</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 print:block" id="report-card-content">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                        <h2 className="text-xl font-bold">{reportCard.exam.name}</h2>
                        <p className="text-muted-foreground">Term {reportCard.exam.term}, {reportCard.exam.year}</p>
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Student: </span>
                            <span className="font-medium">{reportCard.student.full_name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Adm No: </span>
                            <span className="font-medium">{reportCard.student.admission_number}</span>
                        </div>
                        {reportCard.student.class_name && (
                            <div>
                                <span className="text-muted-foreground">Class: </span>
                                <span className="font-medium">{reportCard.student.class_name}</span>
                            </div>
                        )}
                        {reportCard.rank && (
                            <div>
                                <span className="text-muted-foreground">Rank: </span>
                                <span className="font-medium">{reportCard.rank}</span>
                            </div>
                        )}
                    </div>

                    {/* Results Table */}
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted">
                                <th className="border p-2 text-left">Subject</th>
                                <th className="border p-2 text-center">Marks</th>
                                <th className="border p-2 text-center">Max</th>
                                <th className="border p-2 text-center">%</th>
                                <th className="border p-2 text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportCard.results.map((r, i) => (
                                <tr key={i} className="border-b">
                                    <td className="border p-2 font-medium">{r.subject_name}</td>
                                    <td className="border p-2 text-center">
                                        {r.is_absent ? <Badge variant="destructive" className="text-xs">Absent</Badge> : (r.marks ?? '—')}
                                    </td>
                                    <td className="border p-2 text-center">{r.max_marks}</td>
                                    <td className="border p-2 text-center">
                                        {r.is_absent ? '—' : (r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—')}
                                    </td>
                                    <td className="border p-2 text-center font-bold">{r.is_absent ? '—' : (r.grade ?? '—')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-muted font-medium">
                                <td className="border p-2">Total</td>
                                <td className="border p-2 text-center">{reportCard.total_marks}</td>
                                <td className="border p-2 text-center">{reportCard.total_max_marks}</td>
                                <td className="border p-2 text-center">{reportCard.percentage.toFixed(1)}%</td>
                                <td className="border p-2 text-center text-lg">{reportCard.overall_grade}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4 mr-2" />Close
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportCardPreview;
