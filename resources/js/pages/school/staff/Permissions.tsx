import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { SchoolRole, StaffRoleAssignment, StaffDirectPermission, Permission, User } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props extends InertiaSharedProps {
  staff: User;
  roleAssignments: StaffRoleAssignment[];
  directPermissions: StaffDirectPermission[];
  availableRoles: SchoolRole[];
  allPermissions: Record<string, Permission[]>;
}

const StaffPermissions: React.FC<Props> = () => {
  const { staff, roleAssignments = [], directPermissions = [], availableRoles = [], allPermissions } = usePage<Props>().props;
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState('');

  const assignedRoleIds = roleAssignments.map((r) => r.role_id);
  const assignedPermIds = directPermissions.map((p) => p.permission_id);

  const handleAssignRole = () => {
    if (!selectedRole) return;
    router.post(`/school/staff/${staff.id}/roles/${selectedRole}`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: 'Role assigned' });
        setSelectedRole('');
      },
      onError: () => toast({ title: 'Failed to assign role', variant: 'destructive' }),
    });
  };

  const handleRemoveRole = (roleId: number) => {
    router.delete(`/school/staff/${staff.id}/roles/${roleId}`, {
      preserveScroll: true,
      onSuccess: () => toast({ title: 'Role removed' }),
    });
  };

  const handleAddPermission = (permId: number) => {
    router.post(`/school/staff/${staff.id}/permissions/${permId}`, {}, {
      preserveScroll: true,
      onSuccess: () => toast({ title: 'Permission granted' }),
    });
  };

  const handleRemovePermission = (permId: number) => {
    router.delete(`/school/staff/${staff.id}/permissions/${permId}`, {
      preserveScroll: true,
      onSuccess: () => toast({ title: 'Permission revoked' }),
    });
  };

  return (
    <AppLayout>
      <Head title={`Permissions – ${staff.name}`} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/school/users')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Permissions: {staff.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{staff.email}</p>
          </div>
        </div>

        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Roles ({roleAssignments.length})</TabsTrigger>
            <TabsTrigger value="direct">Direct Permissions ({directPermissions.length})</TabsTrigger>
            <TabsTrigger value="effective">Effective Permissions</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assign Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles
                        .filter((r) => !assignedRoleIds.includes(r.id))
                        .map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name}
                            {r.is_system && ' (System)'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAssignRole} disabled={!selectedRole}>
                    <Plus className="h-4 w-4 mr-1" /> Assign
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roleAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No roles assigned.</p>
                ) : (
                  roleAssignments.map((assignment) => (
                    <div key={assignment.role_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{assignment.role?.name}</p>
                        {assignment.expires_at && (
                          <p className="text-xs text-muted-foreground">Expires {assignment.expires_at}</p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveRole(assignment.role_id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct Permissions Tab */}
          <TabsContent value="direct" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Granted Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {directPermissions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {directPermissions.map((dp) => (
                      <div key={dp.permission_id} className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm font-mono">{dp.permission?.name}</span>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemovePermission(dp.permission_id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {Object.entries(allPermissions).map(([moduleKey, permissions]) => (
                    <div key={moduleKey}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{moduleKey}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {permissions
                          .filter((p) => !assignedPermIds.includes(p.id))
                          .map((perm) => (
                            <button
                              key={perm.id}
                              className="text-left text-xs p-2 rounded border hover:bg-muted/50 flex items-center gap-1"
                              onClick={() => handleAddPermission(perm.id)}
                            >
                              <Plus className="h-3 w-3 text-primary shrink-0" />
                              {perm.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effective Permissions Tab */}
          <TabsContent value="effective">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Effective Permissions</CardTitle>
                <p className="text-xs text-muted-foreground">Combined permissions from all assigned roles and direct grants.</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {/* Role permissions */}
                  {roleAssignments.flatMap((ra) => ra.role?.permissions ?? []).map((p) => (
                    <Badge key={`role-${p.id}`} variant="secondary" className="text-xs font-mono">{p.name}</Badge>
                  ))}
                  {/* Direct permissions */}
                  {directPermissions.map((dp) => (
                    <Badge key={`direct-${dp.permission_id}`} className="text-xs font-mono">{dp.permission?.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StaffPermissions;
