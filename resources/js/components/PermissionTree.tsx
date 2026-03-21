import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PermissionNode {
    id: string | number;
    name: string;
    label?: string;
    children?: PermissionNode[];
}

interface Props {
    permissions: PermissionNode[];
    selected: Set<string | number>;
    onChange: (selected: Set<string | number>) => void;
    disabled?: boolean;
}

interface NodeProps {
    node: PermissionNode;
    selected: Set<string | number>;
    onChange: (selected: Set<string | number>) => void;
    disabled?: boolean;
    depth?: number;
}

const getAllIds = (node: PermissionNode): (string | number)[] => {
    const ids: (string | number)[] = [node.id];
    if (node.children) {
        node.children.forEach(c => ids.push(...getAllIds(c)));
    }
    return ids;
};

const PermissionNodeRow: React.FC<NodeProps> = ({ node, selected, onChange, disabled = false, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const childIds = hasChildren ? node.children!.flatMap(getAllIds) : [];
    const allChildSelected = childIds.length > 0 && childIds.every(id => selected.has(id));
    const someChildSelected = childIds.some(id => selected.has(id));
    const isChecked = selected.has(node.id) || allChildSelected;
    const isIndeterminate = !isChecked && someChildSelected;

    const handleChange = (checked: boolean | 'indeterminate') => {
        const next = new Set(selected);
        const ids = getAllIds(node);
        if (checked === true) {
            ids.forEach(id => next.add(id));
        } else {
            ids.forEach(id => next.delete(id));
        }
        onChange(next);
    };

    return (
        <div>
            <div
                className={cn('flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50', depth > 0 && 'ml-4')}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                {hasChildren && (
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                )}
                {!hasChildren && <span className="w-4" />}
                <Checkbox
                    id={`perm-${node.id}`}
                    checked={isIndeterminate ? 'indeterminate' : isChecked}
                    onCheckedChange={handleChange}
                    disabled={disabled}
                />
                <Label htmlFor={`perm-${node.id}`} className="cursor-pointer text-sm">
                    {node.label ?? node.name}
                </Label>
            </div>
            {hasChildren && expanded && (
                <div>
                    {node.children!.map(child => (
                        <PermissionNodeRow
                            key={child.id}
                            node={child}
                            selected={selected}
                            onChange={onChange}
                            disabled={disabled}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PermissionTree: React.FC<Props> = ({ permissions, selected, onChange, disabled = false }) => {
    return (
        <div className="border rounded-md divide-y">
            {permissions.map(node => (
                <PermissionNodeRow
                    key={node.id}
                    node={node}
                    selected={selected}
                    onChange={onChange}
                    disabled={disabled}
                />
            ))}
            {permissions.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground text-center">No permissions available.</p>
            )}
        </div>
    );
};

export default PermissionTree;
