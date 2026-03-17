import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import type { DashboardUserType } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Save } from 'lucide-react';

type ConfigMap = Record<string, boolean>;
type AllConfigs = Record<DashboardUserType, ConfigMap>;

interface Props extends InertiaSharedProps {
  configs: AllConfigs;
  userTypes: DashboardUserType[];
  availableWidgets: string[];
}

const widgetLabels: Record<string, string> = {
  show_fee_balance:        'Fee Balance',
  show_attendance_summary: 'Attendance Summary',
  show_academic_results:   'Academic Results',
  show_upcoming_events:    'Upcoming Events',
  show_notifications:      'Notifications',
  show_payment_history:    'Payment History',
  show_timetable:          'Timetable',
  show_homework:           'Homework',
  show_health_summary:     'Health Summary',
  show_transport_info:     'Transport Info',
};

const DashboardVisibility: React.FC<Props> = () => {
  const { configs: initialConfigs, userTypes, availableWidgets } = usePage<Props>().props;
  const { toast } = useToast();

  const [configs, setConfigs] = useState<AllConfigs>(initialConfigs);
  const [saving, setSaving] = useState<DashboardUserType | null>(null);

  const handleToggle = (userType: DashboardUserType, key: string, value: boolean) => {
    setConfigs((prev) => ({
      ...prev,
      [userType]: { ...prev[userType], [key]: value },
    }));
  };

  const handleSave = (userType: DashboardUserType) => {
    setSaving(userType);
    router.put(
      `/school/dashboard-config/${userType}`,
      { config: configs[userType] },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: `Settings saved for ${userType}s` });
          setSaving(null);
        },
        onError: () => {
          toast({ title: 'Failed to save settings', variant: 'destructive' });
          setSaving(null);
        },
      }
    );
  };

  const handleReset = (userType: DashboardUserType) => {
    if (!confirm(`Reset all dashboard settings for ${userType}s to defaults?`)) return;
    router.post(
      `/school/dashboard-config/reset/${userType}`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast({ title: `Settings reset for ${userType}s` }),
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Dashboard Visibility Settings" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Visibility</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control which widgets are visible on each user type's dashboard.
          </p>
        </div>

        <Tabs defaultValue={userTypes[0]}>
          <TabsList>
            {userTypes.map((ut) => (
              <TabsTrigger key={ut} value={ut} className="capitalize">{ut}s</TabsTrigger>
            ))}
          </TabsList>

          {userTypes.map((userType) => (
            <TabsContent key={userType} value={userType}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base capitalize">{userType} Dashboard</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleReset(userType)}>
                      <RotateCcw className="h-3 w-3 mr-1" /> Reset
                    </Button>
                    <Button size="sm" onClick={() => handleSave(userType)} disabled={saving === userType}>
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableWidgets.map((key) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{widgetLabels[key] ?? key}</p>
                          <p className="text-xs text-muted-foreground font-mono">{key}</p>
                        </div>
                        <Switch
                          checked={configs[userType]?.[key] ?? false}
                          onCheckedChange={(v) => handleToggle(userType, key, v)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DashboardVisibility;
