import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  school: {
    name: string;
    motto: string;
    location: string;
    email: string;
    phone: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { SCHOOL_SETTINGS_TEXT: t } = useT();
  const { school } = usePage<Props>().props;
  const [schoolName, setSchoolName] = useState(school.name);
  const [motto, setMotto] = useState(school.motto || '');
  const [location, setLocation] = useState(school.location || '');
  const [email, setEmail] = useState(school.email || '');
  const [phone, setPhone] = useState(school.phone || '');
  const [primaryColor, setPrimaryColor] = useState(school.primaryColor || '#8B0000');
  const [secondaryColor, setSecondaryColor] = useState(school.secondaryColor || '#FFD700');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    router.put('/school/settings', {
      name: schoolName,
      motto,
      location,
      email,
      phone,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    }, {
      onSuccess: () => {
        toast({ title: t.savedMessage });
      },
      onError: () => {
        toast({ title: 'Error saving settings', variant: 'destructive' } as any);
      },
      onFinish: () => {
        setSaving(false);
      },
    });
  };

  return (
    <AppLayout>
      <Head title={t.title} />
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
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : t.saveButton}</Button>
      </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
