// pages/admin/subscription-plans/Index.tsx
import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SubscriptionPlanModel } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, LayoutGrid } from 'lucide-react';
import { PlanCard } from '@/components/Subscription/SubscriptionCard';

interface Props extends InertiaSharedProps {
  plans: SubscriptionPlanModel[];
}

const SubscriptionPlansIndex: React.FC<Props> = () => {
  const { plans = [] } = usePage<Props>().props;
  const { toast } = useToast();

  const handleDelete = (plan: SubscriptionPlanModel) => {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

    router.delete(`/admin/subscription-plans/${plan.id}`, {
      onSuccess: () => toast({ title: 'Plan deleted successfully' }),
      onError: (e) => toast({ title: Object.values(e)[0] as string ?? 'Failed to delete plan', variant: 'destructive' }),
    });
  };

  const handleDuplicate = (plan: SubscriptionPlanModel) => {
    router.post(`/admin/subscription-plans/${plan.id}/duplicate`, {}, {
      onSuccess: () => toast({ title: 'Plan duplicated successfully' }),
    });
  };

  const handleEdit = (plan: SubscriptionPlanModel) => {
    router.get(`/admin/subscription-plans/${plan.id}/edit`);
  };

  return (
    <AppLayout>
      <Head title="Subscription Plans" />

      {/* Header Section */}
      <div className="bg-primary text-primary-foreground -mt-6 -mx-6 mb-2 py-4">
        <div className="max-w-7xl mx-auto px-6 ">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ lineHeight: 1.1 }}>
                Subscription Plans
              </h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base max-w-xl">
                Manage the plans available to schools. Plans control module access and usage limits.
              </p>
            </div>
            <Button
              onClick={() => router.get('/admin/subscription-plans/create')}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 active:scale-[0.97] transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-1.5" /> New Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="space-y-6">
        {plans.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-accent mx-auto flex items-center justify-center">
              <LayoutGrid className="h-7 w-7 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">No plans yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first subscription plan to start managing school access.
            </p>
            <Button onClick={() => router.get('/admin/subscription-plans/create')} className="mt-2">
              <Plus className="h-4 w-4 mr-1.5" /> Create Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SubscriptionPlansIndex;