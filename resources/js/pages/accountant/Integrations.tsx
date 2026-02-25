import React from 'react';
import { RefreshCw, Link2, Unlink, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { Integration } from '@/types/accountant.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  integrations: Integration[];
}

const providerLogos: Record<string, { bg: string; text: string }> = {
  xero: { bg: 'hsl(200, 80%, 95%)', text: 'hsl(200, 80%, 40%)' },
  quickbooks: { bg: 'hsl(142, 60%, 95%)', text: 'hsl(142, 60%, 35%)' },
  zoho: { bg: 'hsl(0, 60%, 95%)', text: 'hsl(0, 60%, 40%)' },
  wave: { bg: 'hsl(220, 60%, 95%)', text: 'hsl(220, 60%, 40%)' },
  sage: { bg: 'hsl(142, 40%, 95%)', text: 'hsl(142, 40%, 35%)' },
};

const statusIcons: Record<string, React.ReactNode> = {
  connected: <CheckCircle className="h-4 w-4 text-success" />,
  disconnected: <XCircle className="h-4 w-4 text-muted-foreground" />,
  error: <AlertTriangle className="h-4 w-4 text-destructive" />,
  syncing: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
};

const Integrations: React.FC = () => {
  const { integrations } = usePage<Props>().props;
  const { toast } = useToast();
  const T = useT();
  const t = T.ACCOUNTANT_INTEGRATIONS_TEXT;

  const allProviders = [
    { provider: 'xero', displayName: 'Xero' },
    { provider: 'quickbooks', displayName: 'QuickBooks Online' },
    { provider: 'zoho', displayName: 'Zoho Books' },
    { provider: 'wave', displayName: 'Wave Accounting' },
    { provider: 'sage', displayName: 'Sage Business Cloud' },
  ];

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allProviders.map((p) => {
          const integration = integrations.find(i => i.provider === p.provider);
          const isConnected = integration?.status === 'connected';
          const colors = providerLogos[p.provider] || { bg: 'hsl(0,0%,95%)', text: 'hsl(0,0%,40%)' };

          return (
            <Card key={p.provider} className={`shadow-sm ${isConnected ? 'border-success/30' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: colors.bg, color: colors.text }}>
                      {p.displayName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{p.displayName}</h3>
                      {integration && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {statusIcons[integration.status]}
                          <span className="text-xs text-muted-foreground capitalize">{integration.status}</span>
                        </div>
                      )}
                      {!integration && (
                        <span className="text-xs text-muted-foreground">Not connected</span>
                      )}
                    </div>
                  </div>
                </div>

                {integration && isConnected && (
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.lastSynced}</span>
                      <span>{new Date(integration.lastSyncedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.syncFrequency}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{integration.syncFrequency}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.itemsSynced}</span>
                      <span className="font-mono-amount">{integration.itemsSynced}</span>
                    </div>
                    {integration.syncErrors > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>{t.syncErrors}</span>
                        <span className="font-semibold">{integration.syncErrors}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => toast({ title: 'Syncing...', description: `Syncing with ${p.displayName}` })}>
                        <RefreshCw className="h-3 w-3 mr-1" /> {t.syncNow}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive" onClick={() => toast({ title: 'Disconnected', description: `${p.displayName} disconnected.` })}>
                        <Unlink className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => toast({ title: 'Connect', description: `OAuth flow for ${p.displayName} would start here.` })}>
                      <Link2 className="h-3 w-3 mr-1" /> {t.connect}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </AppLayout>
  );
};

export default Integrations;
