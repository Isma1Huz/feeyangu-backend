import React, { useState } from 'react';
import { BANK_API_CONFIGS, type BankApiConfig, type SavedApiCredentials } from '@/types/bank-api.types';
import { PAYMENT_PROVIDERS, type PaymentProvider } from '@/types/payment.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Smartphone, Building2, Eye, EyeOff, ExternalLink,
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Loader2, Settings2, Globe, Lock, TestTube,
} from 'lucide-react';

interface SavedApiCredentialsFromServer {
  provider: PaymentProvider;
  environment: 'sandbox' | 'production';
  enabled: boolean;
  values: Record<string, string>;
}

interface BankApiConfigPanelProps {
  savedCredentials?: Record<string, SavedApiCredentialsFromServer>;
}

const buildInitialCredentials = (saved: Record<string, SavedApiCredentialsFromServer> = {}): SavedApiCredentials[] =>
  BANK_API_CONFIGS.map(cfg => {
    const existing = saved[cfg.provider];
    return {
      provider: cfg.provider,
      environment: existing?.environment ?? ('sandbox' as const),
      enabled: existing?.enabled ?? false,
      values: Object.fromEntries(cfg.fields.map(f => [f.key, existing?.values?.[f.key] ?? ''])),
      testStatus: 'untested' as const,
    };
  });

