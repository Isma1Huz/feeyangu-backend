import React, { useState } from 'react';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { SCHOOL_SETTINGS_TEXT: t } = useT();
  const [schoolName, setSchoolName] = useState('Green Valley Academy');
  const [motto, setMotto] = useState('Excellence Through Knowledge');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [email, setEmail] = useState('info@greenvalleyacademy.co.ke');
  const [phone, setPhone] = useState('+254 712 345 678');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');

  const handleSave = () => {
    toast({ title: t.savedMessage });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* School Profile */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t.sections.profile}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.fields.schoolName}</Label>
            <Input placeholder={t.fields.schoolNamePlaceholder} value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t.fields.motto}</Label>
            <Input placeholder={t.fields.mottoPlaceholder} value={motto} onChange={e => setMotto(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t.fields.location}</Label>
            <Input placeholder={t.fields.locationPlaceholder} value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.fields.email}</Label>
              <Input placeholder={t.fields.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.fields.phone}</Label>
              <Input placeholder={t.fields.phonePlaceholder} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t.sections.branding}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.fields.primaryColor}</Label>
              <div className="flex gap-2">
                <Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.fields.secondaryColor}</Label>
              <div className="flex gap-2">
                <Input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.fields.logo}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <p className="text-sm text-muted-foreground">{t.fields.uploadLogo}</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t.sections.subscription}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <span className="text-muted-foreground">{t.subscription.plan}</span>
            <span className="font-medium">{t.subscription.planValue}</span>
            <span className="text-muted-foreground">{t.subscription.status}</span>
            <StatusBadge status="active" />
            <span className="text-muted-foreground">{t.subscription.nextBilling}</span>
            <span>{t.subscription.nextBillingValue}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>{t.saveButton}</Button>
      </div>
    </div>
  );
};

export default Settings;
