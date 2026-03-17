import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { Module, ModuleOverrideStatus } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface SchoolWithOverride {
  id: number;
  name: string;
  location: string;
  subscription_status: string;
  plan_name?: string;
  override_status: ModuleOverrideStatus;
  module_is_enabled: boolean;
}

interface Props extends InertiaSharedProps {
  module: Module;
  schools: SchoolWithOverride[];
}

const TenantOverrides: React.FC<Props> = () => {
  const { module: mod, schools = [] } = usePage<Props>().props;
  const { toast } = useToast();
  const [pending, setPending] = useState<number | null>(null);

  const handleOverrideChange = (schoolId: number, status: ModuleOverrideStatus) => {
    setPending(schoolId);
    router.post(
      `/admin/module-management/${mod.key}/tenant-overrides`,
      { school_id: schoolId, status },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: 'Override updated' });
          setPending(null);
        },
        onError: () => {
          toast({ title: 'Failed to update override', variant: 'destructive' });
          setPending(null);
        },
      }
    );
  };

  const handleResetAll = () => {
    if (!confirm('Reset all tenant overrides for this module?')) return;
    router.post(`/admin/module-management/${mod.key}/reset-overrides`, {}, {
      onSuccess: () => toast({ title: 'All overrides reset' }),
    });
  };

  const getStatusBadge = (school: SchoolWithOverride) => {
    if (school.override_status === 'enabled') {
      return <Badge className="bg-green-100 text-green-800">Force Enabled</Badge>;
    }
    if (school.override_status === 'disabled') {
      return <Badge variant="destructive">Force Disabled</Badge>;
    }
    if (school.module_is_enabled) {
      return <Badge variant="secondary">Active (Plan)</Badge>;
    }
    return <Badge variant="outline">Inactive (Plan)</Badge>;
  };

  return (
    <AppLayout>
      <Head title={`Tenant Overrides – ${mod.name}`} />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get('/admin/module-management')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tenant Overrides: {mod.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set per-school overrides. "Inherit" means the school follows its subscription plan.
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={handleResetAll}>
            Reset All Overrides
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schools ({schools.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">School</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-left p-3 font-medium">Module Status</th>
                    <th className="text-left p-3 font-medium">Override</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.location}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">{school.plan_name ?? '—'}</td>
                      <td className="p-3">{getStatusBadge(school)}</td>
                      <td className="p-3">
                        <Select
                          value={school.override_status}
                          disabled={pending === school.id}
                          onValueChange={(v) => handleOverrideChange(school.id, v as ModuleOverrideStatus)}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inherit">Inherit (Plan)</SelectItem>
                            <SelectItem value="enabled">Force Enable</SelectItem>
                            <SelectItem value="disabled">Force Disable</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TenantOverrides;
