import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { PAYMENT_PROVIDERS, type SchoolPaymentConfig, type PaymentProvider } from '@/types/payment.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';
import { Smartphone, Building2, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props extends InertiaSharedProps {
  paymentConfigs: SchoolPaymentConfig[];
}

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const { paymentConfigs } = usePage<Props>().props;
  const [configs, setConfigs] = useState<SchoolPaymentConfig[]>(paymentConfigs);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null);
  const [formAccount, setFormAccount] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formPaybill, setFormPaybill] = useState('');
  const [saving, setSaving] = useState(false);
  const [isNewConfig, setIsNewConfig] = useState(false);

  const toggleEnabled = async (id: string) => {
    const config = configs.find(c => c.id === id);
    if (!config) return;

    // Don't allow enabling if no account is configured
    if (!config.accountNumber && !config.enabled) {
      openEdit(config);
      return;
    }

    try {
      const response = await fetch(`/school/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          enabled: !config.enabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment method');
      }

      const data = await response.json();
      
      // Update local state
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
      
      toast({ 
        title: config.enabled ? 'Payment method disabled' : 'Payment method enabled',
        description: data.message 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update payment method. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const openEdit = (config: SchoolPaymentConfig) => {
    setEditingId(config.id);
    setEditingProvider(config.provider);
    setFormAccount(config.accountNumber);
    setFormAccountName(config.accountName);
    setFormPaybill(config.paybillNumber || '');
    setIsNewConfig(false);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingId || !editingProvider) return;
    if (!formAccount.trim()) {
      toast({ 
        title: 'Validation Error', 
        description: 'Account number is required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    
    try {
      const url = isNewConfig 
        ? '/school/payment-methods'
        : `/school/payment-methods/${editingId}`;
      
      const method = isNewConfig ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          provider: isNewConfig ? editingProvider : undefined,
          accountNumber: formAccount,
          accountName: formAccountName,
          paybillNumber: formPaybill || undefined,
          enabled: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save payment method');
      }

      const data = await response.json();
      
      // Update local state with saved config
      if (isNewConfig) {
        // Remove the temporary config and add the real one from backend
        setConfigs(prev => [
          ...prev.filter(c => c.id !== editingId),
          data.config
        ]);
      } else {
        setConfigs(prev => prev.map(c =>
          c.id === editingId
            ? { ...c, accountNumber: formAccount, accountName: formAccountName, paybillNumber: formPaybill || undefined, enabled: true }
            : c
        ));
      }
      
      toast({ 
        title: 'Success', 
        description: data.message || 'Payment method saved successfully.' 
      });
      setEditOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save payment method. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const editingProviderInfo = editingProvider ? PAYMENT_PROVIDERS.find(p => p.id === editingProvider) : null;

  const mobileProviders = configs.filter(c => {
    const p = PAYMENT_PROVIDERS.find(pp => pp.id === c.provider);
    return p?.category === 'mobile_money';
  });

  const bankProviders = configs.filter(c => {
    const p = PAYMENT_PROVIDERS.find(pp => pp.id === c.provider);
    return p?.category === 'bank';
  });

  // Add any missing providers from master list
  const configuredIds = configs.map(c => c.provider);
  const missingProviders = PAYMENT_PROVIDERS.filter(p => !configuredIds.includes(p.id));

  const addProvider = (providerId: PaymentProvider) => {
    const newConfig: SchoolPaymentConfig = {
      id: `new_${Date.now()}`,
      provider: providerId,
      enabled: false,
      accountNumber: '',
      accountName: '',
      order: configs.length + 1,
    };
    setConfigs(prev => [...prev, newConfig]);
    setEditingId(newConfig.id);
    setEditingProvider(providerId);
    setFormAccount('');
    setFormAccountName('');
    setFormPaybill('');
    setIsNewConfig(true);
    setEditOpen(true);
  };

  const renderProviderCard = (config: SchoolPaymentConfig) => {
    const provider = PAYMENT_PROVIDERS.find(p => p.id === config.provider);
    if (!provider) return null;

    return (
      <Card key={config.id} className={cn(
        'border transition-all',
        config.enabled ? 'border-primary/30 shadow-sm' : 'border-border opacity-70'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: provider.color }}
              >
                {provider.category === 'mobile_money' ? <Smartphone className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{provider.name}</h3>
                  {config.enabled ? (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                      <XCircle className="h-3 w-3" /> Inactive
                    </Badge>
                  )}
                </div>
                {config.accountNumber ? (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {config.provider === 'mpesa' ? `Paybill: ${config.paybillNumber} • Acc: ${config.accountNumber}` : `Acc: ${config.accountNumber} • ${config.accountName}`}
                  </p>
                ) : (
                  <p className="text-xs text-destructive mt-0.5">No account configured</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(config)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Switch
                checked={config.enabled}
                onCheckedChange={() => {
                  if (!config.accountNumber && !config.enabled) {
                    openEdit(config);
                  } else {
                    toggleEnabled(config.id);
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <Head title="Payment Methods" />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure how parents can pay school fees. Enable payment methods and add your account details.</p>
        </div>

      {/* Mobile Money */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="h-4 w-4" /> Mobile Money
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {mobileProviders.map(renderProviderCard)}
        </div>
      </div>

      {/* Banks */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Bank Transfers
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bankProviders.map(renderProviderCard)}
        </div>
      </div>

      {/* Add more providers */}
      {missingProviders.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Add More Payment Methods</CardTitle>
            <CardDescription className="text-xs">Click to add a new payment provider</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {missingProviders.map(p => (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => addProvider(p.id)}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingProviderInfo && (
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: editingProviderInfo.color }}>
                  {editingProviderInfo.category === 'mobile_money' ? <Smartphone className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                </div>
              )}
              Configure {editingProviderInfo?.name}
            </DialogTitle>
            <DialogDescription>Enter the school's account details for this payment method.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editingProvider === 'mpesa' && (
              <div className="space-y-2">
                <Label>Paybill / Till Number</Label>
                <Input value={formPaybill} onChange={e => setFormPaybill(e.target.value)} placeholder="e.g. 123456" />
              </div>
            )}
            <div className="space-y-2">
              <Label>{editingProvider === 'mpesa' ? 'Account Number / Name' : 'Account Number'}</Label>
              <Input value={formAccount} onChange={e => setFormAccount(e.target.value)} placeholder={editingProvider === 'mpesa' ? 'e.g. SCHOOLFEES or Student Adm No' : 'e.g. 1234567890'} />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input value={formAccountName} onChange={e => setFormAccountName(e.target.value)} placeholder="e.g. Green Valley Academy Ltd" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formAccount.trim() || saving}>
              {saving ? 'Saving...' : 'Save & Enable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default PaymentMethods;
