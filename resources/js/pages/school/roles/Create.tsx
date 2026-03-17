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
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

interface Props extends InertiaSharedProps {
  enabledModules: Module[];
  allPermissions: Record<string, Permission[]>;
  availableParents: { id: number; name: string }[];
}

const RolesCreate: React.FC<Props> = () => {
  const { enabledModules, allPermissions, availableParents = [] } = usePage<Props>().props;
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data, setData, post, errors, processing } = useForm({
    name: '',
    description: '',
    permission_ids: [] as number[],
    parent_role_ids: [] as number[],
  });

  const toggleModule = (moduleKey: string) => {
    const next = new Set(expandedModules);
    if (next.has(moduleKey)) next.delete(moduleKey);
    else next.add(moduleKey);
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
    post('/school/roles', {
      onSuccess: () => toast({ title: 'Role created successfully' }),
      onError: () => toast({ title: 'Please fix the errors', variant: 'destructive' }),
    });
  };

  return (
    <AppLayout>
      <Head title="Create Role" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/school/roles')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create Role</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Librarian" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} />
              </div>

              {availableParents.length > 0 && (
                <div>
                  <Label>Inherits From (optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">This role will inherit all permissions from selected parent roles.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableParents.map((role) => (
                      <label key={role.id} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 text-sm">
                        <Checkbox checked={data.parent_role_ids.includes(role.id)} onCheckedChange={() => toggleParentRole(role.id)} />
                        {role.name}
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
              <p className="text-xs text-muted-foreground">Only permissions from enabled modules are shown.</p>
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
                        <Badge variant="outline" className="text-[10px]">{permissions.length}</Badge>
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
            <Button type="submit" disabled={processing}>Create Role</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default RolesCreate;
