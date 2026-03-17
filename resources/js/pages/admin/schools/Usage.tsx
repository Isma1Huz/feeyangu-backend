import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SchoolUsageSummary } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, AlertTriangle } from 'lucide-react';

interface Props extends InertiaSharedProps {
  schools: SchoolUsageSummary[];
}

const getUsageColor = (percent: number) => {
  if (percent >= 95) return 'bg-red-500';
  if (percent >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

const SchoolUsage: React.FC<Props> = () => {
  const { schools = [] } = usePage<Props>().props;

  const nearLimitSchools = schools.filter((s) => s.students.near_limit || s.staff.near_limit);

  return (
    <AppLayout>
      <Head title="School Usage" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">School Usage</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor subscription limits and usage across all schools.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/admin/schools/usage/export'}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        {nearLimitSchools.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" /> {nearLimitSchools.length} school(s) near limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {nearLimitSchools.map((s) => (
                  <Badge key={s.id} variant="outline" className="border-yellow-300 text-yellow-800 cursor-pointer" onClick={() => router.get(`/admin/schools/${s.id}/usage`)}>
                    {s.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">School</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-left p-3 font-medium w-48">Students</th>
                    <th className="text-left p-3 font-medium w-48">Staff</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{school.name}</p>
                        {school.subscription_end_date && (
                          <p className="text-xs text-muted-foreground">Expires {school.subscription_end_date}</p>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{school.plan_name}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{school.students.current.toLocaleString()}</span>
                            <span className="text-muted-foreground">
                              {school.students.limit === 0 ? '∞' : school.students.limit.toLocaleString()}
                            </span>
                          </div>
                          {school.students.limit > 0 && (
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${getUsageColor(school.students.percent)}`} style={{ width: `${Math.min(100, school.students.percent)}%` }} />
                            </div>
                          )}
                          {school.students.at_limit && <Badge variant="destructive" className="text-[10px]">At Limit</Badge>}
                          {!school.students.at_limit && school.students.near_limit && <Badge className="text-[10px] bg-yellow-100 text-yellow-800">Near Limit</Badge>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{school.staff.current}</span>
                            <span className="text-muted-foreground">{school.staff.limit === 0 ? '∞' : school.staff.limit}</span>
                          </div>
                          {school.staff.limit > 0 && (
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${getUsageColor(school.staff.percent)}`} style={{ width: `${Math.min(100, school.staff.percent)}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={school.subscription_status === 'active' ? 'secondary' : 'destructive'} className="capitalize">
                          {school.subscription_status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => router.get(`/admin/schools/${school.id}/usage`)}>
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SchoolUsage;
