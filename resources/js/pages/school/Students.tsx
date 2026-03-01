import React, { useState, useMemo } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Plus, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import type { Student } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Grade {
  id: string;
  name: string;
}

interface Props extends InertiaSharedProps {
  students: Student[];
  grades: Grade[];
}

const Students: React.FC = () => {
  const { toast } = useToast();
  const { STUDENTS_TEXT: t, COMMON_TEXT } = useT();
  const { students: initialStudents, grades: allGrades } = usePage<Props>().props;
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formFirst, setFormFirst] = useState('');
  const [formLast, setFormLast] = useState('');
  const [formAdmission, setFormAdmission] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formClass, setFormClass] = useState('');
  const [formParent, setFormParent] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const filtered = useMemo(() =>
    students.filter(s => {
      const matchSearch = !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || s.admissionNumber.toLowerCase().includes(search.toLowerCase());
      const matchGrade = gradeFilter === 'all' || s.grade === gradeFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchGrade && matchStatus;
    }), [search, gradeFilter, statusFilter, students]);

  const openForm = (student?: Student) => {
    setEditing(student || null);
    setFormFirst(student?.firstName || '');
    setFormLast(student?.lastName || '');
    setFormAdmission(student?.admissionNumber || '');
    setFormGrade(student?.grade || '');
    setFormClass(student?.className || '');
    setFormParent(student?.parentName || '');
    setFormParentEmail(student?.parentEmail || '');
    setFormStatus(student?.status || 'active');
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formFirst.trim() || !formLast.trim()) return;

    const gradeObj = allGrades.find(g => g.name === formGrade);
    const data = {
      first_name: formFirst,
      last_name: formLast,
      admission_number: formAdmission,
      grade_id: gradeObj?.id || '',
      class_id: formClass,
      status: formStatus,
    };

    if (editing) {
      router.put(`/school/students/${editing.id}`, data, {
        onSuccess: () => { toast({ title: 'Student updated', description: `${formFirst} ${formLast} has been updated.` }); setFormOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to update student.', variant: 'destructive' } as any),
        preserveState: false,
      });
    } else {
      router.post('/school/students', data, {
        onSuccess: () => { toast({ title: 'Student added', description: `${formFirst} ${formLast} has been enrolled.` }); setFormOpen(false); },
        onError: () => toast({ title: 'Error', description: 'Failed to add student.', variant: 'destructive' } as any),
        preserveState: false,
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    router.delete(`/school/students/${deleteId}`, {
      onSuccess: () => { toast({ title: 'Student removed' }); setDeleteOpen(false); },
      onError: () => toast({ title: 'Error', description: 'Failed to delete student.', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    // Delete sequentially - in production a bulk-delete endpoint would be better
    ids.forEach(id => router.delete(`/school/students/${id}`, { preserveState: false }));
    toast({ title: `${ids.length} students removed` });
  };

  const exportCsv = (data: Student[]) => {
    const header = 'Admission #,First Name,Last Name,Grade,Class,Parent,Status,Total Fees,Paid,Balance\n';
    const rows = data.map(s => `${s.admissionNumber},${s.firstName},${s.lastName},${s.grade},${s.className},${s.parentName},${s.status},${s.totalFees},${s.paidFees},${s.balance}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Students exported to CSV.' });
  };

  const handleImport = () => {
    toast({ title: 'Import not available', description: 'Please add students individually via the Add Student button.', variant: 'destructive' } as any);
  };

  const columns: DataTableColumn<Student>[] = [
    { key: 'admissionNumber', header: t.table.admissionNo, render: s => <span className="text-sm font-mono-amount text-muted-foreground">{s.admissionNumber}</span> },
    { key: 'name', header: t.table.name, render: s => <span className="font-medium">{s.firstName} {s.lastName}</span> },
    { key: 'grade', header: t.table.grade, render: s => <span className="text-sm">{s.grade}</span> },
    { key: 'className', header: t.table.class, render: s => <span className="text-sm">{s.className}</span> },
    { key: 'parentName', header: t.table.parent, render: s => <span className="text-sm">{s.parentName}</span> },
    { key: 'fees', header: t.table.fees, render: s => {
      const pct = s.totalFees > 0 ? Math.round((s.paidFees / s.totalFees) * 100) : 0;
      return (
        <div className="space-y-1 min-w-[120px]">
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">{COMMON_TEXT.currency} {s.paidFees.toLocaleString()}</span><span className="font-medium">{pct}%</span></div>
          <Progress value={pct} className="h-1.5" />
        </div>
      );
    }},
    { key: 'status', header: t.table.status, render: s => <StatusBadge status={s.status} /> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'grade', label: t.filters.grade, options: allGrades.map(g => ({ value: g.name, label: g.name })) },
    { key: 'status', label: t.filters.status, options: [{ value: 'active', label: COMMON_TEXT.status.active }, { value: 'inactive', label: COMMON_TEXT.status.inactive }] },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: COMMON_TEXT.actions.delete, icon: <Trash2 className="h-3.5 w-3.5" />, variant: 'destructive', confirm: true, confirmTitle: 'Delete Students', confirmDescription: `Are you sure you want to delete the selected students? This action cannot be undone.`, onClick: handleBulkDelete },
  ];

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{filtered.length} students total</p>
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
        filterValues={{ grade: gradeFilter, status: statusFilter }}
        onFilterChange={(k, v) => { if (k === 'grade') setGradeFilter(v); if (k === 'status') setStatusFilter(v); }}
        bulkActions={bulkActions}
        onExport={exportCsv}
        exportLabel={t.exportCsv}
        onImport={handleImport}
        importLabel={t.importCsv}
        headerActions={
          <Button size="sm" className="gap-1.5" onClick={() => openForm()}>
            <Plus className="h-3.5 w-3.5" />
            {t.addStudent}
          </Button>
        }
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(s) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2" onClick={() => router.visit(`/school/students/${s.id}`)}><Eye className="h-3.5 w-3.5" />{COMMON_TEXT.actions.view}</DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => openForm(s)}><Pencil className="h-3.5 w-3.5" />{COMMON_TEXT.actions.edit}</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => { setDeleteId(s.id); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" />{COMMON_TEXT.actions.delete}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
            <DialogDescription>Fill in the student details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.form.firstName}</Label><Input value={formFirst} onChange={e => setFormFirst(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t.form.lastName}</Label><Input value={formLast} onChange={e => setFormLast(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>{t.form.admissionNumber}</Label><Input value={formAdmission} onChange={e => setFormAdmission(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.form.grade}</Label>
                <Select value={formGrade} onValueChange={setFormGrade}>
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>{allGrades.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t.form.className}</Label><Input value={formClass} onChange={e => setFormClass(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.form.parentName}</Label><Input value={formParent} onChange={e => setFormParent(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t.form.parentEmail}</Label><Input type="email" value={formParentEmail} onChange={e => setFormParentEmail(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>{t.form.status}</Label>
              <Select value={formStatus} onValueChange={v => setFormStatus(v as 'active' | 'inactive')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{COMMON_TEXT.status.active}</SelectItem>
                  <SelectItem value="inactive">{COMMON_TEXT.status.inactive}</SelectItem>
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
    </AppLayout>
  );
};

export default Students;
