import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Eye, Printer, Download, Trash2 } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import type { Receipt } from '@/types';
import DataTable, { type DataTableColumn, type DataTableBulkAction } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  receipts: Receipt[];
}

const Receipts: React.FC = () => {
  const { RECEIPTS_TEXT: t, COMMON_TEXT } = useT();
  const { receipts } = usePage<Props>().props;
  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewing, setViewing] = useState<Receipt | null>(null);

  const filtered = useMemo(() =>
    receipts.filter(r => !search || r.receiptNumber.toLowerCase().includes(search.toLowerCase()) || r.studentName.toLowerCase().includes(search.toLowerCase())),
    [search, receipts]);

  const handlePrint = () => window.print();

  const exportCsv = (data: Receipt[]) => {
    const header = 'Receipt #,Date,Student,Amount,Method,Reference\n';
    const rows = data.map(r => `${r.receiptNumber},${r.date},${r.studentName},${r.amount},${r.paymentMethod},${r.paymentReference}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'receipts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<Receipt>[] = [
    { key: 'receiptNumber', header: t.table.receiptNo, render: r => <span className="font-mono-amount text-sm">{r.receiptNumber}</span> },
    { key: 'date', header: t.table.date, render: r => <span className="text-sm">{r.date}</span> },
    { key: 'studentName', header: t.table.student, render: r => <span className="font-medium">{r.studentName}</span> },
    { key: 'amount', header: t.table.amount, render: r => <span className="font-mono-amount">{COMMON_TEXT.currency} {r.amount.toLocaleString()}</span> },
    { key: 'paymentMethod', header: t.table.method, render: r => <span className="text-sm">{r.paymentMethod}</span> },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: COMMON_TEXT.actions.print, icon: <Printer className="h-3.5 w-3.5" />, onClick: () => handlePrint() },
    { label: COMMON_TEXT.actions.download, icon: <Download className="h-3.5 w-3.5" />, onClick: (ids) => {
      const selected = receipts.filter(r => ids.includes(r.id));
      exportCsv(selected);
    }},
  ];

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
      <DataTable
        data={filtered}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        searchValue={search}
        onSearchChange={setSearch}
        bulkActions={bulkActions}
        onExport={exportCsv}
        exportLabel={COMMON_TEXT.actions.export}
        emptyTitle={t.emptyState.title}
        emptyDescription={t.emptyState.description}
        rowActions={(r) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(r); setPreviewOpen(true); }}><Eye className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrint}><Printer className="h-3 w-3" /></Button>
          </div>
        )}
      />
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.preview.title}</DialogTitle><DialogDescription>{t.preview.schoolName}</DialogDescription></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="text-center pb-2"><h3 className="text-lg font-bold text-primary">{t.preview.schoolName}</h3><p className="text-xs text-muted-foreground">{t.preview.receiptLabel} #{viewing.receiptNumber}</p></div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">{t.preview.dateLabel}</span><span>{viewing.date}</span>
                <span className="text-muted-foreground">{t.preview.studentLabel}</span><span className="font-medium">{viewing.studentName}</span>
                <span className="text-muted-foreground">{t.preview.methodLabel}</span><span>{viewing.paymentMethod}</span>
                <span className="text-muted-foreground">{t.preview.referenceLabel}</span><span className="font-mono-amount">{viewing.paymentReference}</span>
              </div>
              <Separator />
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">{t.preview.itemLabel}</TableHead><TableHead className="text-xs text-right">{t.preview.amountLabel}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewing.items.map((item, i) => (<TableRow key={i}><TableCell className="text-sm">{item.name}</TableCell><TableCell className="text-sm text-right font-mono-amount">{COMMON_TEXT.currency} {item.amount.toLocaleString()}</TableCell></TableRow>))}
                  <TableRow className="font-semibold"><TableCell>{t.preview.totalLabel}</TableCell><TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {viewing.amount.toLocaleString()}</TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-1.5" />{COMMON_TEXT.actions.print}</Button>
                <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />{COMMON_TEXT.actions.download}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default Receipts;
