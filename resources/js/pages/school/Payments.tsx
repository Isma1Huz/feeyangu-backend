import React, { useState, useMemo } from 'react';
import { Download, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_PAYMENTS } from '@/lib/mock-data';
import type { Payment } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Payments: React.FC = () => {
  const { toast } = useToast();
  const { PAYMENTS_TEXT: t, COMMON_TEXT, PAYMENT_METHOD_LABELS } = useT();
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Payment | null>(null);

  const filtered = useMemo(() =>
    payments.filter(p => {
      const matchSearch = !search || p.studentName.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchMethod && matchStatus;
    }), [search, methodFilter, statusFilter, payments]);

  const handleApprove = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' as const } : p));
    toast({ title: 'Payment approved' });
  };

  const handleReject = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'failed' as const } : p));
    toast({ title: 'Payment rejected' });
  };

  const exportCsv = (data: Payment[]) => {
    const header = 'Date,Student,Amount,Method,Status,Reference\n';
    const rows = data.map(p => `${p.date},${p.studentName},${p.amount},${PAYMENT_METHOD_LABELS[p.method]},${p.status},${p.reference}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Payments exported to CSV.' });
  };

  const handleBulkApprove = (ids: string[]) => {
    setPayments(prev => prev.map(p => ids.includes(p.id) && p.status === 'pending' ? { ...p, status: 'completed' as const } : p));
    toast({ title: `${ids.length} payments approved` });
  };

  const columns: DataTableColumn<Payment>[] = [
    { key: 'date', header: t.table.date, render: p => <span className="text-sm">{p.date}</span> },
    { key: 'studentName', header: t.table.student, render: p => <span className="font-medium">{p.studentName}</span> },
    { key: 'amount', header: t.table.amount, render: p => <span className="font-mono-amount">{COMMON_TEXT.currency} {p.amount.toLocaleString()}</span> },
    { key: 'method', header: t.table.method, render: p => <span className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</span> },
    { key: 'status', header: t.table.status, render: p => <StatusBadge status={p.status} /> },
    { key: 'reference', header: t.table.reference, render: p => <span className="text-sm text-muted-foreground font-mono-amount">{p.reference}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'method', label: t.filters.allMethods, options: Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => ({ value: k, label: v })) },
    { key: 'status', label: t.filters.allStatus, options: [
      { value: 'completed', label: COMMON_TEXT.status.completed },
      { value: 'pending', label: COMMON_TEXT.status.pending },
      { value: 'failed', label: COMMON_TEXT.status.failed },
    ]},
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: t.actions.approve, icon: <CheckCircle className="h-3.5 w-3.5" />, confirm: true, confirmTitle: 'Approve Payments', confirmDescription: 'Are you sure you want to approve the selected payments?', onClick: handleBulkApprove },
    { label: t.actions.reject, icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive', confirm: true, confirmTitle: 'Reject Payments', confirmDescription: 'Are you sure you want to reject the selected payments? This cannot be undone.', onClick: (ids) => {
      setPayments(prev => prev.map(p => ids.includes(p.id) && p.status === 'pending' ? { ...p, status: 'failed' as const } : p));
      toast({ title: `${ids.length} payments rejected` });
    }},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        searchValue={search}
        onSearchChange={setSearch}
        filters={tableFilters}
        filterValues={{ method: methodFilter, status: statusFilter }}
        onFilterChange={(k, v) => { if (k === 'method') setMethodFilter(v); if (k === 'status') setStatusFilter(v); }}
        bulkActions={bulkActions}
        onExport={exportCsv}
        exportLabel={t.exportCsv}
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.actions.viewDetails}</DialogTitle><DialogDescription>Payment transaction details.</DialogDescription></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t.table.date}</span><span>{viewing.date}</span>
                <span className="text-muted-foreground">{t.table.student}</span><span className="font-medium">{viewing.studentName}</span>
                <span className="text-muted-foreground">{t.table.amount}</span><span className="font-mono-amount font-semibold">{COMMON_TEXT.currency} {viewing.amount.toLocaleString()}</span>
                <span className="text-muted-foreground">{t.table.method}</span><span>{PAYMENT_METHOD_LABELS[viewing.method]}</span>
                <span className="text-muted-foreground">{t.table.status}</span><StatusBadge status={viewing.status} />
                <span className="text-muted-foreground">{t.table.reference}</span><span className="font-mono-amount">{viewing.reference}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
