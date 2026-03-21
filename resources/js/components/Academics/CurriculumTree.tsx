import React, { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface LearningArea {
    id: number;
    name: string;
    code: string;
}

export interface CurriculumNode {
    id: number;
    name: string;
    code: string;
    type: 'cbc' | '844' | 'cambridge';
    is_active: boolean;
    learning_areas?: LearningArea[];
    subjects_count?: number;
}

interface Props {
    curricula: CurriculumNode[];
    onSelectCurriculum?: (curriculum: CurriculumNode) => void;
    selectedId?: number;
}

const CurriculumTree: React.FC<Props> = ({ curricula, onSelectCurriculum, selectedId }) => {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (id: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    if (curricula.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No curricula found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {curricula.map(curriculum => (
                <div key={curriculum.id} className="border rounded-lg overflow-hidden">
                    <div
                        className={cn(
                            'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                            selectedId === curriculum.id && 'bg-primary/5 border-l-4 border-l-primary'
                        )}
                        onClick={() => {
                            onSelectCurriculum?.(curriculum);
                            toggle(curriculum.id);
                        }}
                    >
                        <button
                            type="button"
                            className="text-muted-foreground"
                            onClick={e => { e.stopPropagation(); toggle(curriculum.id); }}
                        >
                            {expanded.has(curriculum.id)
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                            }
                        </button>
                        <Layers className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{curriculum.name}</span>
                                <span className="text-xs text-muted-foreground">{curriculum.code}</span>
                                <Badge variant="outline" className="text-xs uppercase">{curriculum.type}</Badge>
                                {!curriculum.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                            </div>
                        </div>
                        {curriculum.subjects_count !== undefined && (
                            <span className="text-xs text-muted-foreground shrink-0">
                                {curriculum.subjects_count} subjects
                            </span>
                        )}
                    </div>

                    {expanded.has(curriculum.id) && curriculum.learning_areas && (
                        <div className="border-t bg-muted/20 px-4 py-2 space-y-1">
                            {curriculum.learning_areas.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">No learning areas defined.</p>
                            ) : (
                                curriculum.learning_areas.map(la => (
                                    <div key={la.id} className="flex items-center gap-2 py-1 pl-4">
                                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm">{la.name}</span>
                                        <span className="text-xs text-muted-foreground">{la.code}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CurriculumTree;
