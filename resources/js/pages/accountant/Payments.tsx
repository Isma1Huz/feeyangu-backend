import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Eye, Plus } from 'lucide-react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { Payment, Student } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  payments: Payment[];
  students: Student[];
}

const AccountantPayments: React.FC = () => {
  const { payments: initialPayments, students } = usePage<Props>().props;
  const { toast } = useToast();
  const T = useT();
  const t = T.ACCOUNTANT_PAYMENTS_TEXT;
  const pt = T.PAYMENTS_TEXT;
  const COMMON = T.COMMON_TEXT;
  const LABELS = T.PAYMENT_METHOD_LABELS;
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Payment | null>(null);

  // Record Payment modal
  const [recordOpen, setRecordOpen] = useState(false);
  const [rpStudent, setRpStudent] = useState('');
  const [rpAmount, setRpAmount] = useState('');
  const [rpMethod, setRpMethod] = useState<'mpesa' | 'bank' | 'cash' | 'card'>('mpesa');
  const [rpReference, setRpReference] = useState('');
  const [rpDate, setRpDate] = useState(new Date().toISOString().split('T')[0]);
  const [rpNotes, setRpNotes] = useState('');

  const filtered = useMemo(() =>
    payments.filter(p => {
      const matchSearch = !search || p.studentName.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchMethod && matchStatus;
    }), [search, methodFilter, statusFilter, payments]);

  const handleApprove = (id: string) => {
    router.post(`/accountant/payments/${id}/approve`, {}, {
      onSuccess: () => toast({ title: 'Payment approved' }),
      onError: () => toast({ title: 'Error', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  const handleReject = (id: string) => {
    router.post(`/accountant/payments/${id}/reject`, {}, {
      onSuccess: () => toast({ title: 'Payment rejected' }),
      onError: () => toast({ title: 'Error', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  const openRecordPayment = () => {
    setRpStudent('');
    setRpAmount('');
    setRpMethod('mpesa');
    setRpReference('');
    setRpDate(new Date().toISOString().split('T')[0]);
    setRpNotes('');
    setRecordOpen(true);
  };

  const handleRecordPayment = () => {
    if (!rpStudent || !rpAmount || !rpReference.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in student, amount, and reference.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(rpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid positive amount.', variant: 'destructive' });
      return;
    }

    router.post('/accountant/payments', {
      student_id: rpStudent,
      amount,
      method: rpMethod,
      reference: rpReference.trim(),
      date: rpDate,
      notes: rpNotes,
    }, {
      onSuccess: () => {
        const student = students.find(s => s.id === rpStudent);
        const name = student ? `${student.firstName} ${student.lastName}` : 'student';
        toast({ title: 'Payment Recorded', description: `KES ${amount.toLocaleString()} from ${name} — recorded.` });
        setRecordOpen(false);
      },
      onError: () => toast({ title: 'Error', description: 'Failed to record payment.', variant: 'destructive' }),
      preserveState: false,
    });
  };

  const columns: DataTableColumn<Payment>[] = [
    { key: 'date', header: pt.table.date, render: p => <span className="text-sm">{p.date}</span> },
    { key: 'studentName', header: pt.table.student, render: p => <span className="font-medium">{p.studentName}</span> },
    { key: 'amount', header: pt.table.amount, render: p => <span className="font-mono-amount">{COMMON.currency} {p.amount.toLocaleString()}</span> },
    { key: 'method', header: pt.table.method, render: p => <span className="text-sm">{LABELS[p.method]}</span> },
    { key: 'status', header: pt.table.status, render: p => <StatusBadge status={p.status} /> },
    { key: 'reference', header: pt.table.reference, render: p => <span className="text-sm text-muted-foreground font-mono-amount">{p.reference}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'method', label: pt.filters.allMethods, options: Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v })) },
    { key: 'status', label: pt.filters.allStatus, options: [
      { value: 'completed', label: COMMON.status.completed },
      { value: 'pending', label: COMMON.status.pending },
      { value: 'failed', label: COMMON.status.failed },
    ]},
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: pt.actions.approve, icon: <CheckCircle className="h-3.5 w-3.5" />, confirm: true, confirmTitle: 'Approve Payments', confirmDescription: 'Approve selected pending payments?', onClick: (ids) => {
      ids.forEach(id => router.post(`/accountant/payments/${id}/approve`, {}, { preserveState: false }));
      toast({ title: `${ids.length} payments approved` });
    }},
    { label: pt.actions.reject, icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive', confirm: true, confirmTitle: 'Reject Payments', confirmDescription: 'Reject selected payments?', onClick: (ids) => {
      ids.forEach(id => router.post(`/accountant/payments/${id}/reject`, {}, { preserveState: false }));
      toast({ title: `${ids.length} payments rejected` });
    }},
  ];

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={openRecordPayment}>
          <Plus className="h-4 w-4 mr-2" /> {t.recordPayment}
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyField="id"
        searchPlaceholder={pt.searchPlaceholder}
        searchValue={search}
        onSearchChange={setSearch}
        filters={tableFilters}
        filterValues={{ method: methodFilter, status: statusFilter }}
        onFilterChange={(k, v) => { if (k === 'method') setMethodFilter(v); if (k === 'status') setStatusFilter(v); }}
        bulkActions={bulkActions}
        emptyTitle={pt.emptyState.title}
        emptyDescription={pt.emptyState.description}
        rowActions={(p) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(p); setDetailOpen(true); }}><Eye className="h-3 w-3" /></Button>
            {p.status === 'pending' && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => handleApprove(p.id)}><CheckCircle className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleReject(p.id)}><XCircle className="h-3 w-3" /></Button>
              </>
            )}
          </div>
        )}
      />

      {/* Record Payment Modal */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
            <DialogDescription>Enter payment details received from a parent or guardian.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Student <span className="text-destructive">*</span></Label>
              <Select value={rpStudent} onValueChange={setRpStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.grade} {s.className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (KES) <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="0" min="0" step="100" value={rpAmount} onChange={e => setRpAmount(e.target.value)} className="font-mono-amount" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method <span className="text-destructive">*</span></Label>
                <Select value={rpMethod} onValueChange={v => setRpMethod(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={rpDate} onChange={e => setRpDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Reference / Transaction ID <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. MPE-2026-XXX" value={rpReference} onChange={e => setRpReference(e.target.value)} className="font-mono-amount" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any additional notes about this payment..." value={rpNotes} onChange={e => setRpNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Payment Details</DialogTitle><DialogDescription>Transaction details.</DialogDescription></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{pt.table.date}</span><span>{viewing.date}</span>
                <span className="text-muted-foreground">{pt.table.student}</span><span className="font-medium">{viewing.studentName}</span>
                <span className="text-muted-foreground">{pt.table.amount}</span><span className="font-mono-amount font-semibold">{COMMON.currency} {viewing.amount.toLocaleString()}</span>
                <span className="text-muted-foreground">{pt.table.method}</span><span>{LABELS[viewing.method]}</span>
                <span className="text-muted-foreground">{pt.table.status}</span><StatusBadge status={viewing.status} />
                <span className="text-muted-foreground">{pt.table.reference}</span><span className="font-mono-amount">{viewing.reference}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default AccountantPayments;
