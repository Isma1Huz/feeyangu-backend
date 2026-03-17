import React, { useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SubscriptionPlanModel, Module } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check } from 'lucide-react';

interface Props extends InertiaSharedProps {
  currentPlan: SubscriptionPlanModel | null;
  availablePlans: SubscriptionPlanModel[];
  addonModules: Module[];
}

const formatKES = (amount: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);

const SubscriptionUpgrade: React.FC<Props> = () => {
  const { currentPlan, availablePlans, addonModules } = usePage<Props>().props;
  const { toast } = useToast();

  const { data, setData, post, processing } = useForm({
    plan_id: currentPlan?.id ?? 0,
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    addon_modules: [] as string[],
  });

  const selectedPlan = availablePlans.find((p) => p.id === data.plan_id);

  const toggleAddon = (key: string) => {
    const addons = data.addon_modules.includes(key)
      ? data.addon_modules.filter((k) => k !== key)
      : [...data.addon_modules, key];
    setData('addon_modules', addons);
  };

  const addonPrices: Record<string, { monthly: number; yearly: number }> = {
    transport: { monthly: 5000, yearly: 50000 },
    store:     { monthly: 3000, yearly: 30000 },
    hostel:    { monthly: 4000, yearly: 40000 },
    alumni:    { monthly: 2000, yearly: 20000 },
  };

  const addonTotal = data.addon_modules.reduce((sum, key) => {
    return sum + (addonPrices[key]?.[data.billing_cycle] ?? 0);
  }, 0);

  const basePrice = selectedPlan
    ? (data.billing_cycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)
    : 0;

  const totalPrice = basePrice + addonTotal;

  const handleSubmit = () => {
    post('/school/subscription/upgrade', {
      onSuccess: () => toast({ title: 'Subscription updated successfully' }),
      onError: () => toast({ title: 'Failed to update subscription', variant: 'destructive' }),
    });
  };

  return (
    <AppLayout>
      <Head title="Upgrade Plan" />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/school/subscription')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Choose a Plan</h1>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant={data.billing_cycle === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setData('billing_cycle', 'monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={data.billing_cycle === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setData('billing_cycle', 'yearly')}
          >
            Yearly <Badge variant="secondary" className="ml-2 text-[10px]">Save ~17%</Badge>
          </Button>
        </div>

        {/* Plan comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availablePlans.map((plan) => {
            const isSelected = data.plan_id === plan.id;
            const isCurrent = currentPlan?.id === plan.id;
            const price = data.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

            return (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/50'}`}
                onClick={() => setData('plan_id', plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {isCurrent && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                    {isSelected && !isCurrent && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-2xl font-bold mt-1">{formatKES(price)}<span className="text-sm font-normal text-muted-foreground">/{data.billing_cycle === 'yearly' ? 'yr' : 'mo'}</span></p>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Students</span>
                    <span>{plan.student_limit === 0 ? '∞' : plan.student_limit}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Staff</span>
                    <span>{plan.staff_limit === 0 ? '∞' : plan.staff_limit}</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {(plan.features ?? []).map((f) => (
                      <div key={f} className="flex items-center gap-1 text-xs">
                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add-ons */}
        {addonModules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add-on Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {addonModules.map((m) => {
                  const pricing = addonPrices[m.key];
                  if (!pricing) return null;
                  const price = pricing[data.billing_cycle];
                  return (
                    <label key={m.key} className="flex items-start gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={data.addon_modules.includes(m.key)}
                        onCheckedChange={() => toggleAddon(m.key)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">+{formatKES(price)}/{data.billing_cycle === 'yearly' ? 'yr' : 'mo'}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary & checkout */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Plan: <strong className="text-foreground">{selectedPlan?.name ?? '—'}</strong></p>
              {addonTotal > 0 && <p>Add-ons: <strong className="text-foreground">+{formatKES(addonTotal)}</strong></p>}
              <p className="text-base font-bold text-foreground">Total: {formatKES(totalPrice)}/{data.billing_cycle === 'yearly' ? 'year' : 'month'}</p>
            </div>
            <Button onClick={handleSubmit} disabled={processing || !data.plan_id}>
              Confirm Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SubscriptionUpgrade;
