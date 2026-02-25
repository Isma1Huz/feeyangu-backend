import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Clock, Shield } from 'lucide-react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

/**
 * ⚠️ WARNING: This page uses MOCK/HARDCODED data and is NOT connected to the backend.
 * 
 * Current Issues:
 * - No Inertia::render() call from backend controller
 * - Reports array is hardcoded (lines 30-38)
 * - Report generation is simulated/fake (line 56)
 * - CSV downloads contain fake data (line 71)
 * - Last generated dates are hardcoded
 * 
 * Required Backend Integration:
 * 1. Create backend route: accountant/reports
 * 2. Create controller method to render this page with real report metadata
 * 3. Create API endpoints for actual report generation
 * 4. Implement real PDF/Excel/CSV generation
 * 5. Store generated reports in database/storage
 */

interface Props extends InertiaSharedProps {}

const Reports: React.FC = () => {
  const { toast } = useToast();
  const T = useT();
  const t = T.ACCOUNTANT_REPORTS_TEXT;

  // Generate Report modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportDateFrom, setReportDateFrom] = useState('2026-01-01');
  const [reportDateTo, setReportDateTo] = useState('2026-02-28');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [reportGrade, setReportGrade] = useState('all');
  const [generating, setGenerating] = useState(false);

  const reports = [
    { key: 'incomeStatement', icon: TrendingUp, description: 'Revenue and expense summary for a given period.', lastGenerated: '2026-02-10', color: 'hsl(142, 72%, 35%)' },
    { key: 'cashFlow', icon: BarChart3, description: 'Cash inflows and outflows analysis.', lastGenerated: '2026-02-08', color: 'hsl(200, 72%, 45%)' },
    { key: 'feeCollection', icon: FileText, description: 'Detailed fee collection breakdown by grade and class.', lastGenerated: '2026-02-14', color: 'hsl(var(--primary))' },
    { key: 'outstanding', icon: Clock, description: 'All outstanding and overdue fee balances.', lastGenerated: '2026-02-14', color: 'hsl(45, 90%, 50%)' },
    { key: 'paymentMethod', icon: Calendar, description: 'Transaction breakdown by payment method with fees.', lastGenerated: '2026-02-12', color: 'hsl(280, 60%, 50%)' },
    { key: 'aging', icon: BarChart3, description: 'Receivables categorized by age (30/60/90+ days).', lastGenerated: '2026-02-14', color: 'hsl(0, 72%, 45%)' },
    { key: 'audit', icon: Shield, description: 'Complete audit trail of all financial actions.', lastGenerated: '2026-02-13', color: 'hsl(220, 60%, 50%)' },
  ];

  const openGenerate = (reportKey: string) => {
    setSelectedReport(reportKey);
    setReportDateFrom('2026-01-01');
    setReportDateTo('2026-02-28');
    setReportFormat('pdf');
    setReportGrade('all');
    setGenerateOpen(true);
  };

  const handleGenerate = async () => {
    if (!reportDateFrom || !reportDateTo) {
      toast({ title: 'Date Range Required', description: 'Please select a date range for the report.', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGenerating(false);

    const label = (t.reports as Record<string, string>)[selectedReport] || selectedReport;
    toast({
      title: `${label} Generated`,
      description: `Report for ${reportDateFrom} to ${reportDateTo} ready for download as ${reportFormat.toUpperCase()}.`,
    });
    setGenerateOpen(false);
  };

  const handleDownload = (reportKey: string) => {
    const label = (t.reports as Record<string, string>)[reportKey] || reportKey;
    // Generate a simple CSV as downloadable content
    const header = 'Category,Amount,Date\n';
    const rows = 'Tuition Fees,2400000,2026-02-14\nLunch Fees,480000,2026-02-14\nActivity Fees,120000,2026-02-14\nTransport,96000,2026-02-14\n';
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportKey}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded', description: `${label} report downloaded.` });
  };

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const label = (t.reports as Record<string, string>)[report.key];
          return (
            <Card key={report.key} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${report.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: report.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Last generated: {report.lastGenerated}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => openGenerate(report.key)}>
                    {t.actions.generate}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleDownload(report.key)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate Report Modal */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Configure {(t.reports as Record<string, string>)[selectedReport]} parameters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date From <span className="text-destructive">*</span></Label>
                <Input type="date" value={reportDateFrom} onChange={e => setReportDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date To <span className="text-destructive">*</span></Label>
                <Input type="date" value={reportDateTo} onChange={e => setReportDateTo(e.target.value)} />
              </div>
            </div>
            {(selectedReport === 'feeCollection' || selectedReport === 'outstanding' || selectedReport === 'aging') && (
              <div className="space-y-2">
                <Label>Grade Filter</Label>
                <Select value={reportGrade} onValueChange={setReportGrade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                    <SelectItem value="Grade 7">Grade 7</SelectItem>
                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={reportFormat} onValueChange={v => setReportFormat(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate & Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default Reports;
