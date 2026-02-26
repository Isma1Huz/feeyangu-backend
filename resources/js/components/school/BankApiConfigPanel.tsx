import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Building2, Key, Settings2 } from 'lucide-react';
import type { PaymentProvider } from '@/types/payment.types';

interface BankApiConfig {
  provider: PaymentProvider;
  apiKey?: string;
  merchantCode?: string;
  apiSecret?: string;
  baseUrl?: string;
}

interface Props {
  provider: PaymentProvider;
  providerName: string;
  config?: BankApiConfig;
  onSave?: (config: BankApiConfig) => void;
}

const BankApiConfigPanel: React.FC<Props> = ({ provider, providerName, config, onSave }) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [merchantCode, setMerchantCode] = useState(config?.merchantCode || '');
  const [apiSecret, setApiSecret] = useState(config?.apiSecret || '');
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim() && !merchantCode.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter at least an API Key or Merchant Code',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    try {
      const configData: BankApiConfig = {
        provider,
        apiKey: apiKey.trim() || undefined,
        merchantCode: merchantCode.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
        baseUrl: baseUrl.trim() || undefined,
      };

      if (onSave) {
        await onSave(configData);
      }

      toast({
        title: 'API Configuration Saved',
        description: `${providerName} API settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save API configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getProviderInstructions = () => {
    switch (provider) {
      case 'equity':
        return 'Configure your Equity Bank Jenga API credentials. You can obtain these from the Equity Bank Developer Portal.';
      case 'kcb':
        return 'Configure your KCB Bank API credentials. Contact KCB Bank to get API access for payment processing.';
      case 'ncba':
        return 'Configure your NCBA Bank API credentials. Contact NCBA Bank to get API access for payment processing.';
      case 'coop':
        return 'Configure your Co-operative Bank API credentials. Contact Co-op Bank to get API access for payment processing.';
      default:
        return 'Configure your bank API credentials to enable automated payment processing.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">API Configuration</CardTitle>
            <CardDescription className="text-xs">{providerName} Payment Gateway</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {getProviderInstructions()}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchantCode" className="text-sm">Merchant Code / ID</Label>
            <Input
              id="merchantCode"
              value={merchantCode}
              onChange={(e) => setMerchantCode(e.target.value)}
              placeholder="Enter merchant code or ID"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret" className="text-sm">API Secret (Optional)</Label>
            <Input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter API secret if required"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-sm">API Base URL (Optional)</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use the default production URL
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save API Configuration'}
            </Button>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> These credentials are stored securely and encrypted. They are used only for processing payments through {providerName}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankApiConfigPanel;
