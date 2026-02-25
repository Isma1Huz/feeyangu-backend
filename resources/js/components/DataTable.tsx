import React, { useState, useCallback, useMemo } from 'react';
import { Search, Download, Upload, CheckSquare, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

/* ─── Types ───────────────────────────────────────────── */

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface DataTableBulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  /** If true, a confirmation dialog is shown before executing */
  confirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  onClick: (selectedIds: string[]) => void;
}

export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyField: keyof T & string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: DataTableFilter[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  headerActions?: React.ReactNode;
  bulkActions?: DataTableBulkAction[];
  rowActions?: (item: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onExport?: (data: T[]) => void;
  exportLabel?: string;
  onImport?: () => void;
  importLabel?: string;
}

/* ─── Component ───────────────────────────────────────── */

function DataTable<T extends Record<string, any>>({
  data, columns, keyField,
  searchPlaceholder, searchValue: controlledSearch, onSearchChange,
  filters, filterValues: controlledFilters, onFilterChange,
  headerActions, bulkActions, rowActions,
  emptyTitle, emptyDescription,
  onExport, exportLabel, onImport, importLabel,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const search = controlledSearch ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  const [internalFilters, setInternalFilters] = useState<Record<string, string>>({});
  const filterVals = controlledFilters ?? internalFilters;
  const setFilter = onFilterChange ?? ((key: string, val: string) => setInternalFilters(prev => ({ ...prev, [key]: val })));

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<DataTableBulkAction | null>(null);

  const allIds = useMemo(() => data.map(d => String(d[keyField])), [data, keyField]);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }, [allSelected, allIds]);

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelected(new Set());
  const hasBulk = bulkActions && bulkActions.length > 0;

  const executeBulkAction = (action: DataTableBulkAction) => {
    if (action.confirm) {
      setConfirmAction(action);
    } else {
      action.onClick(Array.from(selected));
      clearSelection();
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onClick(Array.from(selected));
      clearSelection();
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {someSelected && hasBulk && (
        <div className="flex items-center gap-3 bg-accent border border-border rounded-lg px-4 py-2.5 animate-fade-in">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  Actions
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {bulkActions!.map((action, i) => (
                  <DropdownMenuItem
                    key={i}
                    className={cn('gap-2', action.variant === 'destructive' && 'text-destructive')}
                    onClick={() => executeBulkAction(action)}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
          </div>
        </div>
      )}

      {/* Search + Filters + Actions bar */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {searchPlaceholder && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
            )}
            {filters?.map(f => (
              <Select key={f.key} value={filterVals[f.key] || 'all'} onValueChange={v => setFilter(f.key, v)}>
                <SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder={f.label} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{f.label}</SelectItem>
                  {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            <div className="flex gap-2 ml-auto">
              {onImport && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={onImport}>
                  <Upload className="h-3.5 w-3.5" />{importLabel || 'Import'}
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onExport(data)}>
                  <Download className="h-3.5 w-3.5" />{exportLabel || 'Export'}
                </Button>
              )}
              {headerActions}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">{emptyTitle || 'No data'}</p>
              {emptyDescription && <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {hasBulk && (
                      <TableHead className="w-10">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                      </TableHead>
                    )}
                    {columns.map(col => (
                      <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
                    ))}
                    {rowActions && <TableHead className="w-16" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(item => {
                    const id = String(item[keyField]);
                    const isSelected = selected.has(id);
                    return (
                      <TableRow key={id} data-state={isSelected ? 'selected' : undefined}>
                        {hasBulk && (
                          <TableCell>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(id)} />
                          </TableCell>
                        )}
                        {columns.map(col => (
                          <TableCell key={col.key} className={col.className}>
                            {col.render ? col.render(item) : String(item[col.key] ?? '')}
                          </TableCell>
                        ))}
                        {rowActions && <TableCell>{rowActions(item)}</TableCell>}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk delete confirmation dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.confirmTitle || 'Confirm Action'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription || `Are you sure you want to perform this action on ${selected.size} item(s)? This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={confirmAction?.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction?.label || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DataTable;
