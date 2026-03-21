import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    id: number;
    subjectName: string;
    teacherName?: string;
    room?: string;
    startTime?: string;
    endTime?: string;
    onDelete?: (id: number) => void;
    className?: string;
}

const TimetableEntryCard: React.FC<Props> = ({
    id,
    subjectName,
    teacherName,
    room,
    startTime,
    endTime,
    onDelete,
    className,
}) => {
    return (
        <div className={cn('flex items-start gap-1 bg-primary/10 border border-primary/20 rounded p-1.5 group', className)}>
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-grab" />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">{subjectName}</p>
                {teacherName && <p className="text-xs text-muted-foreground truncate">{teacherName}</p>}
                <div className="flex gap-1 flex-wrap mt-0.5">
                    {room && <span className="text-xs text-muted-foreground">{room}</span>}
                    {startTime && endTime && (
                        <span className="text-xs text-muted-foreground">{startTime}–{endTime}</span>
                    )}
                </div>
            </div>
            {onDelete && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => onDelete(id)}
                >
                    <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
            )}
        </div>
    );
};

export default TimetableEntryCard;
