import React from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import KPICard from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/AppLayout';
import { Settings, Eye, Download } from 'lucide-react';

interface StudentPortfolio {
  studentId: string;
  completionPercentage: number;
  evidenceItems: any[];
}

interface TeacherClass {
  id: string;
  grade: string;
  name: string;
  portfolioCompletion: number;
}

interface Props extends InertiaSharedProps {
  portfolios: StudentPortfolio[];
  classes: TeacherClass[];
}

const SchoolPortfolio: React.FC = () => {
  const T = useT();
  const t = T.PORTFOLIO_TEXT;
  const { portfolios, classes } = usePage<Props>().props;

  const totalPortfolios = portfolios.length;
  const avgCompletion = Math.round(portfolios.reduce((s, p) => s + p.completionPercentage, 0) / Math.max(totalPortfolios, 1));
  const totalEvidence = portfolios.reduce((s, p) => s + p.evidenceItems.length, 0);
  const publishedCount = portfolios.reduce((s, p) => s + p.evidenceItems.filter(e => e.visibility === 'published').length, 0);

  const kpis = [
    { title: 'Active Portfolios', value: String(totalPortfolios), change: '', changeType: 'neutral' as const, icon: 'BookOpen' },
    { title: 'Completion Rate', value: `${avgCompletion}%`, change: '+5%', changeType: 'positive' as const, icon: 'FileText' },
    { title: 'Evidence Items', value: String(totalEvidence), change: '+8', changeType: 'positive' as const, icon: 'Layers' },
    { title: 'Shared with Parents', value: String(publishedCount), change: '', changeType: 'neutral' as const, icon: 'Users' },
  ];

  return (
    <AppLayout>
      <Head title={t.pageTitle} />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.pageTitle}</h1>
            <p className="text-muted-foreground text-sm mt-1">School-wide CBC portfolio management.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => router.visit('/school/portfolio/settings')}><Settings className="h-4 w-4" />Configure</Button>
            <Button variant="outline" className="gap-2" onClick={() => router.visit('/school/portfolio/all')}><Eye className="h-4 w-4" />View All</Button>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => <KPICard key={kpi.title} data={kpi} index={i} />)}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Class Completion Comparison</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Completion %</TableHead>
                <TableHead>Evidence Count</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.grade} — {c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Jane Achieng</TableCell>
                  <TableCell className="text-sm">{c.portfolioCompletion}%</TableCell>
                  <TableCell className="text-sm">{Math.round(c.portfolioCompletion * 0.4)}</TableCell>
                  <TableCell><Progress value={c.portfolioCompletion} className="h-2 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
};

export default SchoolPortfolio;
