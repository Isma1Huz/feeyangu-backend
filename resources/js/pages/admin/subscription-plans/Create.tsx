import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { Module } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, AlertCircle } from 'lucide-react';

interface Props extends InertiaSharedProps {
  modules: Module[];
}

const STEPS = ['Basic Info', 'Pricing', 'Modules', 'Limits', 'Preview'];

const SubscriptionPlansCreate: React.FC<Props> = () => {
  const { modules = [] } = usePage<Props>().props;
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  const { data, setData, post, errors, processing } = useForm({
    name: '',
    code: '',
    description: '',
    price_monthly: '',
    price_yearly: '',
    student_limit: '0',
    staff_limit: '0',
    storage_limit_mb: '0',
    features: [] as string[],
    is_active: true,
    sort_order: '0',
    module_ids: [] as number[],
  });

  const toggleModule = (id: number) => {
    const ids = data.module_ids.includes(id)
      ? data.module_ids.filter((m) => m !== id)
      : [...data.module_ids, id];
    setData('module_ids', ids);
    // Clear module error when modules are selected
    if (ids.length > 0 && stepErrors[2]?.includes('Select at least one optional module')) {
      setStepErrors((prev) => ({ ...prev, 2: prev[2]?.filter((e) => e !== 'Select at least one optional module') }));
    }
  };

  // Step validation functions
  const validateStep0 = (): boolean => {
    const newErrors: string[] = [];
    if (!data.name.trim()) newErrors.push('Plan name is required');
    if (!data.code.trim()) newErrors.push('Plan code is required');
    if (data.code && !/^[a-z0-9_-]+$/.test(data.code)) newErrors.push('Plan code can only contain lowercase letters, numbers, underscores, and hyphens');
    
    setStepErrors((prev) => ({ ...prev, 0: newErrors }));
    return newErrors.length === 0;
  };

  const validateStep1 = (): boolean => {
    const newErrors: string[] = [];
    if (!data.price_monthly || Number(data.price_monthly) < 0) newErrors.push('Monthly price is required and must be 0 or greater');
    if (!data.price_yearly || Number(data.price_yearly) < 0) newErrors.push('Yearly price is required and must be 0 or greater');
    if (Number(data.price_monthly) > 0 && Number(data.price_yearly) > 0) {
      const yearlyEquivalent = Number(data.price_monthly) * 12;
      if (Number(data.price_yearly) > yearlyEquivalent) {
        newErrors.push('Yearly price should be less than or equal to 12 × monthly price');
      }
    }
    
    setStepErrors((prev) => ({ ...prev, 1: newErrors }));
    return newErrors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: string[] = [];
    const coreModulesCount = modules.filter((m) => m.is_core).length;
    const totalModules = coreModulesCount + data.module_ids.length;
    
    if (totalModules === 0) {
      newErrors.push('Select at least one module');
    } else if (data.module_ids.length === 0 && coreModulesCount === 0) {
      newErrors.push('Select at least one optional module');
    }
    
    setStepErrors((prev) => ({ ...prev, 2: newErrors }));
    return newErrors.length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: string[] = [];
    const studentLimit = Number(data.student_limit);
    const staffLimit = Number(data.staff_limit);
    const storageLimit = Number(data.storage_limit_mb);
    
    if (studentLimit < 0) newErrors.push('Student limit cannot be negative');
    if (staffLimit < 0) newErrors.push('Staff limit cannot be negative');
    if (storageLimit < 0) newErrors.push('Storage limit cannot be negative');
    
    setStepErrors((prev) => ({ ...prev, 3: newErrors }));
    return newErrors.length === 0;
  };

  const validateStep4 = (): boolean => {
    // Preview step - always valid, just return true
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (step) {
      case 0:
        isValid = validateStep0();
        break;
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setStep(step + 1);
    } else {
      toast({
        title: 'Please fix errors',
        description: 'Complete all required fields before proceeding',
        variant: 'destructive',
      });
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    // Final validation before submit
    if (validateStep0() && validateStep1() && validateStep2() && validateStep3()) {
      post('/admin/subscription-plans', {
        onSuccess: () => toast({ title: 'Plan created successfully' }),
        onError: () => toast({ title: 'Please fix the errors', variant: 'destructive' }),
      });
    } else {
      toast({
        title: 'Validation failed',
        description: 'Please complete all steps correctly',
        variant: 'destructive',
      });
    }
  };

  const coreModules = modules.filter((m) => m.is_core);
  const optionalModules = modules.filter((m) => !m.is_core);

  const formatKES = (v: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(
      Number(v) || 0
    );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                Plan Name
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => {
                  setData('name', e.target.value);
                  if (stepErrors[0]?.includes('Plan name is required')) {
                    setStepErrors((prev) => ({ ...prev, 0: prev[0]?.filter((e) => e !== 'Plan name is required') }));
                  }
                }}
                placeholder="e.g. Premium"
                className={`mt-1.5 ${stepErrors[0]?.some(e => e.includes('Plan name')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {stepErrors[0]?.map((err) => (
                <p key={err} className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {err}
                </p>
              ))}
            </div>
            <div>
              <Label htmlFor="code" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                Plan Code
              </Label>
              <Input
                id="code"
                value={data.code}
                onChange={(e) => {
                  setData('code', e.target.value.toLowerCase());
                  if (stepErrors[0]?.some(e => e.includes('Plan code'))) {
                    setStepErrors((prev) => ({ ...prev, 0: [] }));
                  }
                }}
                placeholder="e.g. premium"
                className={`mt-1.5 font-mono ${stepErrors[0]?.some(e => e.includes('Plan code')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, underscores, and hyphens only</p>
              {stepErrors[0]?.map((err) => (
                <p key={err} className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {err}
                </p>
              ))}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={data.is_active}
                onCheckedChange={(v) => setData('is_active', v)}
              />
              <Label className="text-sm">Active (visible to schools)</Label>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
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
                    if (stepErrors[1]?.some(e => e.includes('Monthly'))) {
                      setStepErrors((prev) => ({ ...prev, 1: prev[1]?.filter(e => !e.includes('Monthly')) }));
                    }
                  }}
                  className={`mt-1.5 ${stepErrors[1]?.some(e => e.includes('Monthly')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {data.price_monthly && Number(data.price_monthly) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{formatKES(data.price_monthly)} / month</p>
                )}
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
                    if (stepErrors[1]?.some(e => e.includes('Yearly'))) {
                      setStepErrors((prev) => ({ ...prev, 1: prev[1]?.filter(e => !e.includes('Yearly')) }));
                    }
                  }}
                  className={`mt-1.5 ${stepErrors[1]?.some(e => e.includes('Yearly')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {data.price_yearly && Number(data.price_yearly) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{formatKES(data.price_yearly)} / year</p>
                )}
              </div>
            </div>
            {stepErrors[1]?.map((err) => (
              <p key={err} className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {err}
              </p>
            ))}
            {data.price_monthly && data.price_yearly && Number(data.price_monthly) > 0 && Number(data.price_yearly) > 0 && (
              <div className="p-3 rounded-lg bg-accent/30 text-sm">
                <p className="text-muted-foreground mb-1">Savings with yearly plan:</p>
                <p className="font-semibold text-primary">
                  Save {formatKES((Number(data.price_monthly) * 12 - Number(data.price_yearly)).toString())} per year
                </p>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 animate-fade-in">
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
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 after:content-['*'] after:ml-0.5 after:text-destructive">
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
              {stepErrors[2]?.map((err) => (
                <p key={err} className="text-xs text-destructive mt-3 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {err}
                </p>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {data.module_ids.length + coreModules.length} of {modules.length} modules
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
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
                  className={`mt-1.5 ${stepErrors[3]?.some(e => e.includes('Student')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              <div>
                <Label htmlFor="staff_limit">Max Staff</Label>
                <Input
                  id="staff_limit"
                  type="number"
                  min="0"
                  value={data.staff_limit}
                  onChange={(e) => setData('staff_limit', e.target.value)}
                  className={`mt-1.5 ${stepErrors[3]?.some(e => e.includes('Staff')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
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
                className={`mt-1.5 ${stepErrors[3]?.some(e => e.includes('Storage')) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            </div>
            {stepErrors[3]?.map((err) => (
              <p key={err} className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {err}
              </p>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Name', data.name || '—'],
                ['Code', data.code || '—'],
                ['Monthly', formatKES(data.price_monthly)],
                ['Yearly', formatKES(data.price_yearly)],
                ['Students', data.student_limit === '0' ? 'Unlimited' : data.student_limit],
                ['Staff', data.staff_limit === '0' ? 'Unlimited' : data.staff_limit],
                ['Modules', `${data.module_ids.length + coreModules.length} selected`],
                ['Status', data.is_active ? 'Active' : 'Inactive'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Check if current step has errors
  const hasStepErrors = stepErrors[step] && stepErrors[step].length > 0;

  return (
    <AppLayout>
      <Head title="Create Subscription Plan" />
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
          <h1 className="text-2xl font-bold tracking-tight">Create Plan</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => {
                  // Allow clicking only on completed steps or current step
                  if (i < step) {
                    setStep(i);
                  }
                }}
                disabled={i > step}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all active:scale-95 ${
                  i === step
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : i < step
                    ? 'bg-accent text-primary cursor-pointer'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {i < step && <Check className="h-3 w-3 inline mr-1" />}
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>

        <Card className="border-0 shadow-[0_2px_8px_hsl(var(--primary)/0.2),0_8px_32px_hsl(var(--primary)/0.1)]">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Step {step + 1}: {STEPS[step]}
              </CardTitle>
              {hasStepErrors && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{stepErrors[step].length} issue{stepErrors[step].length !== 1 ? 's' : ''} to fix</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={handlePrevious}
            className="active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="active:scale-[0.97]">
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={processing} className="active:scale-[0.97]">
              <Sparkles className="h-4 w-4 mr-1" /> Create Plan
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SubscriptionPlansCreate;