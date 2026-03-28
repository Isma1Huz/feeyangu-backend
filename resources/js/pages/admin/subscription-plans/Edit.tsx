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
import { ArrowLeft, Save, Check, AlertCircle } from 'lucide-react';

interface Props extends InertiaSharedProps {
  plan: SubscriptionPlanModel & { modules: Array<Module & { pivot: { is_included: boolean } }> };
  modules: Module[];
}

type TabKey = 'info' | 'pricing' | 'modules' | 'limits';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Basic Info' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'modules', label: 'Modules' },
  { key: 'limits', label: 'Limits' },
];

const formatKES = (v: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v);

const SubscriptionPlansEdit: React.FC<Props> = () => {
  const { plan, modules = [] } = usePage<Props>().props;

  const includedModuleIds = plan.modules
    ?.filter((m) => m.pivot?.is_included)
    .map((m) => m.id) ?? [];

  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>('info');
  const [tabErrors, setTabErrors] = useState<Record<TabKey, string[]>>({
    info: [],
    pricing: [],
    modules: [],
    limits: [],
  });

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

  // Validation functions
  const validateInfoTab = (): string[] => {
    const newErrors: string[] = [];
    if (!data.name.trim()) newErrors.push('Plan name is required');
    if (!data.code.trim()) newErrors.push('Plan code is required');
    if (data.code && !/^[a-z0-9_-]+$/.test(data.code)) {
      newErrors.push('Plan code can only contain lowercase letters, numbers, underscores, and hyphens');
    }
    setTabErrors((prev) => ({ ...prev, info: newErrors }));
    return newErrors;
  };

  const validatePricingTab = (): string[] => {
    const newErrors: string[] = [];
    if (!data.price_monthly || Number(data.price_monthly) < 0) {
      newErrors.push('Monthly price is required and must be 0 or greater');
    }
    if (!data.price_yearly || Number(data.price_yearly) < 0) {
      newErrors.push('Yearly price is required and must be 0 or greater');
    }
    if (Number(data.price_monthly) > 0 && Number(data.price_yearly) > 0) {
      const yearlyEquivalent = Number(data.price_monthly) * 12;
      if (Number(data.price_yearly) > yearlyEquivalent) {
        newErrors.push('Yearly price should be less than or equal to 12 × monthly price');
      }
    }
    setTabErrors((prev) => ({ ...prev, pricing: newErrors }));
    return newErrors;
  };

  const validateModulesTab = (): string[] => {
    const newErrors: string[] = [];
    const coreModulesCount = modules.filter((m) => m.is_core).length;
    const totalModules = coreModulesCount + data.module_ids.length;

    if (totalModules === 0) {
      newErrors.push('Select at least one module');
    } else if (data.module_ids.length === 0 && coreModulesCount === 0) {
      newErrors.push('Select at least one optional module');
    }
    setTabErrors((prev) => ({ ...prev, modules: newErrors }));
    return newErrors;
  };

  const validateLimitsTab = (): string[] => {
    const newErrors: string[] = [];
    const studentLimit = Number(data.student_limit);
    const staffLimit = Number(data.staff_limit);
    const storageLimit = Number(data.storage_limit_mb);

    if (studentLimit < 0) newErrors.push('Student limit cannot be negative');
    if (staffLimit < 0) newErrors.push('Staff limit cannot be negative');
    if (storageLimit < 0) newErrors.push('Storage limit cannot be negative');
    setTabErrors((prev) => ({ ...prev, limits: newErrors }));
    return newErrors;
  };

  const validateTab = (tabKey: TabKey): boolean => {
    switch (tabKey) {
      case 'info':
        return validateInfoTab().length === 0;
      case 'pricing':
        return validatePricingTab().length === 0;
      case 'modules':
        return validateModulesTab().length === 0;
      case 'limits':
        return validateLimitsTab().length === 0;
      default:
        return true;
    }
  };

  const handleTabChange = (newTab: TabKey) => {
    // Validate current tab before switching
    if (!validateTab(tab)) {
      toast({
        title: 'Please fix errors',
        description: 'Complete all required fields before switching tabs',
        variant: 'destructive',
      });
      return;
    }
    setTab(newTab);
  };

  const toggleModule = (id: number) => {
    const ids = data.module_ids.includes(id)
      ? data.module_ids.filter((m) => m !== id)
      : [...data.module_ids, id];
    setData('module_ids', ids);
    // Clear module error when modules are selected
    if (ids.length > 0 && tabErrors.modules.includes('Select at least one module')) {
      setTabErrors((prev) => ({ ...prev, modules: prev.modules.filter((e) => e !== 'Select at least one module') }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all tabs before submit
    const isInfoValid = validateInfoTab().length === 0;
    const isPricingValid = validatePricingTab().length === 0;
    const isModulesValid = validateModulesTab().length === 0;
    const isLimitsValid = validateLimitsTab().length === 0;

    if (!isInfoValid || !isPricingValid || !isModulesValid || !isLimitsValid) {
      toast({
        title: 'Validation failed',
        description: 'Please fix errors in all tabs before saving',
        variant: 'destructive',
      });
      return;
    }

    put(`/admin/subscription-plans/${plan.id}`, {
      onSuccess: () => toast({ title: 'Plan updated successfully' }),
      onError: () => toast({ title: 'Please fix the errors', variant: 'destructive' }),
    });
  };

  const coreModules = modules.filter((m) => m.is_core);
  const optionalModules = modules.filter((m) => !m.is_core);

  const currentTabErrors = tabErrors[tab];

  return (
    <AppLayout>
      <Head title={`Edit Plan – ${plan.name}`} />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.get('/admin/subscription-plans')}
            className="active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Plan</h1>
            <p className="text-sm text-muted-foreground">
              {plan.name} ({plan.code})
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b">
          {TABS.map(({ key, label }) => {
            const hasErrors = tabErrors[key].length > 0;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                {hasErrors && (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                )}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-[0_2px_8px_hsl(var(--primary)/0.2),0_8px_32px_hsl(var(--primary)/0.1)]">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {TABS.find((t) => t.key === tab)?.label}
                </CardTitle>
                {currentTabErrors.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>
                      {currentTabErrors.length} issue{currentTabErrors.length !== 1 ? 's' : ''} to fix
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="animate-fade-in">
                {tab === 'info' && (
                  <>
                    <div>
                      <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        Plan Name
                      </Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => {
                          setData('name', e.target.value);
                          if (tabErrors.info.includes('Plan name is required')) {
                            setTabErrors((prev) => ({
                              ...prev,
                              info: prev.info.filter((e) => e !== 'Plan name is required'),
                            }));
                          }
                        }}
                        placeholder="e.g. Premium"
                        className={`mt-1.5 ${tabErrors.info.some((e) => e.includes('Plan name')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="code" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        Plan Code
                      </Label>
                      <Input
                        id="code"
                        value={data.code}
                        onChange={(e) => {
                          setData('code', e.target.value.toLowerCase());
                          if (tabErrors.info.some((e) => e.includes('Plan code'))) {
                            setTabErrors((prev) => ({ ...prev, info: [] }));
                          }
                        }}
                        placeholder="e.g. premium"
                        className={`mt-1.5 font-mono ${tabErrors.info.some((e) => e.includes('Plan code')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lowercase letters, numbers, underscores, and hyphens only
                      </p>
                      {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        min="0"
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <Switch
                        checked={data.is_active}
                        onCheckedChange={(v) => setData('is_active', v)}
                      />
                      <Label className="text-sm">Active (visible to schools)</Label>
                    </div>
                    {tabErrors.info.map((err) => (
                      <p key={err} className="text-xs text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {err}
                      </p>
                    ))}
                  </>
                )}

                {tab === 'pricing' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_monthly" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        Monthly Price (KES)
                      </Label>
                      <Input
                        id="price_monthly"
                        type="number"
                        min="0"
                        step="100"
                        value={data.price_monthly}
                        onChange={(e) => {
                          setData('price_monthly', e.target.value);
                          if (tabErrors.pricing.some((e) => e.includes('Monthly'))) {
                            setTabErrors((prev) => ({
                              ...prev,
                              pricing: prev.pricing.filter((e) => !e.includes('Monthly')),
                            }));
                          }
                        }}
                        className={`mt-1.5 ${tabErrors.pricing.some((e) => e.includes('Monthly')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      {data.price_monthly && Number(data.price_monthly) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatKES(Number(data.price_monthly))} / month
                        </p>
                      )}
                      {errors.price_monthly && <p className="text-xs text-destructive mt-1">{errors.price_monthly}</p>}
                    </div>
                    <div>
                      <Label htmlFor="price_yearly" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        Yearly Price (KES)
                      </Label>
                      <Input
                        id="price_yearly"
                        type="number"
                        min="0"
                        step="1000"
                        value={data.price_yearly}
                        onChange={(e) => {
                          setData('price_yearly', e.target.value);
                          if (tabErrors.pricing.some((e) => e.includes('Yearly'))) {
                            setTabErrors((prev) => ({
                              ...prev,
                              pricing: prev.pricing.filter((e) => !e.includes('Yearly')),
                            }));
                          }
                        }}
                        className={`mt-1.5 ${tabErrors.pricing.some((e) => e.includes('Yearly')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      {data.price_yearly && Number(data.price_yearly) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatKES(Number(data.price_yearly))} / year
                        </p>
                      )}
                      {errors.price_yearly && <p className="text-xs text-destructive mt-1">{errors.price_yearly}</p>}
                    </div>
                  </div>
                )}

                {tab === 'pricing' && tabErrors.pricing.length > 0 && (
                  <div className="mt-2">
                    {tabErrors.pricing.map((err) => (
                      <p key={err} className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {err}
                      </p>
                    ))}
                  </div>
                )}

                {tab === 'pricing' && data.price_monthly && data.price_yearly && Number(data.price_monthly) > 0 && Number(data.price_yearly) > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-accent/30 text-sm">
                    <p className="text-muted-foreground mb-1">Savings with yearly plan:</p>
                    <p className="font-semibold text-primary">
                      Save{' '}
                      {formatKES(
                        Number(data.price_monthly) * 12 - Number(data.price_yearly)
                      )}{' '}
                      per year
                    </p>
                  </div>
                )}

                {tab === 'modules' && (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                      Select modules included in this plan. Core modules are always included.
                    </p>
                    {coreModules.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Core (Always Included)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {coreModules.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-2 p-2.5 rounded-lg border bg-accent/50"
                            >
                              <Check className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm font-medium">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Optional Modules
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {optionalModules.map((m) => (
                          <label
                            key={m.id}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.98] ${
                              data.module_ids.includes(m.id) ? 'border-primary bg-primary/5' : ''
                            }`}
                          >
                            <Checkbox
                              checked={data.module_ids.includes(m.id)}
                              onCheckedChange={() => toggleModule(m.id)}
                            />
                            <span className="text-sm">{m.name}</span>
                          </label>
                        ))}
                      </div>
                      {tabErrors.modules.map((err) => (
                        <p key={err} className="text-xs text-destructive mt-3 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {err}
                        </p>
                      ))}
                      <p className="text-xs text-muted-foreground mt-2">
                        Selected: {data.module_ids.length + coreModules.length} of{' '}
                        {modules.length} modules
                      </p>
                    </div>
                  </div>
                )}

                {tab === 'limits' && (
                  <>
                    <p className="text-sm text-muted-foreground">Set 0 for unlimited.</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="student_limit">Max Students</Label>
                        <Input
                          id="student_limit"
                          type="number"
                          min="0"
                          value={data.student_limit}
                          onChange={(e) => {
                            setData('student_limit', e.target.value);
                            if (tabErrors.limits.some((e) => e.includes('Student'))) {
                              setTabErrors((prev) => ({
                                ...prev,
                                limits: prev.limits.filter((e) => !e.includes('Student')),
                              }));
                            }
                          }}
                          className={`mt-1.5 ${tabErrors.limits.some((e) => e.includes('Student')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                          onChange={(e) => {
                            setData('staff_limit', e.target.value);
                            if (tabErrors.limits.some((e) => e.includes('Staff'))) {
                              setTabErrors((prev) => ({
                                ...prev,
                                limits: prev.limits.filter((e) => !e.includes('Staff')),
                              }));
                            }
                          }}
                          className={`mt-1.5 ${tabErrors.limits.some((e) => e.includes('Staff')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        {errors.staff_limit && (
                          <p className="text-xs text-destructive mt-1">{errors.staff_limit}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="storage_limit_mb">Storage Limit (MB, 0 = unlimited)</Label>
                      <Input
                        id="storage_limit_mb"
                        type="number"
                        min="0"
                        value={data.storage_limit_mb}
                        onChange={(e) => {
                          setData('storage_limit_mb', e.target.value);
                          if (tabErrors.limits.some((e) => e.includes('Storage'))) {
                            setTabErrors((prev) => ({
                              ...prev,
                              limits: prev.limits.filter((e) => !e.includes('Storage')),
                            }));
                          }
                        }}
                        className={`mt-1.5 ${tabErrors.limits.some((e) => e.includes('Storage')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      {errors.storage_limit_mb && (
                        <p className="text-xs text-destructive mt-1">{errors.storage_limit_mb}</p>
                      )}
                    </div>
                    {tabErrors.limits.map((err) => (
                      <p key={err} className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {err}
                      </p>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={processing} className="active:scale-[0.97]">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubscriptionPlansEdit;