import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Moon, Sun, Camera } from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

const PROFILE_TEXT = {
  title: 'Profile & Settings',
  subtitle: 'Manage your account, security, and preferences.',
  tabs: { profile: 'Profile', security: 'Security', notifications: 'Notifications', preferences: 'Preferences' },
  profile: {
    title: 'Personal Information',
    description: 'Update your personal details and profile picture.',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    phonePlaceholder: '+254 7XX XXX XXX',
    save: 'Save Changes',
    saved: 'Profile updated successfully.',
    changePhoto: 'Change Photo',
  },
  security: {
    title: 'Password & Security',
    description: 'Keep your account safe with a strong password and two-factor authentication.',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    passwordUpdated: 'Password updated successfully.',
    passwordMismatch: 'Passwords do not match.',
    twoFactor: 'Two-Factor Authentication',
    twoFactorDescription: 'Add an extra layer of security to your account by requiring a verification code.',
    enable2FA: 'Enable 2FA',
    disable2FA: 'Disable 2FA',
    twoFactorEnabled: '2FA has been enabled.',
    twoFactorDisabled: '2FA has been disabled.',
    sessions: 'Active Sessions',
    sessionsDescription: 'Manage your active login sessions across devices.',
    currentSession: 'Current Session',
    lastActive: 'Last active: Now',
    revokeAll: 'Sign Out All Other Sessions',
    revoked: 'All other sessions have been signed out.',
  },
  notifications: {
    title: 'Notification Preferences',
    description: 'Choose how you want to be notified.',
    email: 'Email Notifications',
    emailDescription: 'Receive notifications via email.',
    push: 'Push Notifications',
    pushDescription: 'Receive push notifications in your browser.',
    sms: 'SMS Notifications',
    smsDescription: 'Receive important alerts via SMS.',
    paymentAlerts: 'Payment Alerts',
    paymentAlertsDescription: 'Get notified when payments are received or due.',
    overdueReminders: 'Overdue Reminders',
    overdueRemindersDescription: 'Receive reminders about overdue fees.',
    weeklyReport: 'Weekly Summary',
    weeklyReportDescription: 'Receive a weekly summary of activity.',
    saved: 'Notification preferences saved.',
  },
  preferences: {
    title: 'Appearance & Preferences',
    description: 'Customize how Feeyangu looks and feels.',
    theme: 'Theme',
    themeDescription: 'Choose your preferred color scheme.',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    languageDescription: 'Set your preferred language for the interface.',
  },
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const t = useT();
  const { toast } = useToast();
  const pt = PROFILE_TEXT;

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [overdueReminders, setOverdueReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const handleSaveProfile = () => {
    toast({ title: pt.profile.saved });
  };

  const handleChangePassword = () => {
    if (newPw !== confirmPw) {
      toast({ title: pt.security.passwordMismatch, variant: 'destructive' });
      return;
    }
    toast({ title: pt.security.passwordUpdated });
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  const handleToggle2FA = () => {
    setTwoFactor(!twoFactor);
    toast({ title: twoFactor ? pt.security.twoFactorDisabled : pt.security.twoFactorEnabled });
  };

  const handleSaveNotifications = () => {
    toast({ title: pt.notifications.saved });
  };

  return (
    <AppLayout>
      <Head title={pt.title} />
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pt.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{pt.subtitle}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5 hidden sm:inline" />{pt.tabs.profile}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5 hidden sm:inline" />{pt.tabs.security}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="h-3.5 w-3.5 hidden sm:inline" />{pt.tabs.notifications}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs sm:text-sm">
            <Moon className="h-3.5 w-3.5 hidden sm:inline" />{pt.tabs.preferences}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{pt.profile.title}</CardTitle>
              <CardDescription>{pt.profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{pt.profile.fullName}</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{pt.profile.email}</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{pt.profile.phone}</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={pt.profile.phonePlaceholder} />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>{pt.profile.save}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />{pt.security.changePassword}</CardTitle>
                <CardDescription>{pt.security.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{pt.security.currentPassword}</Label>
                  <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{pt.security.newPassword}</Label>
                    <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{pt.security.confirmPassword}</Label>
                    <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleChangePassword}>{pt.security.updatePassword}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{pt.security.twoFactor}</CardTitle>
                <CardDescription>{pt.security.twoFactorDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{pt.security.twoFactor}</p>
                    <p className="text-xs text-muted-foreground">{twoFactor ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{pt.security.sessions}</CardTitle>
                <CardDescription>{pt.security.sessionsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{pt.security.currentSession}</p>
                    <p className="text-xs text-muted-foreground">{pt.security.lastActive}</p>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">Active</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: pt.security.revoked })}>
                  {pt.security.revokeAll}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{pt.notifications.title}</CardTitle>
              <CardDescription>{pt.notifications.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: pt.notifications.email, desc: pt.notifications.emailDescription, checked: emailNotif, set: setEmailNotif },
                { label: pt.notifications.push, desc: pt.notifications.pushDescription, checked: pushNotif, set: setPushNotif },
                { label: pt.notifications.sms, desc: pt.notifications.smsDescription, checked: smsNotif, set: setSmsNotif },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.checked} onCheckedChange={item.set} />
                </div>
              ))}
              <Separator />
              {[
                { label: pt.notifications.paymentAlerts, desc: pt.notifications.paymentAlertsDescription, checked: paymentAlerts, set: setPaymentAlerts },
                { label: pt.notifications.overdueReminders, desc: pt.notifications.overdueRemindersDescription, checked: overdueReminders, set: setOverdueReminders },
                { label: pt.notifications.weeklyReport, desc: pt.notifications.weeklyReportDescription, checked: weeklyReport, set: setWeeklyReport },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.checked} onCheckedChange={item.set} />
                </div>
              ))}
              <Button onClick={handleSaveNotifications}>{PROFILE_TEXT.profile.save}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{pt.preferences.title}</CardTitle>
              <CardDescription>{pt.preferences.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-1">{pt.preferences.theme}</p>
                <p className="text-xs text-muted-foreground mb-3">{pt.preferences.themeDescription}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-sm font-medium">{pt.preferences.light}</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-sm font-medium">{pt.preferences.dark}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
