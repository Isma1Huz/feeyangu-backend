import React from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, CreditCard } from 'lucide-react';

interface Child {
  studentId: string;
  name: string;
  grade: string;
  className: string;
  status: string;
  paidFees: number;
  totalFees: number;
}

interface Props extends InertiaSharedProps {
  children: Child[];
}

const ParentChildren: React.FC = () => {
  const { children } = usePage<Props>().props;
  const T = useT();
  const t = T.PARENT_CHILDREN_TEXT;
  const COMMON_TEXT = T.COMMON_TEXT;

  return (
    <>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => {
          const percentage = Math.round((child.paidFees / child.totalFees) * 100);
          const balance = child.totalFees - child.paidFees;
          return (
            <Card key={child.studentId} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">{child.grade} · {child.className}</p>
                  </div>
                  <StatusBadge status={child.status} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.feeProgress}</span>
                    <span className="font-medium font-mono-amount">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{T.HEADER.paid}: <span className="font-mono-amount text-success">{COMMON_TEXT.currency} {child.paidFees.toLocaleString()}</span></span>
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
    </>
  );
};

export default ParentChildren;
