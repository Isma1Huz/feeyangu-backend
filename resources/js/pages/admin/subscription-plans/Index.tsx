import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SubscriptionPlanModel, Module } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';

interface Props extends InertiaSharedProps {
  plans: SubscriptionPlanModel[];
}

const formatKES = (amount: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);

const SubscriptionPlansIndex: React.FC<Props> = () => {
  const { plans = [] } = usePage<Props>().props;
  const { toast } = useToast();

  const handleDelete = (plan: SubscriptionPlanModel) => {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

    router.delete(`/admin/subscription-plans/${plan.id}`, {
      onSuccess: () => toast({ title: 'Plan deleted' }),
      onError: (e) => toast({ title: Object.values(e)[0] as string ?? 'Failed to delete plan', variant: 'destructive' }),
    });
  };

  const handleDuplicate = (plan: SubscriptionPlanModel) => {
    router.post(`/admin/subscription-plans/${plan.id}/duplicate`, {}, {
      onSuccess: () => toast({ title: 'Plan duplicated' }),
    });
  };

  return (
    <AppLayout>
      <Head title="Subscription Plans" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage the plans available to schools. Plans control module access and usage limits.
            </p>
          </div>
          <Button onClick={() => router.get('/admin/subscription-plans/create')}>
            <Plus className="h-4 w-4 mr-2" /> New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={`shadow-sm flex flex-col ${!plan.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{plan.code}</p>
                  </div>
                  {!plan.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{formatKES(plan.price_monthly)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-sm text-muted-foreground">{formatKES(plan.price_yearly)}/year</p>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">{plan.student_limit === 0 ? 'Unlimited' : plan.student_limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff</span>
                    <span className="font-medium">{plan.staff_limit === 0 ? 'Unlimited' : plan.staff_limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">
                      {plan.storage_limit_mb === 0 ? 'Unlimited' : `${(plan.storage_limit_mb / 1024).toFixed(0)} GB`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscribers</span>
                    <span className="font-medium">{plan.schools_count ?? 0}</span>
                  </div>
                </div>

                {plan.included_modules && plan.included_modules.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Included Modules</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.included_modules.map((m) => (
                        <Badge key={m.id} variant="secondary" className="text-[10px]">{m.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => router.get(`/admin/subscription-plans/${plan.id}/edit`)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicate(plan)} title="Duplicate">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(plan)} title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SubscriptionPlansIndex;
