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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, UserCheck, UserX, Plus, Shield, Key, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

/** Extract the XSRF-TOKEN cookie value for CSRF protection on fetch calls. */
function getCsrfToken(): string | undefined {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Build headers for authenticated JSON fetch requests. */
function jsonHeaders(): HeadersInit {
  const csrfToken = getCsrfToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
  };
}

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

interface RoleOption {
  id: number;
  name: string;
}

interface PermissionOption {
  id: number;
  name: string;
}

interface UserRoleData {
  roles: RoleOption[];
  directPermissions: PermissionOption[];
  allPermissions: Array<{ id: number; name: string; via: string }>;
}

interface Props extends InertiaSharedProps {
  users?: AdminUser[];
  schools?: SchoolOption[];
  availableRoles?: RoleOption[];
  availablePermissions?: PermissionOption[];
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const { ADMIN_USERS_TEXT: t, COMMON_TEXT } = useT();
  const {
    users: initialUsers = [],
    schools: schoolOptions = [],
    availableRoles = [],
    availablePermissions = [],
  } = usePage<Props>().props;

  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create/Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', school_id: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  // Role/Permission management dialog
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [managingUser, setManagingUser] = useState<AdminUser | null>(null);
  const [userRoleData, setUserRoleData] = useState<UserRoleData | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [attachRoleValue, setAttachRoleValue] = useState('');
  const [attachPermValue, setAttachPermValue] = useState('');
  const [permActionLoading, setPermActionLoading] = useState(false);

  const filtered = useMemo(() =>
    users.filter(u => roleFilter === 'all' || u.role === roleFilter)
      .filter(u => statusFilter === 'all' || u.status === statusFilter)
      .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
    [users, search, roleFilter, statusFilter]);

