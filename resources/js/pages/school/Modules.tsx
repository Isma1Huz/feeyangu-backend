import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap, CreditCard, UserCheck, Megaphone, ShieldCheck, Users,
  BookOpen, Briefcase, ShoppingCart, Building, Award, ClipboardList,
  Trophy, Heart, CheckSquare, BookMarked, Calendar,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, CreditCard, UserCheck, Megaphone, ShieldCheck, Users,
  BookOpen, Briefcase, ShoppingCart, Building, Award, ClipboardList,
  Trophy, Heart, CheckSquare, BookMarked, Calendar,
};

interface SchoolModule {
  id: number;
  name: string;
  key: string;
  icon: string;
  description: string;
  dependencies: string[];
  is_core: boolean;
  is_enabled: boolean;
}

interface Props extends InertiaSharedProps {
  modules?: SchoolModule[];
}

const SchoolModules: React.FC<Props> = () => {
  const { modules = [] } = usePage<Props>().props;
  const { toast } = useToast();

  const handleToggle = (moduleKey: string, currentEnabled: boolean) => {
    router.patch(
      `/school/modules/${moduleKey}`,
      { is_enabled: !currentEnabled },
      {
        preserveScroll: true,
        onSuccess: () =>
          toast({ title: `Module ${!currentEnabled ? 'enabled' : 'disabled'} successfully` }),
        onError: () =>
          toast({ title: 'Failed to update module. Check dependencies.', variant: 'destructive' }),
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Module Management" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Module Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enable or disable features for your school. Core modules are always active.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = iconMap[mod.icon] ?? GraduationCap;
            return (
              <Card key={mod.id} className="shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-md bg-primary/10 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm font-semibold">{mod.name}</CardTitle>
                      {mod.is_core && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Core</Badge>
                      )}
                      <Badge
                        variant={mod.is_enabled ? 'default' : 'outline'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {mod.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5 line-clamp-2">
                      {mod.description}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={mod.is_enabled}
                    disabled={mod.is_core}
                    onCheckedChange={() => handleToggle(mod.key, mod.is_enabled)}
                    className="shrink-0"
                  />
                </CardHeader>
                {mod.dependencies.length > 0 && (
                  <CardContent className="pt-0 pb-3">
                    <p className="text-[11px] text-muted-foreground">
                      Requires: {mod.dependencies.join(', ')}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default SchoolModules;
