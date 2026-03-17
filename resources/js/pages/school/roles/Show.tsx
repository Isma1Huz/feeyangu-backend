import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SchoolRole, Permission, User } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Shield, Users, Trash2 } from 'lucide-react';

interface Props extends InertiaSharedProps {
  role: SchoolRole & {
    permissions: Permission[];
    staff: User[];
    parent_roles: SchoolRole[];
    child_roles: SchoolRole[];
  };
}

const RoleShow: React.FC<Props> = () => {
  const { role } = usePage<Props>().props;
  const { toast } = useToast();

  const handleDelete = () => {
    if ((role.staff_assignments_count ?? 0) > 0) {
      toast({
        title: `Cannot delete: ${role.staff_assignments_count} staff member(s) assigned`,
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

    router.delete(`/school/roles/${role.id}`, {
      onSuccess: () => toast({ title: 'Role deleted' }),
      onError: (e) =>
        toast({ title: Object.values(e)[0] as string ?? 'Failed to delete', variant: 'destructive' }),
    });
  };

  const groupedPermissions = (role.permissions ?? []).reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      const module = perm.name.split(':')[0] ?? 'other';
      if (!acc[module]) acc[module] = [];
      acc[module].push(perm);
      return acc;
    },
    {},
  );

  return (
    <AppLayout>
      <Head title={`Role – ${role.name}`} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.get('/school/roles')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{role.name}</h1>
                {role.is_system && (
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" /> System Role
                  </Badge>
                )}
              </div>
              {role.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.get(`/school/roles/${role.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            {!role.is_system && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Permissions */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Permissions
                  <Badge variant="outline" className="ml-auto">
                    {role.permissions?.length ?? 0} assigned
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedPermissions).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No permissions assigned.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                      <div key={module}>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 capitalize">
                          {module.replace(/_/g, ' ')}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {perms.map((p) => (
                            <Badge key={p.id} variant="secondary" className="text-xs font-mono">
                              {p.name.split(':')[1] ?? p.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role hierarchy */}
            {((role.parent_roles?.length ?? 0) > 0 || (role.child_roles?.length ?? 0) > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Role Hierarchy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(role.parent_roles?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                        Inherits From
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.parent_roles?.map((r) => (
                          <Badge
                            key={r.id}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => router.get(`/school/roles/${r.id}`)}
                          >
                            {r.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(role.child_roles?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                        Extended By
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.child_roles?.map((r) => (
                          <Badge
                            key={r.id}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => router.get(`/school/roles/${r.id}`)}
                          >
                            {r.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Assigned staff */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> Assigned Staff
                  <Badge variant="outline" className="ml-auto">
                    {role.staff_assignments_count ?? role.staff?.length ?? 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(role.staff?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No staff assigned.</p>
                ) : (
                  <ul className="space-y-2">
                    {role.staff?.map((member) => (
                      <li key={member.id} className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RoleShow;
