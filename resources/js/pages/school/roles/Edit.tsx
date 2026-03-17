import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { Module, Permission, SchoolRole } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

interface Props extends InertiaSharedProps {
  role: SchoolRole & { permissions: Permission[]; parent_roles: SchoolRole[] };
  enabledModules: Module[];
  allPermissions: Record<string, Permission[]>;
  availableParents: { id: number; name: string }[];
}

const RolesEdit: React.FC<Props> = () => {
  const { role, enabledModules, allPermissions, availableParents = [] } = usePage<Props>().props;
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data, setData, put, errors, processing } = useForm({
    name: role.name,
    description: role.description ?? '',
    permission_ids: role.permissions?.map((p) => p.id) ?? [],
    parent_role_ids: role.parent_roles?.map((r) => r.id) ?? [],
  });

  const toggleModule = (key: string) => {
    const next = new Set(expandedModules);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedModules(next);
  };

  const togglePermission = (id: number) => {
    const ids = data.permission_ids.includes(id)
      ? data.permission_ids.filter((p) => p !== id)
      : [...data.permission_ids, id];
    setData('permission_ids', ids);
  };

  const toggleModuleAll = (permissions: Permission[]) => {
    const ids = permissions.map((p) => p.id);
    const allSelected = ids.every((id) => data.permission_ids.includes(id));
    if (allSelected) {
      setData('permission_ids', data.permission_ids.filter((id) => !ids.includes(id)));
    } else {
      setData('permission_ids', [...new Set([...data.permission_ids, ...ids])]);
    }
  };

  const toggleParentRole = (id: number) => {
    const ids = data.parent_role_ids.includes(id)
      ? data.parent_role_ids.filter((r) => r !== id)
      : [...data.parent_role_ids, id];
    setData('parent_role_ids', ids);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/school/roles/${role.id}`, {
      onSuccess: () => toast({ title: 'Role updated successfully' }),
      onError: () => toast({ title: 'Please fix the errors', variant: 'destructive' }),
    });
  };

  return (
    <AppLayout>
      <Head title={`Edit Role – ${role.name}`} />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/school/roles')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Role</h1>
          {role.is_system && <Badge variant="secondary">System Role</Badge>}
        </div>

        {role.is_system && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This is a system role. You can edit its permissions but cannot rename or delete it.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  disabled={role.is_system}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  disabled={role.is_system}
                  rows={2}
                />
              </div>

              {!role.is_system && availableParents.length > 0 && (
                <div>
                  <Label>Inherits From</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {availableParents.map((r) => (
                      <label key={r.id} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 text-sm">
                        <Checkbox checked={data.parent_role_ids.includes(r.id)} onCheckedChange={() => toggleParentRole(r.id)} />
                        {r.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Permissions
                <Badge variant="secondary">{data.permission_ids.length} selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(allPermissions).map(([moduleKey, permissions]) => {
                const mod = enabledModules.find((m) => m.key === moduleKey);
                const label = mod?.name ?? moduleKey;
                const isExpanded = expandedModules.has(moduleKey);
                const allSelected = permissions.every((p) => data.permission_ids.includes(p.id));

                return (
                  <div key={moduleKey} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleModule(moduleKey)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleModuleAll(permissions)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {isExpanded && (
                      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions.map((perm) => (
                          <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox checked={data.permission_ids.includes(perm.id)} onCheckedChange={() => togglePermission(perm.id)} />
                            <span className="font-mono text-xs">{perm.name.split(':')[1] ?? perm.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.get('/school/roles')}>Cancel</Button>
            <Button type="submit" disabled={processing}>Save Changes</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default RolesEdit;
