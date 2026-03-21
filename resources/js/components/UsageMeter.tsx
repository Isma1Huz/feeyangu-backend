import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Props {
    label: string;
    current: number;
    limit: number;
    unit?: string;
    className?: string;
}

const UsageMeter: React.FC<Props> = ({ label, current, limit, unit = '', className }) => {
    const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;

    const getColor = () => {
        if (percentage >= 90) return 'text-destructive';
        if (percentage >= 75) return 'text-amber-500';
        return 'text-emerald-600';
    };

    const getProgressClass = () => {
        if (percentage >= 90) return '[&>div]:bg-destructive';
        if (percentage >= 75) return '[&>div]:bg-amber-500';
        return '[&>div]:bg-emerald-500';
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-medium', getColor())}>
                    {current.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
                </span>
            </div>
            <Progress value={percentage} className={cn('h-2', getProgressClass())} />
            <p className={cn('text-xs', getColor())}>
                {percentage.toFixed(0)}% used
                {percentage >= 90 && ' — Limit almost reached'}
                {percentage >= 75 && percentage < 90 && ' — Approaching limit'}
            </p>
        </div>
    );
};

export default UsageMeter;
