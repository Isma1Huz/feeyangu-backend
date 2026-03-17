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
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface Props extends InertiaSharedProps {
  modules: Module[];
}

const STEPS = ['Basic Info', 'Pricing', 'Modules', 'Limits', 'Preview'];

const SubscriptionPlansCreate: React.FC<Props> = () => {
  const { modules = [] } = usePage<Props>().props;
  const { toast } = useToast();
  const [step, setStep] = useState(0);

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
  };

  const handleSubmit = () => {
    post('/admin/subscription-plans', {
      onSuccess: () => toast({ title: 'Plan created successfully' }),
      onError: () => toast({ title: 'Please fix the errors', variant: 'destructive' }),
    });
  };

  const coreModules = modules.filter((m) => m.is_core);
  const optionalModules = modules.filter((m) => !m.is_core);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Premium" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="code">Plan Code</Label>
              <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value.toLowerCase())} placeholder="e.g. premium" />
              {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} />
              <Label>Active (visible to schools)</Label>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_monthly">Monthly Price (KES)</Label>
                <Input id="price_monthly" type="number" min="0" value={data.price_monthly} onChange={(e) => setData('price_monthly', e.target.value)} />
                {errors.price_monthly && <p className="text-xs text-destructive mt-1">{errors.price_monthly}</p>}
              </div>
              <div>
                <Label htmlFor="price_yearly">Yearly Price (KES)</Label>
                <Input id="price_yearly" type="number" min="0" value={data.price_yearly} onChange={(e) => setData('price_yearly', e.target.value)} />
                {errors.price_yearly && <p className="text-xs text-destructive mt-1">{errors.price_yearly}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select modules included in this plan. Core modules are always included.</p>
            {coreModules.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Core (Always Included)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {coreModules.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 p-2 rounded border bg-muted/50">
                      <Check className="h-3 w-3 text-primary" />
                      <span className="text-sm">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Optional Modules</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {optionalModules.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={data.module_ids.includes(m.id)} onCheckedChange={() => toggleModule(m.id)} />
                    <span className="text-sm">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Set 0 for unlimited.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student_limit">Max Students</Label>
                <Input id="student_limit" type="number" min="0" value={data.student_limit} onChange={(e) => setData('student_limit', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="staff_limit">Max Staff</Label>
                <Input id="staff_limit" type="number" min="0" value={data.staff_limit} onChange={(e) => setData('staff_limit', e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="storage_limit_mb">Storage Limit (MB, 0 = unlimited)</Label>
              <Input id="storage_limit_mb" type="number" min="0" value={data.storage_limit_mb} onChange={(e) => setData('storage_limit_mb', e.target.value)} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <strong>{data.name}</strong></div>
              <div><span className="text-muted-foreground">Code:</span> <strong>{data.code}</strong></div>
              <div><span className="text-muted-foreground">Monthly:</span> <strong>KES {Number(data.price_monthly).toLocaleString()}</strong></div>
              <div><span className="text-muted-foreground">Yearly:</span> <strong>KES {Number(data.price_yearly).toLocaleString()}</strong></div>
              <div><span className="text-muted-foreground">Students:</span> <strong>{data.student_limit === '0' ? 'Unlimited' : data.student_limit}</strong></div>
              <div><span className="text-muted-foreground">Staff:</span> <strong>{data.staff_limit === '0' ? 'Unlimited' : data.staff_limit}</strong></div>
              <div><span className="text-muted-foreground">Modules:</span> <strong>{data.module_ids.length + coreModules.length} selected</strong></div>
              <div><span className="text-muted-foreground">Status:</span> <strong>{data.is_active ? 'Active' : 'Inactive'}</strong></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <Head title="Create Subscription Plan" />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/admin/subscription-plans')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create Plan</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(i)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step {step + 1}: {STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={processing}>
              <Check className="h-4 w-4 mr-1" /> Create Plan
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SubscriptionPlansCreate;
