import React, { useState, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
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
    logoUrl: string | null;
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

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(school.logoUrl || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Logo must be under 2MB', variant: 'destructive' } as any);
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await fetch('/school/settings/logo', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': decodeURIComponent(
            document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
          ),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Logo uploaded successfully.' });
        setLogoFile(null);
        setLogoPreview(data.logoUrl);
      } else {
        toast({ title: data.message ?? 'Failed to upload logo', variant: 'destructive' } as any);
      }
    } catch {
      toast({ title: 'Failed to upload logo', variant: 'destructive' } as any);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t.sections.profile}</TabsTrigger>
            <TabsTrigger value="branding">{t.sections.branding}</TabsTrigger>
            <TabsTrigger value="subscription">{t.sections.subscription}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-none shadow-sm">
              <CardContent className="space-y-4 pt-6">
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
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : t.saveButton}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="border-none shadow-sm">
              <CardContent className="space-y-6 pt-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>{t.fields.logo}</Label>
                  <div className="flex items-start gap-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img src={logoPreview} alt="School logo" className="h-24 w-24 rounded-lg object-contain border border-border" />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleLogoSelect}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        {t.fields.uploadLogo}
                      </Button>
                      {logoFile && (
                        <Button
                          size="sm"
                          onClick={handleLogoUpload}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? 'Uploading...' : 'Save Logo'}
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Color Pickers */}
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

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : t.saveButton}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
