import React, { useMemo } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import type { Student, Payment } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

interface Props extends InertiaSharedProps {
  studentId: string;
  students: Student[];
  payments: Payment[];
}

const StudentDetail: React.FC = () => {
  const { COMMON_TEXT, PAYMENT_METHOD_LABELS, HEADER, STUDENTS_TEXT, PAYMENTS_TEXT } = useT();
  const { studentId, students, payments: allPayments } = usePage<Props>().props;
  const student = students.find(s => s.id === studentId);
  const payments = useMemo(() => allPayments.filter(p => p.studentId === studentId), [studentId, allPayments]);

  if (!student) {
    return (
      <>
        <Head title="Student Not Found" />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-muted-foreground">{HEADER.studentNotFound}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.visit('/school/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />{COMMON_TEXT.actions.back}
          </Button>
        </div>
      </>
    );
  }

  const pct = Math.round((student.paidFees / student.totalFees) * 100);

  return (
    <>
      <Head title={`${student.firstName} ${student.lastName}`} />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.visit('/school/students')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
            <p className="text-muted-foreground text-sm">{student.admissionNumber} · {student.grade} {student.className}</p>
          </div>
          <div className="ml-auto"><StatusBadge status={student.status} /></div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">{HEADER.studentInfo}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">{STUDENTS_TEXT.table.admissionNo}</span><span className="font-mono-amount">{student.admissionNumber}</span>
              <span className="text-muted-foreground">{STUDENTS_TEXT.table.grade}</span><span>{student.grade}</span>
              <span className="text-muted-foreground">{STUDENTS_TEXT.table.class}</span><span>{student.className}</span>
              <span className="text-muted-foreground">{STUDENTS_TEXT.table.status}</span><StatusBadge status={student.status} />
            </div>
            <Separator />
            <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Parent / Guardian</p>
            <p className="font-medium">{student.parentName}</p>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{student.parentEmail}</div>
          </CardContent>
        </Card>

        {/* Fee Status */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">{HEADER.feeStatus}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{HEADER.totalFees}</p>
                <p className="text-lg font-bold font-mono-amount">{COMMON_TEXT.currency} {student.totalFees.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground">{HEADER.paid}</p>
                <p className="text-lg font-bold font-mono-amount text-secondary">{COMMON_TEXT.currency} {student.paidFees.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-xs text-muted-foreground">{HEADER.balanceLabel}</p>
                <p className="text-lg font-bold font-mono-amount text-destructive">{COMMON_TEXT.currency} {student.balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{HEADER.paymentProgress}</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{HEADER.paymentHistory}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{HEADER.noPaymentsYet}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{PAYMENTS_TEXT.table.date}</TableHead>
                  <TableHead>{PAYMENTS_TEXT.table.amount}</TableHead>
                  <TableHead>{PAYMENTS_TEXT.table.method}</TableHead>
                  <TableHead>{PAYMENTS_TEXT.table.status}</TableHead>
                  <TableHead>{PAYMENTS_TEXT.table.reference}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.date}</TableCell>
                    <TableCell className="font-mono-amount">{COMMON_TEXT.currency} {p.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-sm font-mono-amount text-muted-foreground">{p.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default StudentDetail;
