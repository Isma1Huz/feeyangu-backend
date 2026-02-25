import React from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { HealthProfile, Student, HealthUpdateRequest } from '@/types';
import KPICard from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Heart, Shield, Syringe, Settings, FileText, Users } from 'lucide-react';

const severityColors: Record<string, string> = {
  mild: 'bg-muted text-muted-foreground',
  moderate: 'bg-warning/10 text-warning',
  severe: 'bg-orange-500/10 text-orange-600',
  critical: 'bg-destructive/10 text-destructive',
  life_threatening: 'bg-destructive text-destructive-foreground',
};

interface Props extends InertiaSharedProps {
  healthProfiles: HealthProfile[];
  students: Student[];
  updateRequests: HealthUpdateRequest[];
}

const SchoolHealth: React.FC = () => {
  const T = useT();
  const t = T.HEALTH_TEXT;
  const { healthProfiles, students, updateRequests } = usePage<Props>().props;

  const activeConditions = healthProfiles.reduce((s, p) => s + p.conditions.filter(c => c.status === 'active').length, 0);
  const allergies = healthProfiles.reduce((s, p) => s + p.allergies.length, 0);
  const vaccDue = healthProfiles.reduce((s, p) => s + p.vaccinations.filter(v => v.status !== 'up_to_date').length, 0);
  const incidents = healthProfiles.reduce((s, p) => s + p.incidents.length, 0);

  const kpis = [
    { title: 'Active Conditions', value: String(activeConditions), change: '', changeType: 'neutral' as const, icon: 'Heart' },
    { title: 'Allergies Flagged', value: String(allergies), change: '', changeType: 'neutral' as const, icon: 'AlertTriangle' },
    { title: 'Vaccinations Due', value: String(vaccDue), change: '', changeType: 'negative' as const, icon: 'Syringe' },
    { title: 'Incidents This Term', value: String(incidents), change: '', changeType: 'neutral' as const, icon: 'Shield' },
  ];

  // Critical alerts
  const criticalAlerts = healthProfiles.flatMap(p => {
    const student = students.find(s => s.id === p.studentId);
    const alerts: { student: string; type: string; detail: string; severity: string }[] = [];
    p.allergies.filter(a => a.severity === 'life_threatening' || a.severity === 'severe').forEach(a => {
      alerts.push({ student: student ? `${student.firstName} ${student.lastName}` : p.studentId, type: 'Allergy', detail: a.allergen, severity: a.severity });
    });
    p.conditions.filter(c => c.severity === 'severe' || c.severity === 'critical').forEach(c => {
      alerts.push({ student: student ? `${student.firstName} ${student.lastName}` : p.studentId, type: 'Condition', detail: c.name, severity: c.severity });
    });
    return alerts;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Head title={t.pageTitle} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage student health profiles and medical records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => router.visit('/school/health/settings')}><Settings className="h-4 w-4" />Settings</Button>
          <Button variant="outline" className="gap-2" onClick={() => router.visit('/school/health/trip-sheet')}><FileText className="h-4 w-4" />Trip Sheet</Button>
          <Button className="gap-2" onClick={() => router.visit('/school/health/records')}><Users className="h-4 w-4" />All Records</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => <KPICard key={kpi.title} data={kpi} index={i} />)}
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="shadow-sm border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />Medical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div>
                    <p className="text-sm font-semibold">{alert.student}</p>
                    <p className="text-xs text-muted-foreground">{alert.type}: {alert.detail}</p>
                  </div>
                  <Badge className={severityColors[alert.severity]}>{t.condition.severities[alert.severity as keyof typeof t.condition.severities]}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Update Requests */}
      {updateRequests.length > 0 && (
        <Card className="shadow-sm border-warning/30">
          <CardHeader className="pb-2"><CardTitle className="text-base">Pending Health Updates from Parents</CardTitle></CardHeader>
          <CardContent>
            {updateRequests.map(req => {
              const student = students.find(s => s.id === req.studentId);
              return (
                <div key={req.id} className="flex items-start justify-between p-3 rounded-lg bg-warning/5 border border-warning/10">
                  <div>
                    <p className="text-sm font-medium">{student ? `${student.firstName} ${student.lastName}` : req.studentId}</p>
                    <p className="text-xs text-muted-foreground mt-1">{req.updateDescription}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Submitted: {req.submittedAt.split('T')[0]}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm">Apply</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolHealth;
