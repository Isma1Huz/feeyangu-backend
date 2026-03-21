import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface Student {
    id: number;
    full_name: string;
    admission_number: string;
}

export interface MarkRow {
    student_id: number;
    marks: string;
    is_absent: boolean;
    remarks: string;
}

interface Props {
    students: Student[];
    marks: Record<number, MarkRow>;
    maxMarks: number;
    onChange: (studentId: number, field: keyof MarkRow, value: string | boolean) => void;
    disabled?: boolean;
}

const MarksGrid: React.FC<Props> = ({ students, marks, maxMarks, onChange, disabled = false }) => {
    const getRowClass = (studentId: number) => {
        const row = marks[studentId];
        if (!row) return '';
        if (row.is_absent) return 'bg-red-50 dark:bg-red-950/20';
        const val = Number(row.marks);
        if (row.marks !== '' && (val < 0 || val > maxMarks)) return 'bg-amber-50 dark:bg-amber-950/20';
        return '';
    };

    const getCellClass = (studentId: number) => {
        const row = marks[studentId];
        if (!row || row.is_absent) return '';
        const val = Number(row.marks);
        if (row.marks !== '' && (val < 0 || val > maxMarks)) return 'border-amber-500 focus:ring-amber-500';
        return '';
    };

    return (
        <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-muted border-b">
                        <th className="text-left p-2 w-32 font-medium">Adm No</th>
                        <th className="text-left p-2 font-medium">Student Name</th>
                        <th className="text-center p-2 w-28 font-medium">
                            Marks <span className="text-muted-foreground">(/{maxMarks})</span>
                        </th>
                        <th className="text-center p-2 w-20 font-medium">Absent</th>
                        <th className="text-left p-2 font-medium">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center p-4 text-muted-foreground">
                                No students enrolled.
                            </td>
                        </tr>
                    )}
                    {students.map((student, i) => (
                        <tr key={student.id} className={cn('border-b transition-colors', getRowClass(student.id), i % 2 === 0 ? '' : 'bg-muted/20')}>
                            <td className="p-2 font-mono text-xs">{student.admission_number}</td>
                            <td className="p-2 font-medium">{student.full_name}</td>
                            <td className="p-2">
                                <Input
                                    type="number"
                                    className={cn('h-8 w-24 text-center mx-auto', getCellClass(student.id))}
                                    value={marks[student.id]?.marks ?? ''}
                                    disabled={disabled || marks[student.id]?.is_absent}
                                    min={0}
                                    max={maxMarks}
                                    onChange={e => onChange(student.id, 'marks', e.target.value)}
                                    placeholder="—"
                                />
                            </td>
                            <td className="p-2 text-center">
                                <Checkbox
                                    checked={marks[student.id]?.is_absent ?? false}
                                    disabled={disabled}
                                    onCheckedChange={v => onChange(student.id, 'is_absent', Boolean(v))}
                                />
                            </td>
                            <td className="p-2">
                                <Input
                                    className="h-8"
                                    value={marks[student.id]?.remarks ?? ''}
                                    disabled={disabled}
                                    placeholder="Optional remarks"
                                    onChange={e => onChange(student.id, 'remarks', e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MarksGrid;
