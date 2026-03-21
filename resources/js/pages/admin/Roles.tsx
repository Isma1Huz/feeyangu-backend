import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus, Shield, Key, Trash2, Edit, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { InertiaSharedProps } from '@/types/inertia';

interface Permission {
  id: number;
  name: string;
}

interface PlatformRole {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  users_count: number;
}

interface Props extends InertiaSharedProps {
  roles: PlatformRole[];
  permissions: Permission[];
}

const AdminRoles: React.FC = () => {
  const { roles: initialRoles = [], permissions: allPermissions = [] } = usePage<Props>().props;
  const { toast } = useToast();

  const [roles, setRoles] = useState<PlatformRole[]>(initialRoles);
  const [permsAll, setPermsAll] = useState<Permission[]>(allPermissions);

  React.useEffect(() => { setRoles(initialRoles); }, [initialRoles]);
  React.useEffect(() => { setPermsAll(allPermissions); }, [allPermissions]);

  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PlatformRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [permFormOpen, setPermFormOpen] = useState(false);
  const [newPermName, setNewPermName] = useState('');
  const [permSubmitting, setPermSubmitting] = useState(false);

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPerms([]);
    setRoleFormOpen(true);
  };

  const openEditRole = (role: PlatformRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPerms(role.permissions.map(p => p.name));
    setRoleFormOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) return;
    setSubmitting(true);
    const payload = { name: roleName.trim(), permissions: selectedPerms };
    if (editingRole) {
      router.put(`/admin/roles/${editingRole.id}`, payload, {
        onSuccess: () => { toast({ title: 'Role updated successfully' }); setRoleFormOpen(false); },
        onError: (errors) => toast({ title: Object.values(errors as Record<string, string>)[0] ?? 'Error updating role', variant: 'destructive' } as any),
        onFinish: () => setSubmitting(false),
        preserveState: false,
      });
    } else {
      router.post('/admin/roles', payload, {
        onSuccess: () => { toast({ title: 'Role created successfully' }); setRoleFormOpen(false); },
        onError: (errors) => toast({ title: Object.values(errors as Record<string, string>)[0] ?? 'Error creating role', variant: 'destructive' } as any),
        onFinish: () => setSubmitting(false),
        preserveState: false,
      });
    }
  };

  const handleDeleteRole = (role: PlatformRole) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    router.delete(`/admin/roles/${role.id}`, {
      onSuccess: () => toast({ title: 'Role deleted' }),
      onError: () => toast({ title: 'Error deleting role', variant: 'destructive' } as any),
      preserveState: false,
    });
  };

  const handleCreatePermission = () => {
    if (!newPermName.trim()) return;
    setPermSubmitting(true);
    router.post('/admin/permissions', { name: newPermName.trim() }, {
      onSuccess: () => { toast({ title: 'Permission created' }); setPermFormOpen(false); setNewPermName(''); },
      onError: (errors) => toast({ title: Object.values(errors as Record<string, string>)[0] ?? 'Error creating permission', variant: 'destructive' } as any),
      onFinish: () => setPermSubmitting(false),
      preserveState: false,
    });
  };

  const togglePerm = (permName: string) =>
    setSelectedPerms(prev => prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]);

  const groupedPerms = permsAll.reduce<Record<string, Permission[]>>((acc, p) => {
    const group = p.name.includes(':') ? p.name.split(':')[0] : 'general';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  return (
    <AppLayout>
      <Head title="Roles & Permissions" />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage platform roles and their associated permissions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPermFormOpen(true)} className="gap-2">
              <Key className="h-4 w-4" />New Permission
            </Button>
            <Button size="sm" onClick={openCreateRole} className="gap-2">
              <Plus className="h-4 w-4" />New Role
            </Button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role.id} className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg" aria-hidden="true">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{role.name.replace(/_/g, ' ')}</h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      <span>{role.users_count} user{role.users_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                {role.name !== 'super_admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${role.name} role`}><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditRole(role)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteRole(role)}
                        disabled={role.users_count > 0}
                        title={role.users_count > 0 ? `Cannot delete: ${role.users_count} user(s) assigned to this role` : undefined}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete{role.users_count > 0 && <span className="ml-1 text-xs opacity-60">({role.users_count} users)</span>}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {role.permissions.length === 0
                  ? <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                  : role.permissions.slice(0, 5).map(p => (
                    <Badge key={p.id} variant="secondary" className="text-xs">{p.name}</Badge>
                  ))
                }
                {role.permissions.length > 5 && (
                  <Badge variant="outline" className="text-xs">+{role.permissions.length - 5} more</Badge>
                )}
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No roles found. Create one to get started.</p>
            </div>
          )}
        </div>

        {/* All Permissions */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-4 w-4" />All Permissions ({permsAll.length})
            </h2>
            <Button variant="outline" size="sm" onClick={() => setPermFormOpen(true)} className="gap-2">
              <Plus className="h-3.5 w-3.5" />Add
            </Button>
          </div>
          {Object.keys(groupedPerms).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No permissions defined yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPerms).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => (
                <div key={group}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 capitalize">{group}</h3>
                  <div className="flex flex-wrap gap-2">
                    {perms.map(p => <Badge key={p.id} variant="outline" className="text-xs font-mono">{p.name}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Dialog */}
        <Dialog open={roleFormOpen} onOpenChange={setRoleFormOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? `Edit Role: ${editingRole.name}` : 'Create Role'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Role Name</Label>
                <Input
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="e.g. editor, viewer, manager"
                  className="mt-1"
                  disabled={editingRole?.name === 'super_admin'}
                />
              </div>
              <div>
                <Label className="mb-2 block">Permissions</Label>
                {permsAll.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No permissions available. Create some first.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-3">
                    {Object.entries(groupedPerms).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => (
                      <div key={group}>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 capitalize">{group}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {perms.map(p => (
                            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={selectedPerms.includes(p.name)}
                                onCheckedChange={() => togglePerm(p.name)}
                              />
                              <span className="font-mono text-xs">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{selectedPerms.length} permission(s) selected</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleFormOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSaveRole} disabled={!roleName.trim() || submitting || editingRole?.name === 'super_admin'}>
                {submitting ? 'Saving...' : 'Save Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permission Dialog */}
        <Dialog open={permFormOpen} onOpenChange={setPermFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Permission</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Permission Name</Label>
                <Input
                  value={newPermName}
                  onChange={e => setNewPermName(e.target.value)}
                  placeholder="e.g. academics:view_classes"
                  className="mt-1 font-mono text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleCreatePermission()}
                />
                <p className="text-xs text-muted-foreground mt-1">Use format: module:action</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPermFormOpen(false)} disabled={permSubmitting}>Cancel</Button>
              <Button onClick={handleCreatePermission} disabled={!newPermName.trim() || permSubmitting}>
                {permSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminRoles;