const BankApiConfigPanel: React.FC<BankApiConfigPanelProps> = ({ savedCredentials = {} }) => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<SavedApiCredentials[]>(() => buildInitialCredentials(savedCredentials));
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>(BANK_API_CONFIGS[0].provider);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const activeConfig: BankApiConfig | undefined = BANK_API_CONFIGS.find(c => c.provider === activeProvider);
  const activeCreds: SavedApiCredentials | undefined = credentials.find(c => c.provider === activeProvider);
  const activeProviderInfo = PAYMENT_PROVIDERS.find(p => p.id === activeProvider);

  const updateField = (provider: PaymentProvider, key: string, value: string) => {
    setCredentials(prev =>
      prev.map(c =>
        c.provider === provider
          ? { ...c, values: { ...c.values, [key]: value }, testStatus: 'untested' as const }
          : c,
      ),
    );
  };

  const toggleEnvironment = (provider: PaymentProvider) => {
    setCredentials(prev =>
      prev.map(c =>
        c.provider === provider
          ? { ...c, environment: c.environment === 'sandbox' ? 'production' : 'sandbox', testStatus: 'untested' as const }
          : c,
      ),
    );
  };

  const toggleEnabled = (provider: PaymentProvider) => {
    setCredentials(prev =>
      prev.map(c =>
        c.provider === provider ? { ...c, enabled: !c.enabled } : c,
      ),
    );
  };

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const hasRequiredFields = (creds: SavedApiCredentials, config: BankApiConfig): boolean => {
    return config.fields
      .filter(f => f.required)
      .every(f => (creds.values[f.key] || '').trim() !== '');
  };

  const handleTest = async (provider: PaymentProvider) => {
    const config = BANK_API_CONFIGS.find(c => c.provider === provider);
    const creds = credentials.find(c => c.provider === provider);
    if (!config || !creds) return;

    if (!hasRequiredFields(creds, config)) {
      toast({
        title: 'Missing credentials',
        description: 'Please fill in all required fields before testing.',
        variant: 'destructive',
      });
      return;
    }

    setCredentials(prev =>
      prev.map(c => c.provider === provider ? { ...c, testStatus: 'testing' as const } : c),
    );

    try {
      const response = await fetch('/school/api-credentials/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          provider,
          environment: creds.environment,
          values: creds.values,
        }),
      });

      const data = await response.json();

      setCredentials(prev =>
        prev.map(c =>
          c.provider === provider
            ? {
                ...c,
                testStatus: response.ok ? 'success' as const : 'failed' as const,
                lastTested: new Date().toISOString(),
                errorMessage: response.ok ? undefined : (data.message || 'Connection test failed'),
              }
            : c,
        ),
      );

      toast({
        title: response.ok ? 'Connection successful' : 'Connection failed',
        description: response.ok
          ? `${config.name} API credentials verified.`
          : (data.message || 'Could not connect to the API. Please check your credentials.'),
        variant: response.ok ? 'default' : 'destructive',
      });
    } catch {
      setCredentials(prev =>
        prev.map(c =>
          c.provider === provider
            ? { ...c, testStatus: 'failed' as const, lastTested: new Date().toISOString(), errorMessage: 'Network error' }
            : c,
        ),
      );
      toast({
        title: 'Connection failed',
        description: 'Could not reach the API. Check your internet connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (provider: PaymentProvider) => {
    const config = BANK_API_CONFIGS.find(c => c.provider === provider);
    const creds = credentials.find(c => c.provider === provider);
    if (!config || !creds) return;

    if (!hasRequiredFields(creds, config)) {
      toast({
        title: 'Missing credentials',
        description: 'Please fill in all required fields before saving.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/school/api-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          provider,
          environment: creds.environment,
          enabled: creds.enabled,
          values: creds.values,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save credentials');
      }

      toast({
        title: 'Credentials saved',
        description: `${config.name} API credentials saved successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save credentials',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getTestStatusBadge = (status: SavedApiCredentials['testStatus']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      case 'testing':
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Testing…
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
            <AlertTriangle className="h-3 w-3" /> Untested
          </Badge>
        );
    }
  };

  if (!activeConfig || !activeCreds) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Bank API Credentials</h2>
          <p className="text-xs text-muted-foreground">
            Configure API keys for each payment provider to enable automated collections.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>Credentials are encrypted at rest</span>
        </div>
      </div>

      <Tabs value={activeProvider} onValueChange={v => setActiveProvider(v as PaymentProvider)}>
        {/* Provider tabs */}
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1">
          {BANK_API_CONFIGS.map(cfg => {
            const providerInfo = PAYMENT_PROVIDERS.find(p => p.id === cfg.provider);
            const creds = credentials.find(c => c.provider === cfg.provider);
            return (
              <TabsTrigger
                key={cfg.provider}
                value={cfg.provider}
                className="text-xs gap-1.5 data-[state=active]:shadow-sm"
              >
                {providerInfo?.category === 'mobile_money'
                  ? <Smartphone className="h-3 w-3" />
                  : <Building2 className="h-3 w-3" />}
                {cfg.name}
                {creds?.enabled && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Provider content panels */}
        {BANK_API_CONFIGS.map(cfg => {
          const creds = credentials.find(c => c.provider === cfg.provider)!;
          const providerInfo = PAYMENT_PROVIDERS.find(p => p.id === cfg.provider);
          const allRequiredFilled = hasRequiredFields(creds, cfg);

          return (
            <TabsContent key={cfg.provider} value={cfg.provider} className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: providerInfo?.color }}
                      >
                        {providerInfo?.category === 'mobile_money'
                          ? <Smartphone className="h-5 w-5" />
                          : <Building2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {cfg.name}
                          {getTestStatusBadge(creds.testStatus)}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">{cfg.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`enabled-${cfg.provider}`} className="text-xs text-muted-foreground cursor-pointer">
                          {creds.enabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`enabled-${cfg.provider}`}
                          checked={creds.enabled}
                          onCheckedChange={() => toggleEnabled(cfg.provider)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Environment toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                    <div className="flex items-center gap-2 text-sm">
                      {creds.environment === 'sandbox'
                        ? <TestTube className="h-4 w-4 text-amber-500" />
                        : <Globe className="h-4 w-4 text-blue-500" />}
                      <span className="font-medium">
                        {creds.environment === 'sandbox' ? 'Sandbox (Testing)' : 'Production (Live)'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {creds.environment === 'sandbox' ? cfg.sandboxBaseUrl : cfg.productionBaseUrl}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Sandbox</span>
                      <Switch
                        checked={creds.environment === 'production'}
                        onCheckedChange={() => toggleEnvironment(cfg.provider)}
                      />
                      <span className="text-xs text-muted-foreground">Production</span>
                    </div>
                  </div>

                  {creds.environment === 'production' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        You are configuring <strong>production</strong> credentials. These will process real payments.
                        Ensure credentials are correct before saving.
                      </p>
                    </div>
                  )}

                  {/* Credential fields */}
                  <div className="space-y-4">
                    {cfg.fields.map(field => {
                      const fieldVisKey = `${cfg.provider}_${field.key}`;
                      const isVisible = visibleFields[fieldVisKey] ?? false;
                      const isPassword = field.type === 'password';

                      return (
                        <div key={field.key} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${cfg.provider}_${field.key}`} className="text-sm">
                              {field.label}
                              {field.required && <span className="text-destructive ml-0.5">*</span>}
                            </Label>
                            {isPassword && (
                              <button
                                type="button"
                                onClick={() => toggleFieldVisibility(fieldVisKey)}
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                              >
                                {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                {isVisible ? 'Hide' : 'Show'}
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              id={`${cfg.provider}_${field.key}`}
                              type={isPassword && !isVisible ? 'password' : 'text'}
                              value={creds.values[field.key] || ''}
                              onChange={e => updateField(cfg.provider, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className={cn('font-mono text-xs', isPassword && !isVisible && 'tracking-widest')}
                            />
                            {isPassword && (
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            )}
                          </div>
                          {field.helpText && (
                            <p className="text-xs text-muted-foreground">{field.helpText}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Error message */}
                  {creds.testStatus === 'failed' && creds.errorMessage && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive">{creds.errorMessage}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(cfg.provider)}
                      disabled={creds.testStatus === 'testing' || !allRequiredFilled}
                      className="gap-1.5"
                    >
                      {creds.testStatus === 'testing'
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <TestTube className="h-3.5 w-3.5" />}
                      Test Connection
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(cfg.provider)}
                      disabled={saving || !allRequiredFilled}
                      className="gap-1.5"
                    >
                      {saving
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Save Credentials
                    </Button>
                    <a
                      href={cfg.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${cfg.name} API documentation`}
                      className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> API Docs
                    </a>
                  </div>

                  {/* Security note */}
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Credentials are encrypted before storage and never exposed in API responses.
                      Only used for payment processing on behalf of your school.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default BankApiConfigPanel;
