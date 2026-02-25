import React from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import parentBannerBg from '@/assets/parent-banner-bg.jpg';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Eye, ArrowRight, GraduationCap } from 'lucide-react';

interface Child {
  studentId: string;
  name: string;
  grade: string;
  className: string;
  status: string;
  paidFees: number;
  totalFees: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  studentId: string;
}

interface Props extends InertiaSharedProps {
  children: Child[];
  recentPayments: Payment[];
  recentReceipts: Receipt[];
  totalOutstanding: number;
  totalFees: number;
  totalPaid: number;
}

const ParentDashboard: React.FC = () => {
  const { children, recentPayments, recentReceipts, totalOutstanding, totalFees, totalPaid } = usePage<Props>().props;
  const T = useT();
  const t = T.DASHBOARD_TEXT.parent;
  const COMMON_TEXT = T.COMMON_TEXT;
  const PAYMENT_METHOD_LABELS = T.PAYMENT_METHOD_LABELS;
  const { user } = useAuth();

  return (
    <>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>

      <div className="relative rounded-xl overflow-hidden text-primary-foreground p-6 sm:p-8">
        <img src={parentBannerBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">{t.bannerTitle}</h2>
            <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg">{t.bannerDescription}</p>
          </div>
          <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold gap-2 shrink-0" onClick={() => router.visit('/parent/children')}>
            {t.bannerAction}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">{t.overviewTitle}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.totalFeesDue}</p>
                  <p className="text-2xl font-bold font-mono-amount mt-1 text-foreground">{COMMON_TEXT.currency} {totalFees.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.totalPaid}</p>
                  <p className="text-2xl font-bold font-mono-amount mt-1 text-success">{COMMON_TEXT.currency} {totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-accent border border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.outstandingFees}</p>
                  <p className="text-2xl font-bold font-mono-amount mt-1 text-primary">{COMMON_TEXT.currency} {totalOutstanding.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{t.childrenSection}</h2>
              <Button variant="link" size="sm" className="text-primary gap-1" onClick={() => router.visit('/parent/children')}>
                {T.HEADER.viewAll} <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => {
                const percentage = Math.round((child.paidFees / child.totalFees) * 100);
                const balance = child.totalFees - child.paidFees;
                return (
                  <Card key={child.studentId} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{child.name}</h3>
                            <p className="text-xs text-muted-foreground">{child.grade} · {child.className}</p>
                          </div>
                        </div>
                        <StatusBadge status={child.status} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{T.HEADER.feeProgress}</span>
                          <span className="font-medium font-mono-amount">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{T.HEADER.paid}: <span className="font-mono-amount text-success font-medium">{COMMON_TEXT.currency} {child.paidFees.toLocaleString()}</span></span>
                          <span className="text-muted-foreground">{T.HEADER.balanceLabel}: <span className="font-mono-amount font-semibold">{COMMON_TEXT.currency} {balance.toLocaleString()}</span></span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => router.visit(`/parent/children/${child.studentId}/fees`)}>
                          <Eye className="h-3.5 w-3.5" />{t.viewFees}
                        </Button>
                        {balance > 0 && (
                          <Button size="sm" className="flex-1 gap-1" onClick={() => router.visit(`/parent/children/${child.studentId}/fees`)}>
                            <CreditCard className="h-3.5 w-3.5" />{t.quickPay}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{T.HEADER.childrenSummary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {children.map((child) => (
                <div key={child.studentId} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => router.visit(`/parent/children/${child.studentId}/fees`)}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{child.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.grade}</p>
                  </div>
                  <StatusBadge status={child.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{T.HEADER.recentReceipts}</CardTitle>
                <Button variant="link" size="sm" className="text-primary text-xs p-0 h-auto" onClick={() => router.visit('/parent/receipts')}>{T.HEADER.viewAll}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{receipt.receiptNumber}</p>
                    <p className="text-xs text-muted-foreground">{receipt.date}</p>
                  </div>
                  <p className="text-sm font-mono-amount font-semibold">{COMMON_TEXT.currency} {receipt.amount.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.recentPayments}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{T.PAYMENTS_TEXT.table.date}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.amount}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.method}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.status}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.reference}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{p.date}</TableCell>
                  <TableCell className="text-sm font-mono-amount">{COMMON_TEXT.currency} {p.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono-amount">{p.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default ParentDashboard;
