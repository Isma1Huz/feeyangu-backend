import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { CreditCard, Check, Crown, Zap, Shield } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/AppLayout';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2500,
    period: '/month',
    icon: Zap,
    features: ['Up to 200 students', 'M-Pesa payments', 'Basic reports', 'Email support'],
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 5000,
    period: '/month',
    icon: Crown,
    features: ['Up to 500 students', 'All payment methods', 'Advanced reports & analytics', 'Priority support', 'SMS notifications'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 10000,
    period: '/month',
    icon: Shield,
    features: ['Unlimited students', 'All payment methods', 'Custom reports', 'Dedicated support', 'SMS & email notifications', 'API access', 'Multi-branch support'],
    popular: false,
  },
];

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface Props extends InertiaSharedProps {
  currentPlan: string;
  nextBillingDate: string;
  paymentHistory: PaymentHistory[];
}

const PlatformBilling: React.FC = () => {
  const T = useT();
  const { currentPlan, nextBillingDate, paymentHistory } = usePage<Props>().props;
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || 'standard');
  const [showPayment, setShowPayment] = useState(false);

  return (
    <AppLayout>
      <Head title="Platform Subscription" />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your Feeyangu platform subscription and billing</p>
        </div>

      {/* Current Plan Status */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg capitalize">{currentPlan} Plan</h3>
                <Badge variant="outline" className="text-primary border-primary/30">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Next billing date: <strong>{nextBillingDate}</strong> · {T.COMMON_TEXT.currency} 5,000/month
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPayment(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            return (
              <Card
                key={plan.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md relative',
                  isSelected && 'ring-2 ring-primary border-primary',
                  plan.popular && 'shadow-md'
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{T.COMMON_TEXT.currency} {plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                  >
                    {isSelected ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">{p.date}</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {p.reference}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono-amount font-semibold">
                    {T.COMMON_TEXT.currency} {p.amount.toLocaleString()}
                  </span>
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

export default PlatformBilling;
