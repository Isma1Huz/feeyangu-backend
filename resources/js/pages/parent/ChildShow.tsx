import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { PAYMENT_PROVIDERS, type PaymentProvider, type PaymentTransaction } from '@/types/payment.types';
// REMOVED MOCK DATA IMPORT: import { schoolPaymentConfigs } from '@/data/payment-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/AppLayout';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Smartphone, Building2,
  Loader2, AlertTriangle, Download, Phone, Shield,
} from 'lucide-react';

type PaymentStep = 'select' | 'method' | 'pay' | 'processing' | 'success' | 'manual_confirm';

const CURRENCY = 'KES';

interface Child {
  id: string;
  admission_number: string;
  full_name: string;
  first_name: string;
  last_name: string;
  grade: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
  school: {
    id: string;
    name: string;
    location: string;
  };
  status: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  due_date: string;
  issued_date: string;
  items: {
    name: string;
    amount: number;
  }[];
}

interface Payment {
  id: string;
  amount: number;
  provider: string;
  status: string;
  reference: string;
  created_at: string;
  has_receipt: boolean;
  receipt_number: string | null;
}

interface PaymentMethod {
  id: string;
  provider: string;
  account_name: string;
  account_number: string;
  paybill_number: string | null;
}

interface FinancialSummary {
  total_invoiced: number;
  total_paid: number;
  total_balance: number;
  overdue_amount: number;
}

interface Props extends InertiaSharedProps {
  child: Child;
  invoices: Invoice[];
  recentPayments: Payment[];
  financialSummary: FinancialSummary;
  paymentMethods: PaymentMethod[];
}

