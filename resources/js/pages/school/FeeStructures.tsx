import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_FEE_STRUCTURES, MOCK_GRADES, MOCK_TERMS } from '@/lib/mock-data';
import type { FeeStructure, FeeItem } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const FeeStructures: React.FC = () => {
  const { toast } = useToast();
  const { FEE_STRUCTURES_TEXT: t, COMMON_TEXT } = useT();
  const [structures, setStructures] = useState<FeeStructure[]>(MOCK_FEE_STRUCTURES);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<FeeStructure | null>(null);
  const [viewing, setViewing] = useState<FeeStructure | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formTerm, setFormTerm] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formItems, setFormItems] = useState<FeeItem[]>([]);

  const filtered = useMemo(() =>
    structures.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase())),
    [search, structures]);

  const openForm = (fs?: FeeStructure) => {
    setEditing(fs || null);
    setFormName(fs?.name || ''); setFormGrade(fs?.grade || ''); setFormTerm(fs?.term || ''); setFormStatus(fs?.status || 'active');
    setFormItems(fs?.items || [{ id: `fi${Date.now()}`, name: '', amount: 0 }]);
    setFormOpen(true);
  };

  const addItem = () => setFormItems(prev => [...prev, { id: `fi${Date.now()}`, name: '', amount: 0 }]);
  const removeItem = (id: string) => setFormItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: 'name' | 'amount', value: string | number) =>
    setFormItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handleSave = () => {
    if (!formName.trim() || !formGrade || !formTerm) return;
    const total = formItems.reduce((sum, i) => sum + Number(i.amount), 0);
    if (editing) { setStructures(prev => prev.map(s => s.id === editing.id ? { ...s, name: formName, grade: formGrade, term: formTerm, status: formStatus, items: formItems, totalAmount: total } : s)); toast({ title: 'Fee structure updated' }); }
    else { setStructures(prev => [...prev, { id: `fs${Date.now()}`, name: formName, grade: formGrade, term: formTerm, totalAmount: total, status: formStatus, items: formItems }]); toast({ title: 'Fee structure created' }); }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setStructures(prev => prev.filter(s => s.id !== deleteId));
    toast({ title: 'Fee structure deleted' }); setDeleteOpen(false);
  };

  const columns: DataTableColumn<FeeStructure>[] = [
    { key: 'name', header: t.table.name, render: fs => <span className="font-medium">{fs.name}</span> },
    { key: 'grade', header: t.table.grade, render: fs => <span className="text-sm">{fs.grade}</span> },
    { key: 'term', header: t.table.term, render: fs => <span className="text-sm">{fs.term}</span> },
    { key: 'totalAmount', header: t.table.totalAmount, render: fs => <span className="text-sm font-mono-amount">{COMMON_TEXT.currency} {fs.totalAmount.toLocaleString()}</span> },
    { key: 'status', header: t.table.status, render: fs => <StatusBadge status={fs.status} /> },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: COMMON_TEXT.actions.delete, icon: <Trash2 className="h-3.5 w-3.5" />, variant: 'destructive', onClick: (ids) => { setStructures(prev => prev.filter(s => !ids.includes(s.id))); toast({ title: `${ids.length} fee structures deleted` }); }},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search fee structures..."
        searchValue={search}
        onSearchChange={setSearch}
        bulkActions={bulkActions}
        headerActions={<Button size="sm" className="gap-1.5" onClick={() => openForm()}><Plus className="h-3.5 w-3.5" />{t.addFeeStructure}</Button>}
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(fs) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(fs); setDetailOpen(true); }}><Eye className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openForm(fs)}><Pencil className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeleteId(fs.id); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
          </div>
        )}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle><DialogDescription>{viewing?.grade} · {viewing?.term}</DialogDescription></DialogHeader>
          <Table>
            <TableHeader><TableRow><TableHead>{t.detail.itemName}</TableHead><TableHead className="text-right">{t.detail.itemAmount}</TableHead></TableRow></TableHeader>
            <TableBody>
              {viewing?.items.map(item => (<TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {item.amount.toLocaleString()}</TableCell></TableRow>))}
              <TableRow className="font-semibold"><TableCell>{t.detail.total}</TableCell><TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {viewing?.totalAmount.toLocaleString()}</TableCell></TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t.editFeeStructure : t.addFeeStructure}</DialogTitle><DialogDescription>Fill in the fee structure details.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t.form.name}</Label><Input placeholder={t.form.namePlaceholder} value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.form.grade}</Label><Select value={formGrade} onValueChange={setFormGrade}><SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger><SelectContent>{MOCK_GRADES.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>{t.form.term}</Label><Select value={formTerm} onValueChange={setFormTerm}><SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger><SelectContent>{MOCK_TERMS.map(tm => <SelectItem key={tm.id} value={tm.name}>{tm.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>{t.form.status}</Label><Select value={formStatus} onValueChange={v => setFormStatus(v as 'active' | 'inactive')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{COMMON_TEXT.status.active}</SelectItem><SelectItem value="inactive">{COMMON_TEXT.status.inactive}</SelectItem></SelectContent></Select></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label>{t.detail.feeBreakdown}</Label><Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />{t.detail.addItem}</Button></div>
              {formItems.map(item => (
                <div key={item.id} className="flex gap-2 items-center">
                  <Input placeholder={t.form.feeItemNamePlaceholder} value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="flex-1" />
                  <Input type="number" placeholder="0" value={item.amount || ''} onChange={e => updateItem(item.id, 'amount', Number(e.target.value))} className="w-28" />
                  {formItems.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="h-3 w-3" /></Button>}
                </div>
              ))}
              <p className="text-sm font-medium text-right">Total: {COMMON_TEXT.currency} {formItems.reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{COMMON_TEXT.actions.cancel}</Button>
            <Button onClick={handleSave}>{COMMON_TEXT.actions.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{COMMON_TEXT.actions.delete}</DialogTitle><DialogDescription>Are you sure? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{COMMON_TEXT.actions.cancel}</Button>
            <Button variant="destructive" onClick={handleDelete}>{COMMON_TEXT.actions.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeStructures;
