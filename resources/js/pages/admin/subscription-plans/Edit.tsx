import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { Module, SubscriptionPlanModel } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Check } from 'lucide-react';

interface Props extends InertiaSharedProps {
  plan: SubscriptionPlanModel & { modules: Array<Module & { pivot: { is_included: boolean } }> };
  modules: Module[];
}

const formatKES = (v: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v);

const SubscriptionPlansEdit: React.FC<Props> = () => {
  const { plan, modules = [] } = usePage<Props>().props;

  const includedModuleIds = plan.modules
    ?.filter((m) => m.pivot?.is_included)
    .map((m) => m.id) ?? [];

  const { toast } = useToast();
  const [tab, setTab] = useState<'info' | 'pricing' | 'modules' | 'limits'>('info');

  const { data, setData, put, errors, processing } = useForm({
    name: plan.name,
    code: plan.code,
    description: plan.description ?? '',
    price_monthly: String(plan.price_monthly),
    price_yearly: String(plan.price_yearly),
    student_limit: String(plan.student_limit),
    staff_limit: String(plan.staff_limit),
    storage_limit_mb: String(plan.storage_limit_mb),
    features: plan.features ?? [],
    is_active: plan.is_active,
    sort_order: String(plan.sort_order),
    module_ids: includedModuleIds,
  });

  const toggleModule = (id: number) => {
    const ids = data.module_ids.includes(id)
      ? data.module_ids.filter((m) => m !== id)
      : [...data.module_ids, id];
    setData('module_ids', ids);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/subscription-plans/${plan.id}`, {
      onSuccess: () => toast({ title: 'Plan updated successfully' }),
      onError: () => toast({ title: 'Please fix the errors', variant: 'destructive' }),
    });
  };

  const coreModules = modules.filter((m) => m.is_core);
  const optionalModules = modules.filter((m) => !m.is_core);

  const TABS = [
    { key: 'info', label: 'Basic Info' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'modules', label: 'Modules' },
    { key: 'limits', label: 'Limits' },
  ] as const;

  return (
    <AppLayout>
      <Head title={`Edit Plan – ${plan.name}`} />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/admin/subscription-plans')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Plan</h1>
            <p className="text-sm text-muted-foreground">{plan.name} ({plan.code})</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{TABS.find((t) => t.key === tab)?.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tab === 'info' && (
                <>
                  <div>
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g. Premium"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="code">Plan Code</Label>
                    <Input
                      id="code"
                      value={data.code}
                      onChange={(e) => setData('code', e.target.value.toLowerCase())}
                      placeholder="e.g. premium"
                    />
                    {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      min="0"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={data.is_active}
                      onCheckedChange={(v) => setData('is_active', v)}
                    />
                    <Label>Active (visible to schools)</Label>
                  </div>
                </>
              )}

              {tab === 'pricing' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_monthly">Monthly Price (KES)</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      min="0"
                      value={data.price_monthly}
                      onChange={(e) => setData('price_monthly', e.target.value)}
                    />
                    {errors.price_monthly && (
                      <p className="text-xs text-destructive mt-1">{errors.price_monthly}</p>
                    )}
                    {data.price_monthly && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatKES(Number(data.price_monthly))}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price_yearly">Yearly Price (KES)</Label>
                    <Input
                      id="price_yearly"
                      type="number"
                      min="0"
                      value={data.price_yearly}
                      onChange={(e) => setData('price_yearly', e.target.value)}
                    />
                    {errors.price_yearly && (
                      <p className="text-xs text-destructive mt-1">{errors.price_yearly}</p>
                    )}
                    {data.price_yearly && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatKES(Number(data.price_yearly))}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {tab === 'modules' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Select modules included in this plan. Core modules are always included.
                  </p>
                  {coreModules.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Core (Always Included)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {coreModules.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 p-2 rounded border bg-muted/50"
                          >
                            <Check className="h-3 w-3 text-primary" />
                            <span className="text-sm">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Optional Modules
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {optionalModules.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={data.module_ids.includes(m.id)}
                            onCheckedChange={() => toggleModule(m.id)}
                          />
                          <span className="text-sm">{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === 'limits' && (
                <>
                  <p className="text-sm text-muted-foreground">Set 0 for unlimited.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_limit">Max Students</Label>
                      <Input
                        id="student_limit"
                        type="number"
                        min="0"
                        value={data.student_limit}
                        onChange={(e) => setData('student_limit', e.target.value)}
                      />
                      {errors.student_limit && (
                        <p className="text-xs text-destructive mt-1">{errors.student_limit}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="staff_limit">Max Staff</Label>
                      <Input
                        id="staff_limit"
                        type="number"
                        min="0"
                        value={data.staff_limit}
                        onChange={(e) => setData('staff_limit', e.target.value)}
                      />
                      {errors.staff_limit && (
                        <p className="text-xs text-destructive mt-1">{errors.staff_limit}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="storage_limit_mb">Storage Limit (MB, 0 = unlimited)</Label>
                    <Input
                      id="storage_limit_mb"
                      type="number"
                      min="0"
                      value={data.storage_limit_mb}
                      onChange={(e) => setData('storage_limit_mb', e.target.value)}
                    />
                    {errors.storage_limit_mb && (
                      <p className="text-xs text-destructive mt-1">{errors.storage_limit_mb}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubscriptionPlansEdit;
