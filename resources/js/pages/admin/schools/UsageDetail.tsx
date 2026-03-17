import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SchoolUsageSummary } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Props extends InertiaSharedProps {
  school: SchoolUsageSummary;
}

const getUsageColor = (percent: number) => {
  if (percent >= 95) return 'text-red-600';
  if (percent >= 80) return 'text-yellow-600';
  return 'text-green-600';
};

const getBarColor = (percent: number) => {
  if (percent >= 95) return 'bg-red-500';
  if (percent >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

const SchoolUsageDetail: React.FC<Props> = () => {
  const { school } = usePage<Props>().props;

  if (!school) return null;

  const metrics = [
    {
      label: 'Students',
      current: school.students.current,
      limit: school.students.limit,
      percent: school.students.percent,
      near_limit: school.students.near_limit,
      at_limit: school.students.at_limit,
    },
    {
      label: 'Staff',
      current: school.staff.current,
      limit: school.staff.limit,
      percent: school.staff.percent,
      near_limit: school.staff.near_limit,
      at_limit: school.staff.at_limit,
    },
  ];

  return (
    <AppLayout>
      <Head title={`Usage – ${school.name}`} />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/admin/schools/usage')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Schools
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
            <p className="text-sm text-muted-foreground">Subscription &amp; Usage Details</p>
          </div>
        </div>

        {/* Summary card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-xl font-bold mt-1">{school.plan_name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={school.subscription_status === 'active' ? 'secondary' : 'destructive'}
                className="capitalize mt-1 text-sm"
              >
                {school.subscription_status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Subscription Expiry</p>
              <p className="text-xl font-bold mt-1">
                {school.subscription_end_date ?? 'No expiry set'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage meters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage Meters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metric.label}</span>
                    {metric.at_limit && (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <XCircle className="h-3 w-3" /> At Limit
                      </span>
                    )}
                    {!metric.at_limit && metric.near_limit && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600">
                        <AlertTriangle className="h-3 w-3" /> Near Limit
                      </span>
                    )}
                    {!metric.near_limit && !metric.at_limit && metric.limit > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Within Limit
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${metric.limit > 0 ? getUsageColor(metric.percent) : 'text-muted-foreground'}`}>
                    {metric.current.toLocaleString()}
                    {metric.limit > 0
                      ? ` / ${metric.limit.toLocaleString()} (${metric.percent}%)`
                      : ' / Unlimited'}
                  </div>
                </div>
                {metric.limit > 0 && (
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getBarColor(metric.percent)}`}
                      style={{ width: `${Math.min(100, metric.percent)}%` }}
                    />
                  </div>
                )}
                {metric.limit === 0 && (
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="h-3 rounded-full bg-primary/20" style={{ width: '100%' }} />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warning messages */}
        {(school.students.at_limit || school.staff.at_limit) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 text-red-800">
                <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Subscription Limit Reached</p>
                  <p className="text-sm mt-1">
                    This school has reached one or more subscription limits. New records cannot be
                    created until the plan is upgraded or existing records are removed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {!school.students.at_limit && !school.staff.at_limit && (school.students.near_limit || school.staff.near_limit) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Approaching Subscription Limit</p>
                  <p className="text-sm mt-1">
                    This school is nearing its subscription limits (80% or above). Consider upgrading
                    the plan soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SchoolUsageDetail;
