import React from 'react';
import { Head } from '@inertiajs/react';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import { Plus } from 'lucide-react';

const SchoolHealthSettings: React.FC = () => {
  const T = useT();

  return (
    <AppLayout>
      <Head title="Health Settings" />
      <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Health Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure medical record categories and access permissions.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Access Permissions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Principal can view full health records</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Class Teacher can see health alerts</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>School Nurse has full access</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>All staff can see basic alerts</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between"><CardTitle className="text-base">Condition Categories</CardTitle><Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" />Add</Button></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Chronic', 'Allergy', 'Disability', 'Dietary', 'Mental Health', 'Other'].map(cat => (
              <div key={cat} className="px-3 py-1.5 rounded-full bg-muted text-sm">{cat}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between"><CardTitle className="text-base">Tracked Vaccinations</CardTitle><Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" />Add</Button></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['BCG', 'Polio (OPV)', 'MMR', 'Hepatitis B', 'Covid-19', 'DPT', 'Yellow Fever'].map(v => (
              <div key={v} className="px-3 py-1.5 rounded-full bg-muted text-sm">{v}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Emergency Protocol Document</CardTitle></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Upload school emergency protocol document (PDF)</p>
            <Button variant="outline" size="sm">Upload Document</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
      </div>
    </AppLayout>
  );
};

export default SchoolHealthSettings;
