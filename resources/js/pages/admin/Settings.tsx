import React, { useState } from 'react';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const { ADMIN_SETTINGS_TEXT: t } = useT();
  const [platformName, setPlatformName] = useState('Feeyangu');
  const [supportEmail, setSupportEmail] = useState('support@feeyangu.com');
  const [currency, setCurrency] = useState('KES');
  const [maintenance, setMaintenance] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [overdueReminders, setOverdueReminders] = useState(true);

  const handleSave = () => {
    toast({ title: t.savedMessage });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t.sections.general}</TabsTrigger>
          <TabsTrigger value="notifications">{t.sections.notifications}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>{t.fields.platformName}</Label>
                <Input value={platformName} onChange={e => setPlatformName(e.target.value)} placeholder={t.fields.platformNamePlaceholder} className="mt-1 max-w-md" />
              </div>
              <div>
                <Label>{t.fields.supportEmail}</Label>
                <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder={t.fields.supportEmailPlaceholder} className="mt-1 max-w-md" />
              </div>
              <div>
                <Label>{t.fields.defaultCurrency}</Label>
                <Input value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 max-w-xs" />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <Label>{t.fields.maintenanceMode}</Label>
                <Switch checked={maintenance} onCheckedChange={setMaintenance} />
              </div>
              <Button onClick={handleSave}>{t.saveButton}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between max-w-md">
                <Label>{t.fields.emailNotifications}</Label>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <Label>{t.fields.smsNotifications}</Label>
                <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <Label>{t.fields.paymentAlerts}</Label>
                <Switch checked={paymentAlerts} onCheckedChange={setPaymentAlerts} />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <Label>{t.fields.overdueReminders}</Label>
                <Switch checked={overdueReminders} onCheckedChange={setOverdueReminders} />
              </div>
              <Button onClick={handleSave}>{t.saveButton}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
