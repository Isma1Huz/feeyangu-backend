import React, { useState, useMemo } from 'react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_RECEIPTS, PARENT_CHILDREN } from '@/lib/mock-data';
import DataTable, { type DataTableColumn, type DataTableFilter, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Download, Printer } from 'lucide-react';
import type { Receipt } from '@/types';

const childIds = PARENT_CHILDREN.map(c => c.studentId);

const ParentReceipts: React.FC = () => {
  const { PARENT_RECEIPTS_TEXT: t, COMMON_TEXT, RECEIPTS_TEXT } = useT();
  const [search, setSearch] = useState('');
  const [childFilter, setChildFilter] = useState('all');
  const [preview, setPreview] = useState<Receipt | null>(null);

  const receipts = useMemo(() =>
    MOCK_RECEIPTS.filter(r => childIds.includes(r.studentId))
      .filter(r => childFilter === 'all' || r.studentId === childFilter)
      .filter(r => !search || r.receiptNumber.toLowerCase().includes(search.toLowerCase())),
    [search, childFilter]);

  const columns: DataTableColumn<Receipt>[] = [
    { key: 'receiptNumber', header: t.table.receiptNo, render: r => <span className="font-mono-amount text-sm">{r.receiptNumber}</span> },
    { key: 'date', header: t.table.date, render: r => <span className="text-sm">{r.date}</span> },
    { key: 'studentName', header: t.table.child, render: r => <span className="text-sm">{r.studentName}</span> },
    { key: 'amount', header: t.table.amount, render: r => <span className="text-sm font-mono-amount">{COMMON_TEXT.currency} {r.amount.toLocaleString()}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'child', label: t.filterChild, options: PARENT_CHILDREN.map(c => ({ value: c.studentId, label: c.name })) },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: COMMON_TEXT.actions.download, icon: <Download className="h-3.5 w-3.5" />, onClick: () => window.print() },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
      <DataTable
        data={receipts}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        searchValue={search}
        onSearchChange={setSearch}
        filters={tableFilters}
        filterValues={{ child: childFilter }}
        onFilterChange={(k, v) => { if (k === 'child') setChildFilter(v); }}
        bulkActions={bulkActions}
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(r) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setPreview(r)}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => window.print()}><Download className="h-4 w-4" /></Button>
          </div>
        )}
      />
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{RECEIPTS_TEXT.preview.title}</DialogTitle></DialogHeader>
          {preview && (
            <div className="space-y-4 text-sm">
              <div className="text-center border-b pb-3"><h3 className="font-bold text-lg">{RECEIPTS_TEXT.preview.schoolName}</h3><p className="text-muted-foreground">{RECEIPTS_TEXT.preview.receiptLabel}: {preview.receiptNumber}</p></div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">{RECEIPTS_TEXT.preview.dateLabel}:</span> {preview.date}</div>
                <div><span className="text-muted-foreground">{RECEIPTS_TEXT.preview.studentLabel}:</span> {preview.studentName}</div>
                <div><span className="text-muted-foreground">{RECEIPTS_TEXT.preview.methodLabel}:</span> {preview.paymentMethod}</div>
                <div><span className="text-muted-foreground">{RECEIPTS_TEXT.preview.referenceLabel}:</span> <span className="font-mono-amount">{preview.paymentReference}</span></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>{RECEIPTS_TEXT.preview.itemLabel}</TableHead><TableHead className="text-right">{RECEIPTS_TEXT.preview.amountLabel}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {preview.items.map((item, i) => (<TableRow key={i}><TableCell>{item.name}</TableCell><TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {item.amount.toLocaleString()}</TableCell></TableRow>))}
                  <TableRow className="font-bold"><TableCell>{RECEIPTS_TEXT.preview.totalLabel}</TableCell><TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {preview.amount.toLocaleString()}</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentReceipts;
