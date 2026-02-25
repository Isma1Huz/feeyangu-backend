import React, { useState, useMemo } from 'react';
import { Eye, Send, Download, XCircle, CheckCircle, Plus } from 'lucide-react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { Invoice } from '@/types/accountant.types';
import type { Student, FeeStructure } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  invoices: Invoice[];
  students: Student[];
  feeStructures: FeeStructure[];
  grades: string[];
}

const statusMap: Record<string, 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'overdue' | 'paid' | 'partial'> = { paid: 'paid', partial: 'partial', overdue: 'overdue', sent: 'pending', draft: 'inactive', void: 'inactive' };

const Invoicing: React.FC = () => {
  const { invoices: initialInvoices, students, feeStructures, grades } = usePage<Props>().props;
  const { toast } = useToast();
  const T = useT();
  const t = T.ACCOUNTANT_INVOICING_TEXT;
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Invoice | null>(null);

  // Generate Invoices modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genGrade, setGenGrade] = useState('all');
  const [genTerm, setGenTerm] = useState('Term 1 2026');
  const [genDueDate, setGenDueDate] = useState('2026-03-01');
  const [genSelectedStudents, setGenSelectedStudents] = useState<Set<string>>(new Set());
  const [genSendVia, setGenSendVia] = useState<'email' | 'sms' | 'both' | 'none'>('email');

  // Mark as Paid modal
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<Invoice | null>(null);
  const [markPaidAmount, setMarkPaidAmount] = useState('');

  const filtered = useMemo(() =>
    invoices.filter(inv => {
      const matchSearch = !search || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.studentName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchGrade = gradeFilter === 'all' || inv.grade === gradeFilter;
      return matchSearch && matchStatus && matchGrade;
    }), [search, statusFilter, gradeFilter, invoices]);

  const eligibleStudents = useMemo(() => {
    const existingStudentIds = new Set(invoices.filter(i => i.term === genTerm).map(i => i.studentId));
    return students.filter(s => {
      if (genGrade !== 'all' && s.grade !== genGrade) return false;
      return !existingStudentIds.has(s.id);
    });
  }, [genGrade, genTerm, invoices, students]);

  const openGenerate = () => {
    setGenGrade('all');
    setGenTerm('Term 1 2026');
    setGenDueDate('2026-03-01');
    setGenSelectedStudents(new Set());
    setGenSendVia('email');
    setGenerateOpen(true);
  };

  const toggleStudentSelection = (id: string) => {
    setGenSelectedStudents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllStudents = () => {
    if (genSelectedStudents.size === eligibleStudents.length) {
      setGenSelectedStudents(new Set());
    } else {
      setGenSelectedStudents(new Set(eligibleStudents.map(s => s.id)));
    }
  };

  const handleGenerateInvoices = () => {
    if (genSelectedStudents.size === 0) {
      toast({ title: 'No Students Selected', description: 'Please select at least one student to generate invoices.', variant: 'destructive' });
      return;
    }

    const newInvoices: Invoice[] = [];
    genSelectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const feeStructure = feeStructures.find(fs => fs.grade === student.grade && fs.status === 'active');
      const items = feeStructure?.items.map(i => ({ name: i.name, amount: i.amount })) || [{ name: 'Tuition', amount: 25000 }];
      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
      newInvoices.push({
        id: `inv${Date.now()}-${studentId}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-4)}-${studentId.slice(-2).toUpperCase()}`,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        term: genTerm,
        items,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: genSendVia === 'none' ? 'draft' : 'sent',
        dueDate: genDueDate,
        issuedDate: new Date().toISOString().split('T')[0],
        sentVia: genSendVia,
      });
    });

    setInvoices(prev => [...newInvoices, ...prev]);
    toast({ title: `${newInvoices.length} Invoices Generated`, description: genSendVia !== 'none' ? `Sent via ${genSendVia} to parents.` : 'Saved as drafts.' });
    setGenerateOpen(false);
  };

  const openMarkPaid = (inv: Invoice) => {
    setMarkPaidInvoice(inv);
    setMarkPaidAmount(String(inv.balance));
    setMarkPaidOpen(true);
  };

  const handleMarkPaid = () => {
    if (!markPaidInvoice) return;
    const amount = parseFloat(markPaidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', variant: 'destructive' });
      return;
    }
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== markPaidInvoice.id) return inv;
      const newPaid = inv.paidAmount + Math.min(amount, inv.balance);
      const newBalance = inv.totalAmount - newPaid;
      return { ...inv, paidAmount: newPaid, balance: newBalance, status: newBalance <= 0 ? 'paid' : 'partial' };
    }));
    toast({ title: 'Payment Applied', description: `KES ${amount.toLocaleString()} applied to ${markPaidInvoice.invoiceNumber}` });
    setMarkPaidOpen(false);
  };

  const columns: DataTableColumn<Invoice>[] = [
    { key: 'invoiceNumber', header: t.table.invoiceNo, render: inv => <span className="font-mono-amount text-sm font-medium">{inv.invoiceNumber}</span> },
    { key: 'studentName', header: t.table.student, render: inv => <span className="font-medium">{inv.studentName}</span> },
    { key: 'grade', header: t.table.grade, render: inv => <span className="text-sm">{inv.grade}</span> },
    { key: 'totalAmount', header: t.table.total, render: inv => <span className="font-mono-amount">KES {inv.totalAmount.toLocaleString()}</span> },
    { key: 'paidAmount', header: t.table.paid, render: inv => <span className="font-mono-amount text-success">KES {inv.paidAmount.toLocaleString()}</span> },
    { key: 'balance', header: t.table.balance, render: inv => <span className={`font-mono-amount font-semibold ${inv.balance > 0 ? 'text-destructive' : 'text-success'}`}>KES {inv.balance.toLocaleString()}</span> },
    { key: 'status', header: t.table.status, render: inv => <StatusBadge status={statusMap[inv.status] || 'pending'} /> },
    { key: 'dueDate', header: t.table.dueDate, render: inv => <span className="text-sm text-muted-foreground">{inv.dueDate}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'status', label: t.filters.allStatus, options: [
      { value: 'paid', label: 'Paid' }, { value: 'partial', label: 'Partial' },
      { value: 'overdue', label: 'Overdue' }, { value: 'sent', label: 'Sent' },
      { value: 'draft', label: 'Draft' }, { value: 'void', label: 'Void' },
    ]},
    { key: 'grade', label: t.filters.allGrades, options: grades.map(g => ({ value: g, label: g })) },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: t.actions.send, icon: <Send className="h-3.5 w-3.5" />, confirm: true, confirmTitle: 'Send Invoices', confirmDescription: 'Send selected invoices to parents via email?', onClick: (ids) => {
      setInvoices(prev => prev.map(inv => ids.includes(inv.id) ? { ...inv, sentVia: 'email' as const, status: inv.status === 'draft' ? 'sent' as const : inv.status } : inv));
      toast({ title: `${ids.length} invoices sent` });
    }},
    { label: t.actions.void, icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive', confirm: true, confirmTitle: 'Void Invoices', confirmDescription: 'Are you sure? This cannot be undone.', onClick: (ids) => {
      setInvoices(prev => prev.map(inv => ids.includes(inv.id) ? { ...inv, status: 'void' as const } : inv));
      toast({ title: `${ids.length} invoices voided` });
    }},
  ];

  const exportCsv = (data: Invoice[]) => {
    const header = 'Invoice #,Student,Grade,Total,Paid,Balance,Status,Due Date\n';
    const rows = data.map(inv => `${inv.invoiceNumber},${inv.studentName},${inv.grade},${inv.totalAmount},${inv.paidAmount},${inv.balance},${inv.status},${inv.dueDate}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Invoices exported to CSV.' });
  };

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <Head title={t.title} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={openGenerate}>
          <Plus className="h-4 w-4 mr-2" /> {t.generateInvoices}
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        searchValue={search}
        onSearchChange={setSearch}
        filters={tableFilters}
        filterValues={{ status: statusFilter, grade: gradeFilter }}
        onFilterChange={(k, v) => { if (k === 'status') setStatusFilter(v); if (k === 'grade') setGradeFilter(v); }}
        bulkActions={bulkActions}
        onExport={exportCsv}
        exportLabel="Export CSV"
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(inv) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(inv); setDetailOpen(true); }}><Eye className="h-3 w-3" /></Button>
            {inv.status !== 'void' && inv.status !== 'paid' && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                  setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, sentVia: 'email' as const, status: i.status === 'draft' ? 'sent' as const : i.status } : i));
                  toast({ title: `Reminder sent to ${inv.studentName}` });
                }}><Send className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => openMarkPaid(inv)}><CheckCircle className="h-3 w-3" /></Button>
              </>
            )}
          </div>
        )}
      />

      {/* Generate Invoices Modal */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invoices</DialogTitle>
            <DialogDescription>Select students and term to auto-generate invoices from fee structures.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={genGrade} onValueChange={setGenGrade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={genTerm} onValueChange={setGenTerm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1 2026">Term 1 2026</SelectItem>
                    <SelectItem value="Term 2 2026">Term 2 2026</SelectItem>
                    <SelectItem value="Term 3 2026">Term 3 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={genDueDate} onChange={e => setGenDueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Send Via</Label>
              <Select value={genSendVia} onValueChange={v => setGenSendVia(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Email & SMS</SelectItem>
                  <SelectItem value="none">Save as Draft (don't send)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Checkbox checked={eligibleStudents.length > 0 && genSelectedStudents.size === eligibleStudents.length} onCheckedChange={toggleAllStudents} />
                  <span className="text-sm font-medium">Select Students ({genSelectedStudents.size}/{eligibleStudents.length})</span>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {eligibleStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">All students already have invoices for {genTerm}.</p>
                ) : (
                  eligibleStudents.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 border-b last:border-0">
                      <Checkbox checked={genSelectedStudents.has(s.id)} onCheckedChange={() => toggleStudentSelection(s.id)} />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.grade} · {s.className}</span>
                      </div>
                      <span className="text-xs font-mono-amount text-muted-foreground">
                        {(() => { const fs = feeStructures.find(f => f.grade === s.grade && f.status === 'active'); return fs ? `KES ${fs.totalAmount.toLocaleString()}` : '—'; })()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateInvoices} disabled={genSelectedStudents.size === 0}>
              Generate {genSelectedStudents.size} Invoice{genSelectedStudents.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Modal */}
      <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Apply payment to invoice {markPaidInvoice?.invoiceNumber}.</DialogDescription>
          </DialogHeader>
          {markPaidInvoice && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Student</span><span className="font-medium">{markPaidInvoice.studentName}</span>
                <span className="text-muted-foreground">Outstanding</span><span className="font-mono-amount text-destructive font-semibold">KES {markPaidInvoice.balance.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <Label>Payment Amount (KES)</Label>
                <Input type="number" min="0" max={markPaidInvoice.balance} value={markPaidAmount} onChange={e => setMarkPaidAmount(e.target.value)} className="font-mono-amount" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid}>Apply Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.actions.viewDetails}</DialogTitle><DialogDescription>Invoice details and fee breakdown.</DialogDescription></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t.table.invoiceNo}</span><span className="font-mono-amount">{viewing.invoiceNumber}</span>
                <span className="text-muted-foreground">{t.table.student}</span><span className="font-medium">{viewing.studentName}</span>
                <span className="text-muted-foreground">{t.table.grade}</span><span>{viewing.grade}</span>
                <span className="text-muted-foreground">{t.table.dueDate}</span><span>{viewing.dueDate}</span>
                <span className="text-muted-foreground">{t.table.status}</span><StatusBadge status={statusMap[viewing.status] || 'pending'} />
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Fee Breakdown</p>
                {viewing.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.name}</span>
                    <span className="font-mono-amount">KES {item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 border-t font-semibold mt-2 pt-2">
                  <span>Total</span>
                  <span className="font-mono-amount">KES {viewing.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-success">
                  <span>Paid</span>
                  <span className="font-mono-amount">KES {viewing.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-destructive">
                  <span>Balance</span>
                  <span className="font-mono-amount">KES {viewing.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default Invoicing;
