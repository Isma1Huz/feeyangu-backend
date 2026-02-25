import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import type { AcademicTerm } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Props extends InertiaSharedProps {
  terms: AcademicTerm[];
}

const Terms: React.FC = () => {
  const { toast } = useToast();
  const { TERMS_TEXT: t, COMMON_TEXT } = useT();
  const { terms: initialTerms } = usePage<Props>().props;
  const [terms, setTerms] = useState<AcademicTerm[]>(initialTerms);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicTerm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState('2026');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'upcoming' | 'completed'>('upcoming');

  const openForm = (term?: AcademicTerm) => {
    setEditing(term || null);
    setFormName(term?.name || ''); setFormYear(String(term?.year || 2026)); setFormStart(term?.startDate || ''); setFormEnd(term?.endDate || ''); setFormStatus(term?.status || 'upcoming');
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editing) { setTerms(prev => prev.map(t => t.id === editing.id ? { ...t, name: formName, year: Number(formYear), startDate: formStart, endDate: formEnd, status: formStatus } : t)); toast({ title: 'Term updated' }); }
    else { setTerms(prev => [...prev, { id: `t${Date.now()}`, name: formName, year: Number(formYear), startDate: formStart, endDate: formEnd, status: formStatus }]); toast({ title: 'Term created' }); }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setTerms(prev => prev.filter(t => t.id !== deleteId));
    toast({ title: 'Term deleted' }); setDeleteOpen(false);
  };

  const columns: DataTableColumn<AcademicTerm>[] = [
    { key: 'name', header: t.table.name, render: tm => <span className="font-medium">{tm.name}</span> },
    { key: 'year', header: t.table.year, render: tm => <span className="text-sm">{tm.year}</span> },
    { key: 'startDate', header: t.table.startDate, render: tm => <span className="text-sm">{tm.startDate}</span> },
    { key: 'endDate', header: t.table.endDate, render: tm => <span className="text-sm">{tm.endDate}</span> },
    { key: 'status', header: t.table.status, render: tm => <StatusBadge status={tm.status} /> },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: COMMON_TEXT.actions.delete, icon: <Trash2 className="h-3.5 w-3.5" />, variant: 'destructive', onClick: (ids) => { setTerms(prev => prev.filter(t => !ids.includes(t.id))); toast({ title: `${ids.length} terms deleted` }); }},
  ];

  return (
    <>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
        </div>
      <DataTable
        data={terms}
        columns={columns}
        keyField="id"
        bulkActions={bulkActions}
        headerActions={<Button size="sm" className="gap-1.5" onClick={() => openForm()}><Plus className="h-3.5 w-3.5" />{t.addTerm}</Button>}
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(tm) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openForm(tm)}><Pencil className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeleteId(tm.id); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
          </div>
        )}
      />
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? COMMON_TEXT.actions.edit : t.addTerm}</DialogTitle><DialogDescription>Enter term details below.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t.form.name}</Label><Input placeholder={t.form.namePlaceholder} value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t.form.year}</Label><Input type="number" value={formYear} onChange={e => setFormYear(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.form.startDate}</Label><Input type="date" value={formStart} onChange={e => setFormStart(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t.form.endDate}</Label><Input type="date" value={formEnd} onChange={e => setFormEnd(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>{t.form.status}</Label>
              <Select value={formStatus} onValueChange={v => setFormStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{COMMON_TEXT.status.active}</SelectItem>
                  <SelectItem value="upcoming">{COMMON_TEXT.status.upcoming}</SelectItem>
                  <SelectItem value="completed">{COMMON_TEXT.status.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{COMMON_TEXT.actions.cancel}</Button>
            <Button onClick={handleSave}>{COMMON_TEXT.actions.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    </>
  );
};

export default Terms;
