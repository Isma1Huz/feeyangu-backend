import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useT } from '@/contexts/LanguageContext';
import type { InertiaSharedProps } from '@/types/inertia';
import type { School } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props extends InertiaSharedProps {
  schools?: School[];
}

const AdminSchools: React.FC<Props> = () => {
  const { toast } = useToast();
  const { ADMIN_SCHOOLS_TEXT: t, COMMON_TEXT } = useT();
  const { schools: initialSchools = [] } = usePage<Props>().props;
  
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [form, setForm] = useState({ name: '', owner: '', location: '', status: 'active' as School['status'] });

  const filtered = useMemo(() =>
    schools.filter(s => statusFilter === 'all' || s.status === statusFilter)
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase())),
    [schools, search, statusFilter]);

  const openCreate = () => { setEditing(null); setForm({ name: '', owner: '', location: '', status: 'active' }); setFormOpen(true); };
  const openEdit = (s: School) => { setEditing(s); setForm({ name: s.name, owner: s.owner, location: s.location, status: s.status }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.owner) return;
    if (editing) { setSchools(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s)); toast({ title: 'School updated' }); }
    else { setSchools(prev => [...prev, { id: `s${Date.now()}`, ...form, studentCount: 0, feesCollected: 0 }]); toast({ title: 'School created' }); }
    setFormOpen(false);
  };

  const handleStatusChange = (id: string, status: School['status']) => { setSchools(prev => prev.map(s => s.id === id ? { ...s, status } : s)); toast({ title: `School ${status}` }); };
  const handleDelete = (id: string) => { setSchools(prev => prev.filter(s => s.id !== id)); toast({ title: 'School deleted' }); };

  const columns: DataTableColumn<School>[] = [
    { key: 'name', header: t.table.name, render: s => <span className="font-medium">{s.name}</span> },
    { key: 'owner', header: t.table.owner, render: s => <span className="text-sm">{s.owner}</span> },
    { key: 'location', header: t.table.location, render: s => <span className="text-sm text-muted-foreground">{s.location}</span> },
    { key: 'studentCount', header: t.table.students, render: s => <span className="text-sm font-mono-amount">{s.studentCount}</span> },
    { key: 'feesCollected', header: t.table.feesCollected, render: s => <span className="text-sm font-mono-amount">{COMMON_TEXT.currency} {s.feesCollected.toLocaleString()}</span> },
    { key: 'status', header: t.table.status, render: s => <StatusBadge status={s.status} /> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'status', label: 'All Status', options: [
      { value: 'active', label: COMMON_TEXT.status.active },
      { value: 'pending', label: COMMON_TEXT.status.pending },
      { value: 'suspended', label: COMMON_TEXT.status.suspended },
    ]},
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: t.actions.delete, icon: <Trash2 className="h-3.5 w-3.5" />, variant: 'destructive', confirm: true, confirmTitle: 'Delete Schools', confirmDescription: 'Are you sure you want to delete the selected schools? This cannot be undone.', onClick: (ids) => { setSchools(prev => prev.filter(s => !ids.includes(s.id))); toast({ title: `${ids.length} schools deleted` }); }},
  ];

  const exportCsv = (data: School[]) => {
    const header = 'Name,Owner,Location,Students,Fees Collected,Status\n';
    const rows = data.map(s => `${s.name},${s.owner},${s.location},${s.studentCount},${s.feesCollected},${s.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'schools.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported' });
  };

  return (
    <>
      <Head title="Schools" />
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
        </div>
        <DataTable
          data={filtered}
          columns={columns}
          keyField="id"
          searchPlaceholder={t.searchPlaceholder}
          searchValue={search}
          onSearchChange={setSearch}
          filters={tableFilters}
          filterValues={{ status: statusFilter }}
          onFilterChange={(k, v) => { if (k === 'status') setStatusFilter(v); }}
          bulkActions={bulkActions}
          onExport={exportCsv}
          headerActions={<Button onClick={openCreate} className="gap-2" size="sm"><Plus className="h-4 w-4" />{t.addSchool}</Button>}
          emptyTitle={t.emptyState.title}
          emptyDescription={t.emptyState.description}
          rowActions={(s) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(s)}>{COMMON_TEXT.actions.edit}</DropdownMenuItem>
                {s.status !== 'active' && <DropdownMenuItem onClick={() => handleStatusChange(s.id, 'active')}>{t.actions.activate}</DropdownMenuItem>}
                {s.status !== 'suspended' && <DropdownMenuItem onClick={() => handleStatusChange(s.id, 'suspended')}>{t.actions.suspend}</DropdownMenuItem>}
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(s.id)}>{t.actions.delete}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit School' : t.addSchool}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>{t.form.name}</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t.form.namePlaceholder} className="mt-1" /></div>
              <div><Label>{t.form.owner}</Label><Input value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} placeholder={t.form.ownerPlaceholder} className="mt-1" /></div>
              <div><Label>{t.form.location}</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={t.form.locationPlaceholder} className="mt-1" /></div>
              <div>
                <Label>{t.form.status}</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as School['status'] }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{COMMON_TEXT.status.active}</SelectItem>
                    <SelectItem value="pending">{COMMON_TEXT.status.pending}</SelectItem>
                    <SelectItem value="suspended">{COMMON_TEXT.status.suspended}</SelectItem>
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
      </div>
    </>
  );
};

export default AdminSchools;