  const defaultRole = availableRoles[0]?.name ?? '';

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: defaultRole, school_id: '', status: 'active' });
    setFormOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, school_id: u.school_id || '', status: u.status });
    setFormOpen(true);
  };

  const openManagePermissions = async (u: AdminUser) => {
    setManagingUser(u);
    setUserRoleData(null);
    setAttachRoleValue('');
    setAttachPermValue('');
    setPermDialogOpen(true);
    setLoadingPerms(true);
    try {
      const resp = await fetch(`/admin/users/${u.id}/roles`, {
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      if (resp.ok) {
        const data = await resp.json();
        setUserRoleData(data);
      }
    } catch {
      toast({ title: 'Failed to load user roles', variant: 'destructive' } as any);
    } finally {
      setLoadingPerms(false);
    }
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

  const handleAttachRole = async () => {
    if (!managingUser || !attachRoleValue) return;
    setPermActionLoading(true);
    try {
      const resp = await fetch(`/admin/users/${managingUser.id}/roles`, {
        method: 'POST',
        headers: jsonHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ role: attachRoleValue }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setUserRoleData(prev => prev ? { ...prev, roles: data.roles } : prev);
        toast({ title: 'Role attached' });
        setAttachRoleValue('');
      } else {
        toast({ title: data.message ?? 'Error attaching role', variant: 'destructive' } as any);
      }
    } catch {
      toast({ title: 'Error attaching role', variant: 'destructive' } as any);
    } finally {
      setPermActionLoading(false);
    }
  };

  const handleDetachRole = async (roleName: string) => {
    if (!managingUser) return;
    setPermActionLoading(true);
    try {
      const resp = await fetch(`/admin/users/${managingUser.id}/roles/${encodeURIComponent(roleName)}`, {
        method: 'DELETE',
        headers: jsonHeaders(),
        credentials: 'same-origin',
      });
      const data = await resp.json();
      if (resp.ok) {
        setUserRoleData(prev => prev ? { ...prev, roles: data.roles } : prev);
        toast({ title: 'Role removed' });
      } else {
        toast({ title: data.message ?? 'Error removing role', variant: 'destructive' } as any);
      }
    } catch {
      toast({ title: 'Error removing role', variant: 'destructive' } as any);
    } finally {
      setPermActionLoading(false);
    }
  };

  const handleAttachPermission = async () => {
    if (!managingUser || !attachPermValue) return;
    setPermActionLoading(true);
    try {
      const resp = await fetch(`/admin/users/${managingUser.id}/permissions`, {
        method: 'POST',
        headers: jsonHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ permission: attachPermValue }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setUserRoleData(prev => prev ? { ...prev, directPermissions: data.directPermissions } : prev);
        toast({ title: 'Permission attached' });
        setAttachPermValue('');
      } else {
        toast({ title: data.message ?? 'Error attaching permission', variant: 'destructive' } as any);
      }
    } catch {
      toast({ title: 'Error attaching permission', variant: 'destructive' } as any);
    } finally {
      setPermActionLoading(false);
    }
  };

  const handleDetachPermission = async (permName: string) => {
    if (!managingUser) return;
    setPermActionLoading(true);
    try {
      const resp = await fetch(`/admin/users/${managingUser.id}/permissions/${encodeURIComponent(permName)}`, {
        method: 'DELETE',
        headers: jsonHeaders(),
        credentials: 'same-origin',
      });
      const data = await resp.json();
      if (resp.ok) {
        setUserRoleData(prev => prev ? { ...prev, directPermissions: data.directPermissions } : prev);
        toast({ title: 'Permission removed' });
      } else {
        toast({ title: data.message ?? 'Error removing permission', variant: 'destructive' } as any);
      }
    } catch {
      toast({ title: 'Error removing permission', variant: 'destructive' } as any);
    } finally {
      setPermActionLoading(false);
    }
  };

  const resetPassword = (name: string) => toast({ title: 'Password reset', description: `Password reset email sent to ${name}.` });

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: t.table.name, render: u => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: t.table.email, render: u => <span className="text-sm">{u.email}</span> },
    { key: 'role', header: t.table.role, render: u => <Badge variant="secondary" className="capitalize">{u.role?.replace(/_/g, ' ')}</Badge> },
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

  // Roles/perms that are not yet attached to managing user
  const unattachedRoles = availableRoles.filter(r => !userRoleData?.roles.some(ur => ur.name === r.name));
  const unattachedPerms = availablePermissions.filter(p => !userRoleData?.directPermissions.some(dp => dp.name === p.name));

  return (
    <AppLayout>
      <Head title="Users" />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
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
                <DropdownMenuItem onClick={() => openManagePermissions(u)} className="gap-2">
                  <Shield className="h-3.5 w-3.5" />Manage Roles & Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => resetPassword(u.name)}>{t.actions.resetPassword}</DropdownMenuItem>
                <DropdownMenuSeparator />
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
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(r => (
                      <SelectItem key={r.id} value={r.name}>{r.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                    ))}
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

        {/* Manage Roles & Permissions Dialog */}
        <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions — {managingUser?.name}
              </DialogTitle>
            </DialogHeader>

            {loadingPerms ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div className="space-y-6">
                {/* Roles Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />Assigned Roles
                  </h3>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {(userRoleData?.roles ?? []).length === 0 && (
                      <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                    )}
                    {(userRoleData?.roles ?? []).map(role => (
                      <Badge key={role.id} variant="secondary" className="gap-1 pr-1">
                        {role.name.replace(/_/g, ' ')}
                        <button
                          onClick={() => handleDetachRole(role.name)}
                          disabled={permActionLoading}
                          className="ml-1 hover:text-destructive transition-colors"
                          aria-label={`Remove role ${role.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {/* Attach role */}
                  <div className="flex gap-2 mt-3">
                    <Select value={attachRoleValue} onValueChange={setAttachRoleValue}>
                      <SelectTrigger className="flex-1 text-sm h-8">
                        <SelectValue placeholder="Select role to attach" />
                      </SelectTrigger>
                      <SelectContent>
                        {unattachedRoles.map(r => (
                          <SelectItem key={r.id} value={r.name}>{r.name.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleAttachRole} disabled={!attachRoleValue || permActionLoading} className="h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" />Attach
                    </Button>
                  </div>
                </div>

                {/* Direct Permissions Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-3.5 w-3.5" />Direct Permissions
                    <span className="text-xs text-muted-foreground font-normal">(in addition to role permissions)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {(userRoleData?.directPermissions ?? []).length === 0 && (
                      <span className="text-xs text-muted-foreground italic">No direct permissions</span>
                    )}
                    {(userRoleData?.directPermissions ?? []).map(perm => (
                      <Badge key={perm.id} variant="outline" className="gap-1 pr-1 font-mono text-xs">
                        {perm.name}
                        <button
                          onClick={() => handleDetachPermission(perm.name)}
                          disabled={permActionLoading}
                          className="ml-1 hover:text-destructive transition-colors"
                          aria-label={`Remove permission ${perm.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {/* Attach permission */}
                  <div className="flex gap-2 mt-3">
                    <Select value={attachPermValue} onValueChange={setAttachPermValue}>
                      <SelectTrigger className="flex-1 text-sm h-8">
                        <SelectValue placeholder="Select permission to attach" />
                      </SelectTrigger>
                      <SelectContent>
                        {unattachedPerms.map(p => (
                          <SelectItem key={p.id} value={p.name} className="font-mono text-xs">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleAttachPermission} disabled={!attachPermValue || permActionLoading} className="h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" />Attach
                    </Button>
                  </div>
                </div>

                {/* All effective permissions */}
                {(userRoleData?.allPermissions ?? []).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">All Effective Permissions</h3>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {(userRoleData?.allPermissions ?? []).map(p => (
                        <Badge key={p.id} variant={p.via === 'direct' ? 'outline' : 'secondary'} className="font-mono text-xs">
                          {p.name}
                          {p.via !== 'direct' && <span className="ml-1 text-muted-foreground">({p.via})</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setPermDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
