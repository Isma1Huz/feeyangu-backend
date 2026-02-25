import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Clock, AlertTriangle, Building2, TrendingUp, FileCheck } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import type { KPIData } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Users, DollarSign, Clock, AlertTriangle, Building2, TrendingUp, FileCheck,
};

interface KPICardProps {
  data: KPIData;
  index?: number;
}

const KPICard: React.FC<KPICardProps> = ({ data, index = 0 }) => {
  const { COMMON_TEXT } = useT();
  const Icon = iconMap[data.icon] || Users;
  const isPositive = data.changeType === 'positive';
  const isNegative = data.changeType === 'negative';

  return (
    <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: `${index * 100}ms` }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{data.title}</p>
            <p className="text-2xl font-bold font-mono-amount tracking-tight">{data.value}</p>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}>
                {data.change}
              </span>
              <span className="text-xs text-muted-foreground">{COMMON_TEXT.vsLastMonth}</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
