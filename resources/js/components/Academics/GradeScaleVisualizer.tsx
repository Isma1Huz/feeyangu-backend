import React from 'react';
import { cn } from '@/lib/utils';

export interface GradeScale {
    id: number;
    grade: string;
    min_percentage: number;
    max_percentage: number;
    description?: string;
    color?: string;
}

interface Props {
    scales: GradeScale[];
    highlightPercentage?: number;
    className?: string;
}

const DEFAULT_COLORS: Record<string, string> = {
    'A': 'bg-emerald-100 border-emerald-300 text-emerald-800',
    'B': 'bg-blue-100 border-blue-300 text-blue-800',
    'C': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'D': 'bg-orange-100 border-orange-300 text-orange-800',
    'E': 'bg-red-100 border-red-300 text-red-800',
    'F': 'bg-gray-100 border-gray-300 text-gray-800',
};

const getGradeColor = (grade: string, customColor?: string) => {
    if (customColor) return customColor;
    const letter = grade.charAt(0).toUpperCase();
    return DEFAULT_COLORS[letter] ?? 'bg-gray-100 border-gray-300 text-gray-800';
};

const isHighlighted = (scale: GradeScale, pct?: number) => {
    if (pct === undefined) return false;
    return pct >= scale.min_percentage && pct <= scale.max_percentage;
};

const GradeScaleVisualizer: React.FC<Props> = ({ scales, highlightPercentage, className }) => {
    const sorted = [...scales].sort((a, b) => b.min_percentage - a.min_percentage);

    return (
        <div className={cn('space-y-1', className)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {sorted.map(scale => (
                    <div
                        key={scale.id}
                        className={cn(
                            'border rounded-lg p-3 transition-all',
                            getGradeColor(scale.grade, scale.color),
                            isHighlighted(scale, highlightPercentage) && 'ring-2 ring-offset-1 ring-primary shadow-md scale-105'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold">{scale.grade}</span>
                            <span className="text-sm font-medium">
                                {scale.min_percentage}% – {scale.max_percentage}%
                            </span>
                        </div>
                        {scale.description && (
                            <p className="text-xs mt-1 opacity-75">{scale.description}</p>
                        )}
                    </div>
                ))}
                {sorted.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                        No grade scales defined.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeScaleVisualizer;