const ChildShow: React.FC = () => {
  const { child, invoices, recentPayments, financialSummary, paymentMethods } = usePage<Props>().props;
  const { toast } = useToast();

  const enabledConfigs = paymentMethods;

  const [payOpen, setPayOpen] = useState(false);
  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transactionRef, setTransactionRef] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<{ receiptNo: string; amount: number; items: { name: string; amount: number }[]; date: string } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  if (!child) {
    return <div className="p-8 text-center text-muted-foreground">Student not found.</div>;
  }

  // Use invoices with balance from backend data
  const itemsWithBalance = invoices
    .filter(invoice => invoice.balance > 0)
    .map((invoice, idx) => ({
      ...invoice,
      idx,
    }));

  const totalBalance = financialSummary.total_balance;
  const selectedTotal = selectedItems.reduce((s, idx) => {
    const invoice = invoices[idx];
    return s + (invoice ? invoice.balance : 0);
  }, 0);
  const overallPct = financialSummary.total_invoiced > 0 
    ? Math.round((financialSummary.total_paid / financialSummary.total_invoiced) * 100) 
    : 0;

  const toggleItem = (idx: number) => {
    setSelectedItems(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const selectAll = () => setSelectedItems(itemsWithBalance.map(i => i.idx));

  const startPayment = () => {
    setSelectedItems(itemsWithBalance.map(i => i.idx));
    setStep('select');
    setSelectedProvider(null);
    setPhoneNumber('');
    setProcessingProgress(0);
    setTransactionRef('');
    setReceiptData(null);
    setPayOpen(true);
  };

  const selectedProviderData = selectedProvider ? PAYMENT_PROVIDERS.find(p => p.id === selectedProvider) : null;
  const selectedConfig = selectedProvider ? enabledConfigs.find(c => c.provider === selectedProvider) : null;

  const getInstructions = () => {
    if (!selectedProviderData || !selectedConfig) return [];
    // Use transaction reference if available, otherwise show placeholder
    const ref = transactionRef || '{reference will be generated}';
    return selectedProviderData.instructions.map(i =>
      i.replace('{paybill}', selectedConfig.paybill_number || '')
        .replace('{account}', selectedConfig.account_number)
        .replace('{accountName}', selectedConfig.account_name)
        .replace('{amount}', selectedTotal.toLocaleString())
        .replace('{reference}', ref)
    );
  };

  const handleInitiatePayment = async () => {
    if (!selectedProvider) return;
    
    try {
      setStep('processing');
      setProcessingProgress(0);

      // Call backend to initiate payment
      const response = await fetch(`/parent/children/${child.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          amount: selectedTotal,
          provider: selectedProvider,
          phone_number: phoneNumber || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionRef(data.reference);
        setTransactionId(data.transaction_id);

        // Start polling for payment status
        if (data.is_mobile_money) {
          // M-Pesa - poll frequently
          pollPaymentStatus(data.transaction_id, 2000);
        } else {
          // Bank transfer - poll less frequently with longer timeout
          pollPaymentStatus(data.transaction_id, 3000);
        }
      } else {
        toast({
          title: 'Payment Initiation Failed',
          description: data.message || 'Unable to initiate payment',
          variant: 'destructive',
        });
        setStep('method');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
      setStep('method');
    }
  };

  const pollPaymentStatus = useCallback(async (txnId: string, interval: number) => {
    if (isPolling) return;
    setIsPolling(true);

    let attempts = 0;
    const maxAttempts = 30; // Maximum 60 seconds for M-Pesa, 90 seconds for bank
    
    const poll = async () => {
      try {
        const response = await fetch(`/parent/children/${child.id}/pay/${txnId}/status`);
        const data = await response.json();

        // Update progress based on attempts
        const progress = Math.min((attempts / maxAttempts) * 100, 95);
        setProcessingProgress(progress);

        if (data.status === 'completed') {
          setProcessingProgress(100);
          setIsPolling(false);
          completePayment(data);
        } else if (data.status === 'pending_confirmation') {
          setIsPolling(false);
          setStep('manual_confirm');
        } else if (data.status === 'failed') {
          setIsPolling(false);
          toast({
            title: 'Payment Failed',
            description: 'The payment could not be processed.',
            variant: 'destructive',
          });
          setStep('method');
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, interval);
          } else {
            // Timeout - show manual confirm
            setIsPolling(false);
            setStep('manual_confirm');
          }
        }
      } catch (error) {
        console.error('Status poll error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          setIsPolling(false);
          setStep('manual_confirm');
        }
      }
    };

    poll();
  }, [child.id, isPolling, toast]);

  const completePayment = (paymentData?: any) => {
    const items = selectedItems.map(idx => {
      const invoice = invoices[idx];
      return {
        name: invoice?.invoice_number ?? `Invoice #${idx + 1}`,
        amount: invoice?.balance ?? 0,
      };
    });
    setReceiptData({
      receiptNo: paymentData?.provider_reference || `RCT-${Date.now().toString().slice(-6)}`,
      amount: selectedTotal,
      items,
      date: new Date().toISOString().split('T')[0],
    });
    setStep('success');
    
    // Refresh page data after successful payment
    setTimeout(() => {
      router.reload({ only: ['invoices', 'recentPayments', 'financialSummary'] });
    }, 3000);
  };

  const handleManualConfirm = async () => {
    if (!transactionId) return;

    try {
      setStep('processing');
      setProcessingProgress(0);

      const response = await fetch(`/parent/children/${child.id}/pay/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          transaction_id: transactionId,
        }),
      });

      const data = await response.json();

      if (data.success && data.status === 'completed') {
        setProcessingProgress(100);
        completePayment(data);
      } else {
        toast({
          title: 'Verification in Progress',
          description: data.message || 'Please check back later for payment confirmation.',
          variant: 'default',
        });
        setStep('manual_confirm');
      }
    } catch (error) {
      console.error('Manual confirm error:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm payment. Please try again.',
        variant: 'destructive',
      });
      setStep('manual_confirm');
    }
  };

  const closePayment = () => {
    setPayOpen(false);
    setStep('select');
    setSelectedItems([]);
    setReceiptData(null);
    setTransactionRef('');
    setTransactionId(null);
    setIsPolling(false);
  };

  const stepIndex = ['select', 'method', 'pay', 'processing', 'success'].indexOf(
    step === 'manual_confirm' ? 'processing' : step
  );

  return (
    <AppLayout>
      <Head title={`${child.full_name} — Fee Statement`} />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.visit('/parent/children')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{child.full_name} — Fee Statement</h1>
            <p className="text-muted-foreground text-sm mt-1">{child.grade.name} · {child.class.name}</p>
          </div>
        </div>

      {/* Summary */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-3xl font-bold font-mono-amount mt-1">{CURRENCY} {totalBalance.toLocaleString()}</p>
            </div>
            {totalBalance > 0 && (
              <Button className="gap-2" onClick={startPayment}>
                <Shield className="h-4 w-4" /> Pay Now
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-mono-amount font-medium">{overallPct}%</span>
            </div>
            <Progress value={overallPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Invoice/Fee Breakdown */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.issued_date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.due_date}</TableCell>
                    <TableCell className="text-right font-mono-amount">{CURRENCY} {invoice.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono-amount text-success">{CURRENCY} {invoice.paid_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono-amount font-semibold">{CURRENCY} {invoice.balance.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={closePayment}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 px-6 pt-6 pb-2">
            {['Select Items', 'Payment Method', 'Pay', 'Complete'].map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    stepIndex === i ? 'bg-primary text-primary-foreground scale-110 shadow-md' :
                    stepIndex > i ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )}>{i + 1}</div>
                  <span className={cn('text-[10px] hidden sm:block', stepIndex >= i ? 'text-primary font-medium' : 'text-muted-foreground')}>{label}</span>
                </div>
                {i < 3 && <div className={cn('w-8 h-0.5 mt-[-12px] sm:mt-0', stepIndex > i ? 'bg-primary/40' : 'bg-muted')} />}
              </React.Fragment>
            ))}
          </div>

          <div className="px-6 pb-6">
            {/* Step 1: Select Items */}
            {step === 'select' && (
              <div className="space-y-4">
                <DialogHeader><DialogTitle>Select Invoices to Pay</DialogTitle></DialogHeader>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm font-medium">Outstanding Invoices</span>
                    <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={selectAll}>Select All</Button>
                  </div>
                  {itemsWithBalance.map(invoice => (
                    <label key={invoice.idx} className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                      selectedItems.includes(invoice.idx) ? 'border-primary/50 bg-primary/5 shadow-sm' : 'hover:bg-muted/50'
                    )}>
                      <Checkbox checked={selectedItems.includes(invoice.idx)} onCheckedChange={() => toggleItem(invoice.idx)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">Due: {invoice.due_date}</p>
                      </div>
                      <span className="text-sm font-mono-amount font-semibold">{CURRENCY} {invoice.balance.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <div>
                    <span className="text-xs text-muted-foreground">Total selected</span>
                    <p className="font-mono-amount text-lg font-bold text-primary">{CURRENCY} {selectedTotal.toLocaleString()}</p>
                  </div>
                  <Button onClick={() => setStep('method')} disabled={selectedItems.length === 0} className="gap-1.5">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Choose Payment Method */}
            {step === 'method' && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Choose Payment Method</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">Amount: <span className="font-mono-amount font-bold text-primary">{CURRENCY} {selectedTotal.toLocaleString()}</span></p>
                </DialogHeader>

                {/* Mobile Money */}
                {enabledConfigs.some(c => PAYMENT_PROVIDERS.find(p => p.id === c.provider)?.category === 'mobile_money') && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile Money</h3>
                    {enabledConfigs.filter(c => PAYMENT_PROVIDERS.find(p => p.id === c.provider)?.category === 'mobile_money').map(config => {
                      const provider = PAYMENT_PROVIDERS.find(p => p.id === config.provider)!;
                      return (
                        <button
                          key={config.id}
                          onClick={() => setSelectedProvider(config.provider)}
                          className={cn(
                            'w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                            selectedProvider === config.provider
                              ? 'border-primary shadow-md bg-primary/5 ring-2 ring-primary/20'
                              : 'hover:bg-muted/50 hover:border-border'
                          )}
                        >
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: provider.color }}>
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">Instant payment via STK push</p>
                          </div>
                          {selectedProvider === config.provider && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Banks */}
                {enabledConfigs.some(c => PAYMENT_PROVIDERS.find(p => p.id === c.provider)?.category === 'bank') && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Transfer</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {enabledConfigs.filter(c => PAYMENT_PROVIDERS.find(p => p.id === c.provider)?.category === 'bank').map(config => {
                        const provider = PAYMENT_PROVIDERS.find(p => p.id === config.provider)!;
                        return (
                          <button
                            key={config.id}
                            onClick={() => setSelectedProvider(config.provider)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                              selectedProvider === config.provider
                                ? 'border-primary shadow-md bg-primary/5 ring-2 ring-primary/20'
                                : 'hover:bg-muted/50'
                            )}
                          >
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: provider.color }}>
                              <Building2 className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium">{provider.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t">
                  <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                  <Button onClick={() => setStep('pay')} disabled={!selectedProvider} className="gap-1.5">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Pay — M-Pesa phone input or Bank instructions */}
            {step === 'pay' && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedProviderData && (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: selectedProviderData.color }}>
                        {selectedProviderData.category === 'mobile_money' ? <Smartphone className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      </div>
                    )}
                    Pay via {selectedProviderData?.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Amount summary */}
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">Amount to Pay</p>
                  <p className="text-2xl font-bold font-mono-amount text-primary">{CURRENCY} {selectedTotal.toLocaleString()}</p>
                </div>

                {selectedProvider === 'mpesa' ? (
                  /* M-Pesa - Enter phone number */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> M-Pesa Phone Number</Label>
                      <Input
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="text-center text-lg font-mono-amount tracking-wider"
                        maxLength={12}
                      />
                      <p className="text-xs text-muted-foreground text-center">You will receive an M-Pesa prompt on this number</p>
                    </div>
                    <div className="bg-accent/50 rounded-xl p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground">Payment Details</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span className="text-muted-foreground">Paybill:</span><span className="font-mono-amount font-medium">{selectedConfig?.paybill_number}</span>
                        <span className="text-muted-foreground">Account:</span><span className="font-mono-amount font-medium">{selectedConfig?.account_number}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Bank - Show instructions */
                  <div className="space-y-3">
                    <div className="bg-accent/50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Details</p>
                      <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 text-sm">
                        <span className="text-muted-foreground">Bank:</span><span className="font-medium">{selectedProviderData?.name}</span>
                        <span className="text-muted-foreground">Account:</span><span className="font-mono-amount font-medium">{selectedConfig?.account_number}</span>
                        <span className="text-muted-foreground">Name:</span><span className="font-medium">{selectedConfig?.account_name}</span>
                        <span className="text-muted-foreground">Reference:</span><span className="font-mono-amount font-medium">{transactionRef || 'Will be generated'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">How to Pay</p>
                      <ol className="space-y-1.5">
                        {getInstructions().map((inst, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</span>
                            <span className="text-muted-foreground">{inst}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t">
                  <Button variant="outline" onClick={() => setStep('method')}>Back</Button>
                  <Button
                    onClick={handleInitiatePayment}
                    disabled={selectedProvider === 'mpesa' && phoneNumber.length < 10}
                    className="gap-2"
                  >
                    {selectedProvider === 'mpesa' ? (
                      <><Smartphone className="h-4 w-4" /> Send M-Pesa Prompt</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> I've Made the Transfer</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {step === 'processing' && (
              <div className="space-y-6 py-8 text-center">
                <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Processing Payment</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProvider === 'mpesa' 
                      ? 'Waiting for M-Pesa confirmation. Please check your phone and enter your PIN...' 
                      : 'Verifying your bank transfer. This usually takes 20-30 seconds...'}
                  </p>
                  {selectedProvider !== 'mpesa' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      We're checking with {selectedProviderData?.name} to confirm your payment.
                    </p>
                  )}
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <Progress value={processingProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{Math.round(processingProgress)}% complete</p>
                </div>
                <p className="text-xs text-muted-foreground">Please do not close this window</p>
              </div>
            )}

            {/* Manual Confirm Fallback */}
            {step === 'manual_confirm' && (
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  </div>
                  <h3 className="text-lg font-bold">Automatic Verification Failed</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We couldn't automatically verify your payment. If you've completed the transaction, click "Confirm Payment" to check against our transaction records.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono-amount font-bold">{CURRENCY} {selectedTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{selectedProviderData?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono-amount">{transactionRef}</span></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('pay')}>Try Again</Button>
                  <Button className="flex-1 gap-2" onClick={handleManualConfirm}>
                    <CheckCircle2 className="h-4 w-4" /> Confirm Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Success */}
            {step === 'success' && receiptData && (
              <div className="space-y-4 py-2">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-lg font-bold">Payment Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    {CURRENCY} {receiptData.amount.toLocaleString()} paid via {selectedProviderData?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your receipt will be available in the Receipts section
                  </p>
                </div>
                <div className="border rounded-xl p-4 space-y-3 text-sm bg-gradient-to-br from-success/5 to-primary/5">
                  <div className="text-center border-b pb-2">
                    <h4 className="font-bold">{child.school.name}</h4>
                    <p className="text-xs text-muted-foreground">Payment Receipt: {receiptData.receiptNo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Date:</span><span>{receiptData.date}</span>
                    <span className="text-muted-foreground">Student:</span><span>{child.full_name}</span>
                    <span className="text-muted-foreground">Admission No:</span><span className="font-mono-amount">{child.admission_number}</span>
                    <span className="text-muted-foreground">Method:</span><span>{selectedProviderData?.name}</span>
                    <span className="text-muted-foreground">Ref:</span><span className="font-mono-amount text-[10px]">{transactionRef}</span>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Items Paid</p>
                    {receiptData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-border/30 pb-1 mb-1">
                        <span>{item.name}</span>
                        <span className="font-mono-amount">{CURRENCY} {item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t">
                    <span>Total Paid</span>
                    <span className="font-mono-amount text-success">{CURRENCY} {receiptData.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1" onClick={() => window.print()}>
                    <Download className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button className="flex-1" onClick={closePayment}>View Updated Balance</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default ChildShow;
