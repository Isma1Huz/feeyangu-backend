import React, { useState } from 'react';
import { CheckCircle, XCircle, Upload, RefreshCw, Link2, Search } from 'lucide-react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { ReconciliationItem } from '@/types/accountant.types';
import type { Payment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  reconciliationItems: ReconciliationItem[];
  systemPayments: Payment[];
}

const Reconciliation: React.FC = () => {
  const { reconciliationItems, systemPayments } = usePage<Props>().props;
  const { toast } = useToast();
  const T = useT();
  const t = T.ACCOUNTANT_RECONCILIATION_TEXT;
  const [items, setItems] = useState<ReconciliationItem[]>(reconciliationItems);

  // Import Statement modal
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importBank, setImportBank] = useState('');
  const [importDateFrom, setImportDateFrom] = useState('');
  const [importDateTo, setImportDateTo] = useState('');

  // Manual Match modal
  const [manualMatchOpen, setManualMatchOpen] = useState(false);
  const [matchingItem, setMatchingItem] = useState<ReconciliationItem | null>(null);
  const [matchSearch, setMatchSearch] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState('');

  const matched = items.filter(i => i.status === 'matched');
  const suggested = items.filter(i => i.status === 'suggested');
  const unmatchedBank = items.filter(i => i.status === 'unmatched_bank');
  const unmatchedSystem = items.filter(i => i.status === 'unmatched_system');

  const confirmMatch = (id: string) => {
    // For suggested items the id is the ReconciliationItem DB id
    // We use the confirm endpoint to change status from 'suggested' to 'matched'
    router.post('/accountant/reconciliation/confirm', { item_id: id }, {
      onSuccess: () => toast({ title: 'Match confirmed' }),
      onError: () => toast({ title: 'Error', description: 'Failed to confirm match.', variant: 'destructive' }),
      preserveState: false,
    });
  };

  const rejectMatch = (id: string) => {
    router.post('/accountant/reconciliation/unmatch', { item_id: id }, {
      onSuccess: () => toast({ title: 'Match rejected' }),
      onError: () => toast({ title: 'Error', description: 'Failed to reject match.', variant: 'destructive' }),
      preserveState: false,
    });
  };

  const handleImportStatement = () => {
    if (!importFile) {
      toast({ title: 'No File Selected', description: 'Please upload a bank statement file.', variant: 'destructive' });
      return;
    }
    if (!importBank) {
      toast({ title: 'Select Bank', description: 'Please select the bank for this statement.', variant: 'destructive' });
      return;
    }
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('bank', importBank);
    if (importDateFrom) formData.append('date_from', importDateFrom);
    if (importDateTo) formData.append('date_to', importDateTo);

    router.post('/accountant/reconciliation/import-statement', formData as any, {
      onSuccess: () => {
        toast({ title: 'Bank Statement Imported', description: `${importFile.name} from ${importBank} processed.` });
        setImportOpen(false);
        setImportFile(null);
      },
      onError: () => toast({ title: 'Error', description: 'Failed to import statement.', variant: 'destructive' }),
      preserveState: false,
    });
  };

  const handleAutoMatch = () => {
    router.post('/accountant/reconciliation/auto-match', {}, {
      onSuccess: () => toast({ title: 'Auto-Match Complete', description: 'High-confidence matches confirmed.' }),
      onError: () => toast({ title: 'Error', description: 'Auto-match failed.', variant: 'destructive' }),
      preserveState: false,
    });
  };

  const openManualMatch = (item: ReconciliationItem) => {
    setMatchingItem(item);
    setMatchSearch('');
    setSelectedPaymentId('');
    setManualMatchOpen(true);
  };

  const filteredPayments = systemPayments.filter(p => {
    if (!matchSearch) return true;
    return p.studentName.toLowerCase().includes(matchSearch.toLowerCase()) ||
           p.reference.toLowerCase().includes(matchSearch.toLowerCase());
  });

  const handleManualMatch = () => {
    if (!matchingItem || !selectedPaymentId) {
      toast({ title: 'Select a Payment', description: 'Please select a system payment to match with.', variant: 'destructive' });
      return;
    }
    router.post('/accountant/reconciliation/match', {
      bank_transaction_id: matchingItem.id.startsWith('bank-') ? matchingItem.id.slice(5) : matchingItem.id,
      system_payment_id: selectedPaymentId,
      confidence: 'high',
    }, {
      onSuccess: () => {
        const payment = systemPayments.find(p => p.id === selectedPaymentId);
        toast({ title: 'Manual Match Created', description: `Matched with ${payment?.studentName} — ${payment?.reference}` });
        setManualMatchOpen(false);
      },
      onError: () => toast({ title: 'Error', description: 'Failed to create match.', variant: 'destructive' }),
      preserveState: false,
    });
  };

  const ReconciliationCard = ({ item }: { item: ReconciliationItem }) => (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {item.bankTransaction && (
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Bank Transaction</p>
              <p className="text-sm font-medium truncate">{item.bankTransaction.description}</p>
              <p className="text-xs text-muted-foreground">{item.bankTransaction.date} · Ref: {item.bankTransaction.reference}</p>
              <p className="text-sm font-mono-amount font-semibold mt-1">KES {item.bankTransaction.amount.toLocaleString()}</p>
            </div>
          )}
          {item.systemPaymentId && (
            <div className={item.bankTransaction ? 'border-t pt-2 mt-2' : ''}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">System Payment</p>
              <p className="text-sm font-medium">{item.systemStudentName}</p>
              <p className="text-xs text-muted-foreground">Ref: {item.systemPaymentRef}</p>
              <p className="text-sm font-mono-amount font-semibold mt-1">KES {item.systemAmount?.toLocaleString()}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {item.confidence && (
            <Badge variant={item.confidence === 'high' ? 'default' : item.confidence === 'medium' ? 'secondary' : 'outline'} className="text-[10px]">
              {t.confidence[item.confidence]}
            </Badge>
          )}
          {item.status === 'matched' && (
            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
              <CheckCircle className="h-3 w-3 mr-1" /> Matched
            </Badge>
          )}
          {item.status === 'suggested' && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => confirmMatch(item.id)}>
                <CheckCircle className="h-3 w-3 mr-1" /> {t.actions.confirmMatch}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => rejectMatch(item.id)}>
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          )}
          {(item.status === 'unmatched_bank' || item.status === 'unmatched_system') && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openManualMatch(item)}>
              <Link2 className="h-3 w-3 mr-1" /> {t.actions.manualMatch}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setImportFile(null); setImportBank(''); setImportDateFrom(''); setImportDateTo(''); setImportOpen(true); }}>
            <Upload className="h-4 w-4 mr-2" /> {t.importStatement}
          </Button>
          <Button onClick={handleAutoMatch}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t.autoMatch}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{matched.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Matched</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-warning">{suggested.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Suggested</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{unmatchedBank.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Unmatched Bank</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{unmatchedSystem.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Unmatched System</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="suggested">
        <TabsList>
          <TabsTrigger value="matched">Matched ({matched.length})</TabsTrigger>
          <TabsTrigger value="suggested">Suggested ({suggested.length})</TabsTrigger>
          <TabsTrigger value="unmatched_bank">Unmatched Bank ({unmatchedBank.length})</TabsTrigger>
          <TabsTrigger value="unmatched_system">Unmatched System ({unmatchedSystem.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="matched" className="space-y-3 mt-4">
          {matched.map(item => <ReconciliationCard key={item.id} item={item} />)}
          {matched.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No matched transactions.</p>}
        </TabsContent>
        <TabsContent value="suggested" className="space-y-3 mt-4">
          {suggested.map(item => <ReconciliationCard key={item.id} item={item} />)}
          {suggested.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No suggested matches.</p>}
        </TabsContent>
        <TabsContent value="unmatched_bank" className="space-y-3 mt-4">
          {unmatchedBank.map(item => <ReconciliationCard key={item.id} item={item} />)}
          {unmatchedBank.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">All bank transactions matched.</p>}
        </TabsContent>
        <TabsContent value="unmatched_system" className="space-y-3 mt-4">
          {unmatchedSystem.map(item => <ReconciliationCard key={item.id} item={item} />)}
          {unmatchedSystem.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">All system payments matched.</p>}
        </TabsContent>
      </Tabs>

      {/* Import Bank Statement Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Bank Statement</DialogTitle>
            <DialogDescription>Upload a CSV or Excel bank statement for automatic transaction matching.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bank <span className="text-destructive">*</span></Label>
              <Select value={importBank} onValueChange={setImportBank}>
                <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kcb">Kenya Commercial Bank (KCB)</SelectItem>
                  <SelectItem value="equity">Equity Bank</SelectItem>
                  <SelectItem value="cooperative">Cooperative Bank</SelectItem>
                  <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                  <SelectItem value="absa">ABSA Bank Kenya</SelectItem>
                  <SelectItem value="ncba">NCBA Bank</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input type="date" value={importDateFrom} onChange={e => setImportDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input type="date" value={importDateTo} onChange={e => setImportDateTo(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bank Statement File <span className="text-destructive">*</span></Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('statement-upload')?.click()}>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {importFile ? (
                  <div>
                    <p className="text-sm font-medium">{importFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports CSV, XLS, XLSX</p>
                  </div>
                )}
              </div>
              <input id="statement-upload" type="file" accept=".csv,.xls,.xlsx" className="hidden"
                onChange={e => setImportFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImportStatement} disabled={!importFile || !importBank}>Import & Parse</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Match Modal */}
      <Dialog open={manualMatchOpen} onOpenChange={setManualMatchOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual Match</DialogTitle>
            <DialogDescription>
              Link {matchingItem?.bankTransaction ? 'this bank transaction' : 'this system payment'} to a matching record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Source record */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {matchingItem?.bankTransaction ? 'Bank Transaction' : 'System Payment'}
              </p>
              <p className="text-sm font-medium">
                {matchingItem?.bankTransaction?.description || matchingItem?.systemStudentName || 'Unknown'}
              </p>
              <p className="text-sm font-mono-amount font-semibold mt-1">
                KES {(matchingItem?.bankTransaction?.amount || matchingItem?.systemAmount || 0).toLocaleString()}
              </p>
            </div>

            {/* Search & select payment */}
            <div className="space-y-2">
              <Label>Search System Payments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by student name or reference..." value={matchSearch} onChange={e => setMatchSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredPayments.map(p => (
                <div key={p.id}
                  className={`flex items-center justify-between px-3 py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors ${selectedPaymentId === p.id ? 'bg-primary/5 border-primary/20' : ''}`}
                  onClick={() => setSelectedPaymentId(p.id)}>
                  <div>
                    <p className="text-sm font-medium">{p.studentName}</p>
                    <p className="text-xs text-muted-foreground">{p.date} · {p.reference}</p>
                  </div>
                  <span className="text-sm font-mono-amount font-semibold">KES {p.amount.toLocaleString()}</span>
                </div>
              ))}
              {filteredPayments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No matching payments found.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualMatchOpen(false)}>Cancel</Button>
            <Button onClick={handleManualMatch} disabled={!selectedPaymentId}>Confirm Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default Reconciliation;
