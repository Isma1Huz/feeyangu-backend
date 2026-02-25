import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter } from '@/components/DataTable';
import AppLayout from '@/layouts/AppLayout';

interface Child {
  studentId: string;
  name: string;
}

interface Payment {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
}

interface Props extends InertiaSharedProps {
  payments: Payment[];
  children: Child[];
}

const PaymentHistory: React.FC = () => {
  const { payments: allPayments, children } = usePage<Props>().props;
  const { PARENT_PAYMENTS_TEXT: t, COMMON_TEXT, PAYMENT_METHOD_LABELS } = useT();
  const [search, setSearch] = useState('');
  const [childFilter, setChildFilter] = useState('all');

  const payments = useMemo(() =>
    allPayments
      .filter(p => childFilter === 'all' || p.studentId === childFilter)
      .filter(p => !search || p.reference.toLowerCase().includes(search.toLowerCase()) || p.studentName.toLowerCase().includes(search.toLowerCase())),
    [allPayments, search, childFilter]);

  const columns: DataTableColumn<typeof payments[0]>[] = [
    { key: 'date', header: t.table.date, render: p => <span className="text-sm">{p.date}</span> },
    { key: 'studentName', header: t.table.child, render: p => <span className="text-sm">{p.studentName}</span> },
    { key: 'amount', header: t.table.amount, render: p => <span className="text-sm font-mono-amount">{COMMON_TEXT.currency} {p.amount.toLocaleString()}</span> },
    { key: 'method', header: t.table.method, render: p => <span className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</span> },
    { key: 'status', header: t.table.status, render: p => <StatusBadge status={p.status} /> },
    { key: 'reference', header: t.table.reference, render: p => <span className="text-sm text-muted-foreground font-mono-amount">{p.reference}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'child', label: t.filterChild, options: children.map(c => ({ value: c.studentId, label: c.name })) },
  ];

  const exportCsv = (data: typeof payments) => {
    const header = 'Date,Child,Amount,Method,Status,Reference\n';
    const rows = data.map(p => `${p.date},${p.studentName},${p.amount},${PAYMENT_METHOD_LABELS[p.method]},${p.status},${p.reference}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payment-history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p></div>
        <DataTable
          data={payments}
          columns={columns}
          keyField="id"
          searchPlaceholder={t.searchPlaceholder}
          searchValue={search}
          onSearchChange={setSearch}
          filters={tableFilters}
          filterValues={{ child: childFilter }}
          onFilterChange={(k, v) => { if (k === 'child') setChildFilter(v); }}
          onExport={exportCsv}
          emptyTitle={t.emptyState.title}
          emptyDescription={t.emptyState.description}
        />
      </div>
    </AppLayout>
  );
};

export default PaymentHistory;
