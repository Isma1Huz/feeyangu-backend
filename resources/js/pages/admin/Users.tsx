import React, { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useT } from '@/contexts/LanguageContext';
import type { InertiaSharedProps } from '@/types/inertia';
import type { User } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, UserCheck, UserX, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface AdminUser extends User {
  school: string;
  school_id?: string | null;
  lastLogin: string;
  status: string;
}

interface SchoolOption {
  id: string;
  name: string;
}

interface Props extends InertiaSharedProps {
  users?: AdminUser[];
  schools?: SchoolOption[];
}

const AdminUsers: React.FC<Props> = () => {
  const { toast } = useToast();
  const { ADMIN_USERS_TEXT: t, COMMON_TEXT } = useT();
  const { users: initialUsers = [], schools: schoolOptions = [] } = usePage<Props>().props;
  
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create/Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'accountant', school_id: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() =>
    users.filter(u => roleFilter === 'all' || u.role === roleFilter)
      .filter(u => statusFilter === 'all' || u.status === statusFilter)
      .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
    [users, search, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'accountant', school_id: '', status: 'active' });
    setFormOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, school_id: u.school_id || '', status: u.status });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);

    if (editingUser) {
      router.put(`/admin/users/${editingUser.id}`, {
        name: form.name,
        email: form.email,
        role: form.role,
        school_id: form.school_id || null,
        status: form.status,
      }, {
        onSuccess: () => { toast({ title: 'User updated' }); setFormOpen(false); },
        onError: () => toast({ title: 'Error updating user', variant: 'destructive' } as any),
        onFinish: () => setSubmitting(false),
        preserveState: false,
      });
    } else {
      router.post('/admin/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        school_id: form.school_id || null,
      }, {
        onSuccess: () => { toast({ title: 'User created' }); setFormOpen(false); },
        onError: () => toast({ title: 'Error creating user', variant: 'destructive' } as any),
        onFinish: () => setSubmitting(false),
        preserveState: false,
      });
    }
  };

  const handleDelete = (u: AdminUser) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    router.delete(`/admin/users/${u.id}`, {
      onSuccess: () => toast({ title: 'User deleted' }),
      onError: () => toast({ title: 'Error deleting user', variant: 'destructive' } as any),
    });
  };

  const resetPassword = (name: string) => toast({ title: 'Password reset', description: `Password reset email sent to ${name}.` });

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: t.table.name, render: u => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: t.table.email, render: u => <span className="text-sm">{u.email}</span> },
    { key: 'role', header: t.table.role, render: u => <span className="text-sm">{u.role}</span> },
    { key: 'school', header: t.table.school, render: u => <span className="text-sm text-muted-foreground">{u.school}</span> },
    { key: 'status', header: t.table.status, render: u => <StatusBadge status={u.status} /> },
    { key: 'lastLogin', header: t.table.lastLogin, render: u => <span className="text-sm text-muted-foreground">{u.lastLogin}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'role', label: t.filterRole, options: [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'school_admin', label: 'School Admin' },
      { value: 'accountant', label: 'Accountant' },
      { value: 'parent', label: 'Parent' },
    ]},
    { key: 'status', label: t.filterStatus, options: [
      { value: 'active', label: COMMON_TEXT.status.active },
      { value: 'inactive', label: COMMON_TEXT.status.inactive },
    ]},
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: t.actions.activate, icon: <UserCheck className="h-3.5 w-3.5" />, onClick: (ids) => {
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: 'active' } : u));
      toast({ title: `${ids.length} users activated` });
    }},
    { label: t.actions.deactivate, icon: <UserX className="h-3.5 w-3.5" />, variant: 'destructive', confirm: true, confirmTitle: 'Deactivate Users', confirmDescription: 'Are you sure you want to deactivate the selected users?', onClick: (ids) => {
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: 'inactive' } : u));
      toast({ title: `${ids.length} users deactivated` });
    }},
  ];

  const exportCsv = (data: AdminUser[]) => {
    const header = 'Name,Email,Role,School,Status,Last Login\n';
    const rows = data.map(u => `${u.name},${u.email},${u.role},${u.school},${u.status},${u.lastLogin}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported' });
  };

  return (
    <AppLayout>
      <Head title="Users" />
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
        <DataTable
          data={filtered}
          columns={columns}
          keyField="id"
          searchPlaceholder={t.searchPlaceholder}
          searchValue={search}
          onSearchChange={setSearch}
          filters={tableFilters}
          filterValues={{ role: roleFilter, status: statusFilter }}
          onFilterChange={(k, v) => { if (k === 'role') setRoleFilter(v); if (k === 'status') setStatusFilter(v); }}
          bulkActions={bulkActions}
          onExport={exportCsv}
          headerActions={<Button onClick={openCreate} size="sm" className="gap-2"><Plus className="h-4 w-4" />Add User</Button>}
          emptyTitle={t.emptyState.title}
          emptyDescription={t.emptyState.description}
          rowActions={(u) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(u)}>{COMMON_TEXT.actions.edit}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => resetPassword(u.name)}>{t.actions.resetPassword}</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(u)}>{COMMON_TEXT.actions.delete}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />

        {/* Create/Edit User Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@school.com" className="mt-1" />
              </div>
              {!editingUser && (
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" className="mt-1" />
                </div>
              )}
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="school_admin">School Admin</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>School</Label>
                <Select value={form.school_id} onValueChange={v => setForm(p => ({ ...p, school_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select school (optional)" /></SelectTrigger>
                  <SelectContent>
                    {schoolOptions.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingUser && (
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{COMMON_TEXT.status.active}</SelectItem>
                      <SelectItem value="inactive">{COMMON_TEXT.status.inactive}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>{COMMON_TEXT.actions.cancel}</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.email || (!editingUser && !form.password) || submitting}>
                {submitting ? 'Saving...' : COMMON_TEXT.actions.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
