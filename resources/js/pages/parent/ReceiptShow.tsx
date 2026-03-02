import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface ReceiptItem {
  name: string;
  amount: number;
}

interface Receipt {
  id: string;
  receipt_number: string;
  student: {
    id: string;
    name: string;
    admission_number: string;
  };
  school: {
    name: string;
    location: string;
  };
  amount: number;
  payment_method: string;
  payment_reference: string;
  issued_at: string;
}

interface Props extends InertiaSharedProps {
  receipt: Receipt;
  items: ReceiptItem[];
}

const ParentReceiptShow: React.FC = () => {
  const { receipt, items } = usePage<Props>().props;
  const { COMMON_TEXT, RECEIPTS_TEXT } = useT();

  if (!receipt) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Receipt not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Receipt ${receipt.receipt_number}`} />
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.visit('/parent/receipts')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{RECEIPTS_TEXT.preview.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">{RECEIPTS_TEXT.preview.receiptLabel}: {receipt.receipt_number}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        <Card className="shadow-sm print:shadow-none">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <h2 className="text-xl font-bold">{receipt.school.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{receipt.school.location}</p>
              <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wider">Official Payment Receipt</p>
              <p className="text-sm font-mono-amount font-semibold mt-1">{receipt.receipt_number}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide block">{RECEIPTS_TEXT.preview.studentLabel}</span>
                  <span className="font-semibold">{receipt.student.name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide block">Admission No.</span>
                  <span className="font-mono-amount">{receipt.student.admission_number}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide block">{RECEIPTS_TEXT.preview.dateLabel}</span>
                  <span>{receipt.issued_at}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide block">{RECEIPTS_TEXT.preview.methodLabel}</span>
                  <span className="font-medium">{receipt.payment_method}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide block">{RECEIPTS_TEXT.preview.referenceLabel}</span>
                  <span className="font-mono-amount text-xs">{receipt.payment_reference}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{RECEIPTS_TEXT.preview.itemLabel}</TableHead>
                    <TableHead className="text-right">{RECEIPTS_TEXT.preview.amountLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>{RECEIPTS_TEXT.preview.totalLabel}</TableCell>
                    <TableCell className="text-right font-mono-amount text-success">{COMMON_TEXT.currency} {receipt.amount.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground border-t pt-4">
              <p>This is an official receipt. Please keep it for your records.</p>
              <p className="mt-1">Powered by Feeyangu School Fee Management</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ParentReceiptShow;
