import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SubscriptionPlanModel, Module, UsageMetric } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Usage {
  students: UsageMetric & { unlimited: boolean };
  staff: UsageMetric & { unlimited: boolean };
  storage: UsageMetric & { unlimited: boolean };
}

interface Props extends InertiaSharedProps {
  currentPlan: SubscriptionPlanModel | null;
  usage: Usage;
  addonModules: Module[];
  currentAddons: string[];
  availablePlans: SubscriptionPlanModel[];
}

const formatKES = (amount: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);

const UsageMeter: React.FC<{ label: string; metric: UsageMetric & { unlimited: boolean } }> = ({ label, metric }) => {
  const color = metric.percent >= 95 ? 'bg-red-500' : metric.percent >= 80 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {metric.current.toLocaleString()} / {metric.unlimited ? '∞' : metric.limit.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        {!metric.unlimited && (
          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, metric.percent)}%` }} />
        )}
        {metric.unlimited && <div className="h-2 rounded-full bg-primary/30 w-full" />}
      </div>
      {metric.at_limit && <p className="text-xs text-red-600 font-medium">Limit reached! Please upgrade to add more.</p>}
      {!metric.at_limit && metric.near_limit && <p className="text-xs text-yellow-600">Approaching limit ({metric.percent}% used)</p>}
    </div>
  );
};

const SubscriptionOverview: React.FC<Props> = () => {
  const { currentPlan, usage, addonModules, currentAddons, availablePlans } = usePage<Props>().props;

  const hasWarning = usage.students.near_limit || usage.staff.near_limit;

  return (
    <AppLayout>
      <Head title="Subscription" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your school's subscription plan and usage limits.</p>
          </div>
          <Button onClick={() => router.get('/school/subscription/upgrade')}>
            Upgrade Plan
          </Button>
        </div>

        {hasWarning && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 pt-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-800">
                You are approaching your subscription limits. Consider upgrading to avoid service interruptions.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current plan */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPlan ? (
                <>
                  <div>
                    <p className="text-2xl font-bold">{currentPlan.name}</p>
                    <p className="text-muted-foreground text-sm">{formatKES(currentPlan.price_monthly)}/month</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    {currentPlan.features?.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No plan assigned. Contact support.</p>
              )}
            </CardContent>
          </Card>

          {/* Usage */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <UsageMeter label="Students" metric={usage.students} />
              <UsageMeter label="Staff" metric={usage.staff} />
              <UsageMeter label="Storage" metric={usage.storage} />
            </CardContent>
          </Card>
        </div>

        {/* Add-on modules */}
        {addonModules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add-on Modules</CardTitle>
              <CardDescription>Purchase additional modules not included in your plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {addonModules.map((m) => (
                  <div key={m.id} className={`p-3 rounded-lg border ${currentAddons.includes(m.key) ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{m.name}</p>
                      {currentAddons.includes(m.key) && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SubscriptionOverview;
