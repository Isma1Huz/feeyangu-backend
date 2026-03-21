import React from 'react';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export interface TimetableEntry {
    id: number;
    day_of_week: number; // 1=Mon ... 5=Fri
    period: number;
    subject?: { id: number; name: string };
    teacher?: { id: number; name: string };
    room?: string;
    start_time?: string;
    end_time?: string;
}

interface Props {
    entries: TimetableEntry[];
    periods: number;
    onEntryClick?: (entry: TimetableEntry) => void;
    onSlotClick?: (day: number, period: number) => void;
    disabled?: boolean;
}

const TimetableGrid: React.FC<Props> = ({ entries, periods, onEntryClick, onSlotClick, disabled = false }) => {
    const periodNumbers = Array.from({ length: periods }, (_, i) => i + 1);

    const getEntry = (day: number, period: number) =>
        entries.find(e => e.day_of_week === day && e.period === period);

    return (
        <div className="overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                    <tr>
                        <th className="border p-2 bg-muted text-muted-foreground w-20">Period</th>
                        {DAYS.map((day, i) => (
                            <th key={day} className="border p-2 bg-muted font-medium">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {periodNumbers.map(period => (
                        <tr key={period}>
                            <td className="border p-2 bg-muted/50 text-center text-muted-foreground font-medium">
                                P{period}
                            </td>
                            {DAYS.map((_, dayIdx) => {
                                const dayNum = dayIdx + 1;
                                const entry = getEntry(dayNum, period);
                                return (
                                    <td
                                        key={dayNum}
                                        className={cn(
                                            'border p-1 min-w-[120px] h-16 align-top',
                                            !disabled && !entry && 'cursor-pointer hover:bg-primary/5',
                                            !disabled && entry && 'cursor-pointer'
                                        )}
                                        onClick={() => {
                                            if (disabled) return;
                                            if (entry) onEntryClick?.(entry);
                                            else onSlotClick?.(dayNum, period);
                                        }}
                                    >
                                        {entry ? (
                                            <div className="bg-primary/10 border border-primary/20 rounded p-1 h-full">
                                                <p className="font-medium text-xs truncate">{entry.subject?.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{entry.teacher?.name}</p>
                                                {entry.room && (
                                                    <p className="text-xs text-muted-foreground">{entry.room}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs">
                                                {!disabled && '+ Add'}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TimetableGrid;
