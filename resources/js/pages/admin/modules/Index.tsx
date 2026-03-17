import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { Module } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap, CreditCard, UserCheck, Megaphone, ShieldCheck, Users,
  BookOpen, Briefcase, ShoppingCart, Building, Award, ClipboardList,
  Trophy, Heart, CheckSquare, BookMarked, Calendar, ChevronRight,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, CreditCard, UserCheck, Megaphone, ShieldCheck, Users,
  BookOpen, Briefcase, ShoppingCart, Building, Award, ClipboardList,
  Trophy, Heart, CheckSquare, BookMarked, Calendar,
};

interface ExtendedModule extends Module {
  is_globally_disabled: boolean;
  tenant_override_count: number;
  enabled_schools_count: number;
}

interface Props extends InertiaSharedProps {
  modules?: ExtendedModule[];
}

const AdminModulesIndex: React.FC<Props> = () => {
  const { modules: allModules = [] } = usePage<Props>().props;
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleGlobalToggle = (moduleKey: string, currentlyDisabled: boolean) => {
    setLoading(moduleKey);
    router.post(
      `/admin/module-management/${moduleKey}/toggle-global`,
      { disabled: !currentlyDisabled },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: `Module ${currentlyDisabled ? 'enabled' : 'disabled'} globally` });
          setLoading(null);
        },
        onError: () => {
          toast({ title: 'Failed to update module', variant: 'destructive' });
          setLoading(null);
        },
      }
    );
  };

  const coreModules = allModules.filter((m) => m.is_core);
  const optionalModules = allModules.filter((m) => !m.is_core);

  const renderModuleCard = (mod: ExtendedModule) => {
    const Icon = iconMap[mod.icon] ?? GraduationCap;
    const isGloballyDisabled = mod.is_globally_disabled;

    return (
      <Card key={mod.id} className={`shadow-sm ${isGloballyDisabled ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-2 flex flex-row items-start gap-3">
          <div className={`mt-0.5 p-2 rounded-md shrink-0 ${isGloballyDisabled ? 'bg-gray-100' : 'bg-primary/10'}`}>
            <Icon className={`h-5 w-5 ${isGloballyDisabled ? 'text-gray-400' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-semibold">{mod.name}</CardTitle>
              {mod.is_core && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Core</Badge>
              )}
              {isGloballyDisabled && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Globally Off</Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-0.5 line-clamp-2">
              {mod.description}
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Used by {mod.enabled_schools_count} schools
              {mod.tenant_override_count > 0 && ` · ${mod.tenant_override_count} overrides`}
            </p>
          </div>
          <Switch
            checked={!isGloballyDisabled}
            disabled={mod.is_core || loading === mod.key}
            onCheckedChange={() => handleGlobalToggle(mod.key, isGloballyDisabled)}
            className="shrink-0"
          />
        </CardHeader>
        <CardContent className="pt-0 pb-3 flex items-center justify-between">
          {mod.dependencies && mod.dependencies.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Requires: {mod.dependencies.join(', ')}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs ml-auto"
            onClick={() => router.get(`/admin/module-management/${mod.key}/tenant-overrides`)}
          >
            Tenant Overrides <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <Head title="Module Management" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Module Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control module availability globally or per school. Core modules cannot be disabled.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Core Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreModules.map(renderModuleCard)}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Optional Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {optionalModules.map(renderModuleCard)}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminModulesIndex;
