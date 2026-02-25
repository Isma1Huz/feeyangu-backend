import React, { useState, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_EXPENSES } from '@/lib/mock-data';
import type { ExpenseRecord } from '@/types/accountant.types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const EXPENSE_CATEGORIES = ['Utilities', 'Supplies', 'Maintenance', 'Salaries', 'Transport', 'Food & Catering', 'Technology', 'Furniture', 'Other'];
const EXPENSE_STATUSES = ['pending', 'approved', 'rejected'] as const;

const statusMap: Record<string, 'completed' | 'pending' | 'failed'> = { approved: 'completed', pending: 'pending', rejected: 'failed' };

const Expenses: React.FC = () => {
  const { toast } = useToast();
  const T = useT();
  const t = T.ACCOUNTANT_EXPENSES_TEXT;
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(MOCK_EXPENSES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<ExpenseRecord | null>(null);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categories = [...new Set(MOCK_EXPENSES.map(e => e.category))];

  const filtered = useMemo(() =>
    expenses.filter(e => {
      const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.vendor.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchSearch && matchCategory;
    }), [search, categoryFilter, expenses]);

  const totalExpenses = filtered.reduce((sum, e) => sum + e.amount, 0);

  const openForm = (expense?: ExpenseRecord) => {
    if (expense) {
      setEditing(expense);
      setFormDate(expense.date);
      setFormCategory(expense.category);
      setFormDescription(expense.description);
      setFormAmount(String(expense.amount));
      setFormVendor(expense.vendor);
      setFormStatus(expense.status);
    } else {
      setEditing(null);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormCategory('');
      setFormDescription('');
      setFormAmount('');
      setFormVendor('');
      setFormStatus('pending');
    }
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formDescription.trim() || !formAmount || !formCategory || !formVendor.trim() || !formDate) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid positive amount.', variant: 'destructive' });
      return;
    }

    if (editing) {
      setExpenses(prev => prev.map(e => e.id === editing.id ? {
        ...e, date: formDate, category: formCategory, description: formDescription,
        amount, vendor: formVendor, status: formStatus,
      } : e));
      toast({ title: 'Expense Updated', description: `"${formDescription}" has been updated.` });
    } else {
      const newExpense: ExpenseRecord = {
        id: `exp${Date.now()}`,
        date: formDate,
        category: formCategory,
        description: formDescription,
        amount,
        vendor: formVendor,
        receiptUrl: '',
        status: formStatus,
        submittedBy: 'Mary Njoroge',
      };
      setExpenses(prev => [newExpense, ...prev]);
      toast({ title: 'Expense Added', description: `"${formDescription}" — KES ${amount.toLocaleString()} recorded.` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const expense = expenses.find(e => e.id === deleteId);
    setExpenses(prev => prev.filter(e => e.id !== deleteId));
    toast({ title: 'Expense Deleted', description: `"${expense?.description}" has been removed.` });
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleApprove = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
    toast({ title: 'Expense Approved' });
  };

  const handleReject = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' as const } : e));
    toast({ title: 'Expense Rejected' });
  };

  const columns: DataTableColumn<ExpenseRecord>[] = [
    { key: 'date', header: t.table.date, render: e => <span className="text-sm">{e.date}</span> },
    { key: 'category', header: t.table.category, render: e => <span className="text-sm font-medium">{e.category}</span> },
    { key: 'description', header: t.table.description, render: e => <span className="text-sm truncate max-w-[200px] block">{e.description}</span> },
    { key: 'amount', header: t.table.amount, render: e => <span className="font-mono-amount font-semibold">KES {e.amount.toLocaleString()}</span> },
    { key: 'vendor', header: t.table.vendor, render: e => <span className="text-sm text-muted-foreground">{e.vendor}</span> },
    { key: 'status', header: t.table.status, render: e => <StatusBadge status={statusMap[e.status] || 'pending'} /> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'category', label: 'All Categories', options: categories.map(c => ({ value: c, label: c })) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold font-mono-amount">KES {totalExpenses.toLocaleString()}</p>
          </div>
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" /> {t.addExpense}
          </Button>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search expenses..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={tableFilters}
        filterValues={{ category: categoryFilter }}
        onFilterChange={(k, v) => { if (k === 'category') setCategoryFilter(v); }}
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(e) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(e); setDetailOpen(true); }}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openForm(e)}>
              <Pencil className="h-3 w-3" />
            </Button>
            {e.status === 'pending' && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => handleApprove(e.id)}>
                  <span className="text-xs font-bold">✓</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleReject(e.id)}>
                  <span className="text-xs font-bold">✗</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeleteId(e.id); setDeleteOpen(true); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      />

      {/* Add/Edit Expense Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            <DialogDescription>{editing ? 'Update expense record details.' : 'Record a new school expense.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea placeholder="e.g. Electricity bill — January 2026" value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (KES) <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="0" min="0" step="100" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="font-mono-amount" />
              </div>
              <div className="space-y-2">
                <Label>Vendor <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Kenya Power" value={formVendor} onChange={e => setFormVendor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={v => setFormStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update Expense' : 'Add Expense'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Expense Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>Full expense record information.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Date</span><span>{viewing.date}</span>
                <span className="text-muted-foreground">Category</span><span className="font-medium">{viewing.category}</span>
                <span className="text-muted-foreground">Description</span><span>{viewing.description}</span>
                <span className="text-muted-foreground">Amount</span><span className="font-mono-amount font-semibold">KES {viewing.amount.toLocaleString()}</span>
                <span className="text-muted-foreground">Vendor</span><span>{viewing.vendor}</span>
                <span className="text-muted-foreground">Status</span><StatusBadge status={statusMap[viewing.status] || 'pending'} />
                <span className="text-muted-foreground">Submitted By</span><span>{viewing.submittedBy}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>Are you sure you want to delete this expense? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
