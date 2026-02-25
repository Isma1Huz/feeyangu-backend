import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'overdue' | 'paid' | 'partial' | 'suspended' | 'upcoming';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  paid: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  completed: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  partial: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  inactive: 'bg-muted text-muted-foreground border-border hover:bg-muted',
  upcoming: 'bg-info/10 text-info border-info/20 hover:bg-info/20',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { COMMON_TEXT } = useT();
  return (
    <Badge variant="outline" className={cn('text-xs font-medium capitalize', statusStyles[status], className)}>
      {COMMON_TEXT.status[status] || status}
    </Badge>
  );
};

export default StatusBadge;
