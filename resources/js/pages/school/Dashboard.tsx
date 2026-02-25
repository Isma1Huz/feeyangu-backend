import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useT } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { SCHOOL_KPI, MONTHLY_REVENUE, MOCK_PAYMENTS, MOCK_FEE_STRUCTURES, MOCK_STUDENTS, ACCOUNTANT_KPI } from '@/lib/mock-data';
import schoolBannerBg from '@/assets/school-banner-bg.jpg';
import schoolLogo from '@/assets/school-logo.png';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

const COLLECTION_BY_METHOD = [
  { name: 'M-Pesa', value: 1440000, color: 'hsl(142, 72%, 35%)' },
  { name: 'Bank Transfer', value: 720000, color: 'hsl(200, 72%, 45%)' },
  { name: 'Cash', value: 180000, color: 'hsl(45, 90%, 50%)' },
  { name: 'Card', value: 60000, color: 'hsl(280, 60%, 50%)' },
];

const AGING_DATA = [
  { range: '0-30 days', amount: 280000, students: 15 },
  { range: '31-60 days', amount: 180000, students: 8 },
  { range: '61-90 days', amount: 120000, students: 5 },
  { range: '90+ days', amount: 100000, students: 3 },
];

const SchoolDashboard: React.FC = () => {
  const T = useT();
  const { user } = useAuth();
  const t = T.DASHBOARD_TEXT.school;
  const COMMON_TEXT = T.COMMON_TEXT;
  const PAYMENT_METHOD_LABELS = T.PAYMENT_METHOD_LABELS;
  const navigate = useNavigate();

  const totalStudents = MOCK_STUDENTS.length;
  const totalFees = MOCK_STUDENTS.reduce((s, st) => s + st.totalFees, 0);
  const totalPaid = MOCK_STUDENTS.reduce((s, st) => s + st.paidFees, 0);
  const totalOutstanding = totalFees - totalPaid;
  const collectionRate = Math.round((totalPaid / totalFees) * 100);

  const principalKPIs = [
    { title: 'Total Revenue', value: `KES ${(totalPaid / 1000000).toFixed(1)}M`, change: '+8.2%', changeType: 'positive' as const, icon: 'DollarSign' },
    { title: 'Outstanding Fees', value: `KES ${(totalOutstanding / 1000).toFixed(0)}K`, change: '-3.1%', changeType: 'positive' as const, icon: 'Clock' },
    { title: 'Collection Rate', value: `${collectionRate}%`, change: '+2.4%', changeType: 'positive' as const, icon: 'TrendingUp' },
    { title: 'Overdue Accounts', value: '23', change: '+5', changeType: 'negative' as const, icon: 'AlertTriangle' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Principal's Financial Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">{T.HEADER.welcomeBack}</p>
      </div>

      <div className="relative rounded-xl overflow-hidden text-primary-foreground p-6 sm:p-8">
        <img src={schoolBannerBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{user?.schoolName || 'Your School'}</h2>
            <p className="text-sm sm:text-base text-primary-foreground/80 mt-1 italic">Nurturing Excellence, Shaping Futures</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm border border-white/30 shrink-0 overflow-hidden p-1">
            <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {principalKPIs.map((kpi, i) => (<KPICard key={kpi.title} data={kpi} index={i} />))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{t.revenueChart}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_REVENUE}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => [`${COMMON_TEXT.currency} ${value.toLocaleString()}`, '']} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGradient)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="target" stroke="hsl(142, 72%, 35%)" fill="transparent" strokeWidth={1.5} strokeDasharray="5 5" name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Collections by Method</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={COLLECTION_BY_METHOD} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                    {COLLECTION_BY_METHOD.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {COLLECTION_BY_METHOD.map(m => (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-muted-foreground">{m.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receivables Aging */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Receivables Aging</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AGING_DATA.map(a => (
                <div key={a.range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{a.range} <span className="text-xs">({a.students} students)</span></span>
                    <span className="font-mono-amount font-medium">{COMMON_TEXT.currency} {a.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={(a.amount / 280000) * 100} className="h-2" />
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between text-sm font-semibold">
                <span>Total Outstanding</span>
                <span className="font-mono-amount text-destructive">{COMMON_TEXT.currency} {AGING_DATA.reduce((s, a) => s + a.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Alerts */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{t.overdueAlert}</CardTitle>
              <Button variant="link" size="sm" className="text-primary text-xs p-0 h-auto" onClick={() => navigate('/school/payments')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Dennis Muthoni', grade: 'Grade 8', amount: 30000, days: 45 },
                { name: 'Esther Nyambura', grade: 'Grade 5', amount: 38000, days: 60 },
                { name: 'Gloria Wambui', grade: 'Grade 6', amount: 15000, days: 20 },
                { name: 'Brian Kimani', grade: 'Grade 7', amount: 12000, days: 15 },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.grade} · {item.days} {T.HEADER.daysOverdue}</p>
                  </div>
                  <p className="text-sm font-mono-amount font-semibold text-destructive">{COMMON_TEXT.currency} {item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Fee Collection by Grade</CardTitle>
            <Button variant="link" size="sm" className="text-primary text-xs p-0 h-auto gap-1" onClick={() => navigate('/school/fee-structures')}>
              View Structures <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead className="text-right">Fee Amount</TableHead>
                <TableHead>Collection Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_FEE_STRUCTURES.filter(f => f.status === 'active').map(fs => {
                const pct = Math.round(60 + Math.random() * 35);
                return (
                  <TableRow key={fs.id}>
                    <TableCell className="font-medium">{fs.grade}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fs.term}</TableCell>
                    <TableCell className="text-right font-mono-amount">{COMMON_TEXT.currency} {fs.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 w-20" />
                        <span className="text-xs font-mono-amount">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={fs.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{t.recentPayments}</CardTitle>
            <Button variant="link" size="sm" className="text-primary text-xs p-0 h-auto gap-1" onClick={() => navigate('/school/payments')}>
              {T.HEADER.viewAll} <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{T.PAYMENTS_TEXT.table.date}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.student}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.amount}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.method}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.status}</TableHead>
                <TableHead>{T.PAYMENTS_TEXT.table.reference}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PAYMENTS.slice(0, 5).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{p.date}</TableCell>
                  <TableCell className="text-sm font-medium">{p.studentName}</TableCell>
                  <TableCell className="text-sm font-mono-amount">{COMMON_TEXT.currency} {p.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono-amount">{p.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolDashboard;
