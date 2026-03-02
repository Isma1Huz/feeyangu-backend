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

interface Report {
  key: string;
  icon: string;
  description: string;
  lastGenerated: string;
  color: string;
}

interface Props extends InertiaSharedProps {
  reports: Report[];
  grades: string[];
}

const Reports: React.FC = () => {
  const { reports, grades } = usePage<Props>().props;
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

  const iconMap: Record<string, React.ComponentType<any>> = {
    TrendingUp,
    BarChart3,
    FileText,
    Clock,
    Calendar,
    Shield,
  };

  const openGenerate = (reportKey: string) => {
    setSelectedReport(reportKey);
    setReportDateFrom('2026-01-01');
    setReportDateTo('2026-02-28');
    setReportFormat('pdf');
    setReportGrade('all');
    setGenerateOpen(true);
  };

  const handleGenerate = () => {
    if (!reportDateFrom || !reportDateTo) {
      toast({ title: 'Date Range Required', description: 'Please select a date range for the report.', variant: 'destructive' });
      return;
    }

    const params = new URLSearchParams({
      reportType: selectedReport,
      dateFrom: reportDateFrom,
      dateTo: reportDateTo,
      format: reportFormat,
      grade: reportGrade,
    });

    if (reportFormat === 'csv') {
      // CSV: trigger a direct file download via GET
      window.location.href = `/accountant/reports/download?${params.toString()}`;
    } else {
      // PDF/Excel: POST through Inertia so it shows flash success
      router.post('/accountant/reports/generate', {
        reportType: selectedReport,
        dateFrom: reportDateFrom,
        dateTo: reportDateTo,
        format: reportFormat,
        grade: reportGrade,
      }, {
        onSuccess: () => {
          const label = (t.reports as Record<string, string>)[selectedReport] || selectedReport;
          toast({
            title: `${label} Generated`,
            description: `Report for ${reportDateFrom} to ${reportDateTo} queued as ${reportFormat.toUpperCase()}.`,
          });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to generate report.', variant: 'destructive' });
        },
      });
    }

    setGenerateOpen(false);
  };

  const handleDownload = (reportKey: string) => {
    // Trigger CSV download via GET download route
    const params = new URLSearchParams({
      reportType: reportKey,
      dateFrom: '2026-01-01',
      dateTo: new Date().toISOString().split('T')[0],
      grade: 'all',
    });

    window.location.href = `/accountant/reports/download?${params.toString()}`;
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
          const Icon = iconMap[report.icon] || FileText;
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
                    {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
            <Button onClick={handleGenerate}>Generate & Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default Reports;
