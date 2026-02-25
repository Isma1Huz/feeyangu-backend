import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useT } from '@/contexts/LanguageContext';
import type { InertiaSharedProps } from '@/types/inertia';
import type { School, KPIData } from '@/types';
import adminBannerBg from '@/assets/admin-banner-bg.jpg';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface Props extends InertiaSharedProps {
  kpi?: KPIData[];
  schools?: School[];
}

const AdminDashboard: React.FC<Props> = () => {
  const T = useT();
  const t = T.DASHBOARD_TEXT.admin;
  const COMMON_TEXT = T.COMMON_TEXT;
  const { kpi = [], schools = [] } = usePage<Props>().props;

  return (
    <>
      <Head title="Admin Dashboard" />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{T.HEADER.platformStats}</p>
        </div>

        <div className="relative rounded-xl overflow-hidden text-primary-foreground p-6 sm:p-8">
          <img src={adminBannerBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/40" />
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold">{t.bannerTitle}</h2>
            <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg mt-2">{t.bannerDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpi.map((kpiItem, i) => (<KPICard key={kpiItem.title} data={kpiItem} index={i} />))}
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">{t.topSchools}</CardTitle>
            <Link href="/admin/schools">
              <Button variant="outline" size="sm">{T.HEADER.viewAll}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{T.ADMIN_SCHOOLS_TEXT.table.name}</TableHead>
                  <TableHead>{T.ADMIN_SCHOOLS_TEXT.table.owner}</TableHead>
                  <TableHead>{T.ADMIN_SCHOOLS_TEXT.table.location}</TableHead>
                  <TableHead>{T.ADMIN_SCHOOLS_TEXT.table.students}</TableHead>
                  <TableHead>{T.ADMIN_SCHOOLS_TEXT.table.feesCollected}</TableHead>
                  <TableHead>{T.ADMIN_SCHOOLS_TEXT.table.status}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="text-sm">{school.owner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{school.location}</TableCell>
                    <TableCell className="text-sm font-mono-amount">{school.studentCount}</TableCell>
                    <TableCell className="text-sm font-mono-amount">{COMMON_TEXT.currency} {school.feesCollected.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={school.status} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></TableCell>
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

export default AdminDashboard;
