import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useT } from '@/contexts/LanguageContext';
import type { InertiaSharedProps } from '@/types/inertia';
import type { User } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface AdminUser extends User {
  school: string;
  lastLogin: string;
}

interface Props extends InertiaSharedProps {
  users?: AdminUser[];
}

const AdminUsers: React.FC<Props> = () => {
  const { toast } = useToast();
  const { ADMIN_USERS_TEXT: t, COMMON_TEXT } = useT();
  const { users: initialUsers = [] } = usePage<Props>().props;
  
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() =>
    users.filter(u => roleFilter === 'all' || u.role === roleFilter)
      .filter(u => statusFilter === 'all' || (u as any).status === statusFilter)
      .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
    [users, search, roleFilter, statusFilter]);

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...(u as any).status === 'active' ? { status: 'inactive' } : { status: 'active' } } : u));
    toast({ title: 'User status updated' });
  };

  const resetPassword = (name: string) => toast({ title: 'Password reset', description: `Password reset email sent to ${name}.` });

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: t.table.name, render: u => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: t.table.email, render: u => <span className="text-sm">{u.email}</span> },
    { key: 'role', header: t.table.role, render: u => <span className="text-sm">{u.role}</span> },
    { key: 'school', header: t.table.school, render: u => <span className="text-sm text-muted-foreground">{u.school}</span> },
    { key: 'status', header: t.table.status, render: u => <StatusBadge status={(u as any).status} /> },
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
    const rows = data.map(u => `${u.name},${u.email},${u.role},${u.school},${(u as any).status},${u.lastLogin}`).join('\n');
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
          emptyTitle={t.emptyState.title}
          emptyDescription={t.emptyState.description}
          rowActions={(u) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleStatus(u.id)}>{(u as any).status === 'active' ? t.actions.deactivate : t.actions.activate}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => resetPassword(u.name)}>{t.actions.resetPassword}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
