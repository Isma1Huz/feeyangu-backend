import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SchoolRole } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Users, Copy, Trash2, Eye, Edit } from 'lucide-react';

interface Props extends InertiaSharedProps {
  roles: SchoolRole[];
}

const RolesIndex: React.FC<Props> = () => {
  const { roles = [] } = usePage<Props>().props;
  const { toast } = useToast();

  const handleDelete = (role: SchoolRole) => {
    if (role.is_system) {
      toast({ title: 'System roles cannot be deleted', variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;

    router.delete(`/school/roles/${role.id}`, {
      onSuccess: () => toast({ title: 'Role deleted' }),
      onError: (e) => toast({ title: Object.values(e)[0] as string ?? 'Failed', variant: 'destructive' }),
    });
  };

  const handleDuplicate = (role: SchoolRole) => {
    router.post(`/school/roles/${role.id}/duplicate`, {}, {
      onSuccess: () => toast({ title: 'Role duplicated' }),
    });
  };

  const systemRoles = roles.filter((r) => r.is_system);
  const customRoles = roles.filter((r) => !r.is_system);

  const renderRole = (role: SchoolRole) => (
    <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{role.name[0]}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{role.name}</p>
            {role.is_system && <Badge variant="secondary" className="text-[10px]">System</Badge>}
          </div>
          {role.description && <p className="text-xs text-muted-foreground">{role.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {role.staff_assignments_count !== undefined && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> {role.staff_assignments_count}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.get(`/school/roles/${role.id}`)}>
              <Eye className="h-3 w-3 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.get(`/school/roles/${role.id}/edit`)}>
              <Edit className="h-3 w-3 mr-2" /> {role.is_system ? 'Edit Permissions' : 'Edit'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(role)}>
              <Copy className="h-3 w-3 mr-2" /> Duplicate
            </DropdownMenuItem>
            {!role.is_system && (
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(role)}>
                <Trash2 className="h-3 w-3 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Head title="Roles" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage staff roles and their permission sets.
            </p>
          </div>
          <Button onClick={() => router.get('/school/roles/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Roles ({systemRoles.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemRoles.map(renderRole)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom Roles ({customRoles.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No custom roles yet. Create one to get started.</p>
              ) : (
                customRoles.map(renderRole)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default RolesIndex;
