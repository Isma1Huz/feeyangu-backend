import React, { useState, useMemo } from 'react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_PAYMENTS, PARENT_CHILDREN } from '@/lib/mock-data';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { type DataTableColumn, type DataTableFilter } from '@/components/DataTable';

const childIds = PARENT_CHILDREN.map(c => c.studentId);

const PaymentHistory: React.FC = () => {
  const { PARENT_PAYMENTS_TEXT: t, COMMON_TEXT, PAYMENT_METHOD_LABELS } = useT();
  const [search, setSearch] = useState('');
  const [childFilter, setChildFilter] = useState('all');

  const payments = useMemo(() =>
    MOCK_PAYMENTS.filter(p => childIds.includes(p.studentId))
      .filter(p => childFilter === 'all' || p.studentId === childFilter)
      .filter(p => !search || p.reference.toLowerCase().includes(search.toLowerCase()) || p.studentName.toLowerCase().includes(search.toLowerCase())),
    [search, childFilter]);

  const columns: DataTableColumn<typeof payments[0]>[] = [
    { key: 'date', header: t.table.date, render: p => <span className="text-sm">{p.date}</span> },
    { key: 'studentName', header: t.table.child, render: p => <span className="text-sm">{p.studentName}</span> },
    { key: 'amount', header: t.table.amount, render: p => <span className="text-sm font-mono-amount">{COMMON_TEXT.currency} {p.amount.toLocaleString()}</span> },
    { key: 'method', header: t.table.method, render: p => <span className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</span> },
    { key: 'status', header: t.table.status, render: p => <StatusBadge status={p.status} /> },
    { key: 'reference', header: t.table.reference, render: p => <span className="text-sm text-muted-foreground font-mono-amount">{p.reference}</span> },
  ];

  const tableFilters: DataTableFilter[] = [
    { key: 'child', label: t.filterChild, options: PARENT_CHILDREN.map(c => ({ value: c.studentId, label: c.name })) },
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
  );
};

export default PaymentHistory;
