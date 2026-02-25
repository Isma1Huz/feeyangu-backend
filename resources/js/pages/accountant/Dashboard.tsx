import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import schoolBannerBg from '@/assets/school-banner-bg.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { Payment } from '@/types';
import type { ReconciliationItem } from '@/types/accountant.types';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  kpiData: {
    dailyCollections: string;
    pendingReconciliation: number;
    unmatchedTransactions: number;
    outstandingInvoices: number;
    paymentSuccessRate: string;
    pettyCashBalance: string;
  };
  monthlyCollections: Array<{ month: string; invoiced: number; collected: number }>;
  paymentMethodDistribution: Array<{ method: string; value: number; color: string }>;
  receivablesAging: Array<{ range: string; amount: number; count: number }>;
  recentPayments: Payment[];
  reconciliationQueue: ReconciliationItem[];
}

const kpiIcons: Record<string, React.ElementType> = {
  dailyCollections: DollarSign,
  pendingReconciliation: Clock,
  unmatchedTransactions: AlertTriangle,
  outstandingInvoices: TrendingUp,
  paymentSuccessRate: CheckCircle,
  pettyCashBalance: Wallet,
};

const kpiColors = ['hsl(var(--primary))', 'hsl(45, 90%, 50%)', 'hsl(0, 72%, 45%)', 'hsl(200, 72%, 45%)', 'hsl(142, 72%, 35%)', 'hsl(280, 60%, 50%)'];

const AccountantDashboard: React.FC = () => {
  const { kpiData, monthlyCollections, paymentMethodDistribution, receivablesAging, recentPayments, reconciliationQueue } = usePage<Props>().props;
  const T = useT();
  const t = T.ACCOUNTANT_DASHBOARD_TEXT;
  const kpiEntries = [
    { key: 'dailyCollections', value: kpiData.dailyCollections, change: '+12%', changeType: 'positive' as const },
    { key: 'pendingReconciliation', value: String(kpiData.pendingReconciliation), change: '-3', changeType: 'positive' as const },
    { key: 'unmatchedTransactions', value: String(kpiData.unmatchedTransactions), change: '+2', changeType: 'negative' as const },
    { key: 'outstandingInvoices', value: String(kpiData.outstandingInvoices), change: '-8', changeType: 'positive' as const },
    { key: 'paymentSuccessRate', value: kpiData.paymentSuccessRate, change: '+1.1%', changeType: 'positive' as const },
    { key: 'pettyCashBalance', value: kpiData.pettyCashBalance, change: '', changeType: 'neutral' as const },
  ];

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden text-primary-foreground p-6 sm:p-8">
        <img src={schoolBannerBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold">Financial Command Center</h2>
          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg mt-2">
            Daily collections, reconciliation status, and financial health at a glance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiEntries.map((kpi, i) => {
          const Icon = kpiIcons[kpi.key];
          return (
            <Card key={kpi.key} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${kpiColors[i]}15` }}>
                    <Icon className="h-4 w-4" style={{ color: kpiColors[i] }} />
                  </div>
                  {kpi.change && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.changeType === 'positive' ? 'text-success' : kpi.changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {kpi.changeType === 'positive' ? <ArrowUpRight className="h-3 w-3" /> : kpi.changeType === 'negative' ? <ArrowDownRight className="h-3 w-3" /> : null}
                      {kpi.change}
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold font-mono-amount">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{(t.kpi as Record<string, string>)[kpi.key]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trend */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.collectionTrend}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCollections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 89%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 45%)" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(0, 0%, 89%)', fontSize: '12px' }} />
                  <Bar dataKey="invoiced" fill="hsl(0, 0%, 80%)" name="Invoiced" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" fill="hsl(0, 72%, 40%)" name="Collected" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.paymentMethods}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodDistribution} dataKey="value" nameKey="method" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {paymentMethodDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {paymentMethodDistribution.map((m) => (
                <div key={m.method} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  <span className="text-muted-foreground">{m.method}</span>
                  <span className="font-semibold ml-auto">{m.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receivables Aging */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.receivablesAging}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receivablesAging.map((item) => (
                <div key={item.range} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">{item.range}</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(item.amount / 380000) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono-amount font-semibold">KES {item.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reconciliation Queue */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.reconciliationQueue}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reconciliationQueue.filter(r => r.status !== 'matched').map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border ${item.status === 'unmatched_bank' ? 'border-destructive/20 bg-destructive/5' : item.status === 'suggested' ? 'border-warning/20 bg-warning/5' : 'border-primary/20 bg-primary/5'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {item.bankTransaction?.description || item.systemStudentName || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.bankTransaction?.date || ''} · {item.bankTransaction?.reference || item.systemPaymentRef || ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono-amount font-semibold">
                        KES {(item.bankTransaction?.amount || item.systemAmount || 0).toLocaleString()}
                      </p>
                      <Badge variant={item.status === 'suggested' ? 'secondary' : 'destructive'} className="text-[10px] mt-1">
                        {item.status === 'suggested' ? 'Review' : item.status === 'unmatched_bank' ? 'Unmatched' : 'No Bank Match'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Activity */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.recentActivity}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentPayments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${p.status === 'completed' ? 'bg-success/10' : p.status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                    {p.status === 'completed' ? <CheckCircle className="h-4 w-4 text-success" /> : p.status === 'pending' ? <Clock className="h-4 w-4 text-warning" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.studentName}</p>
                    <p className="text-xs text-muted-foreground">{p.date} · {p.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono-amount font-semibold">KES {p.amount.toLocaleString()}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
};

export default AccountantDashboard;
