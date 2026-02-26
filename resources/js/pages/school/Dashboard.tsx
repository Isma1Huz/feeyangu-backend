import { Head, usePage } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ArrowRight, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'
import AppLayout from '@/layouts/AppLayout'
import KPICard from '@/components/KPICard'
import StatusBadge from '@/components/StatusBadge'
import type { KPIData } from '@/types'
import schoolBannerBg from '@/assets/school-banner-bg.jpg'
import schoolLogo from '@/assets/school-logo.png'

interface KPI {
  total_students: number
  active_students: number
  inactive_students: number
  total_revenue: number
  total_pending: number
  total_overdue: number
  collection_rate: number
  overdue_count: number
}

interface Payment {
  id: number
  student_name: string
  parent_name: string
  amount: number
  provider: string
  status: string
  reference: string
  created_at: string
}

interface Invoice {
  id: number
  invoice_number: string
  student_name: string
  total_amount: number
  paid_amount: number
  balance: number
  due_date: string
  days_overdue: number
}

interface GradeData {
  grade: string
  count: number
}

interface Student {
  id: number
  full_name: string
  admission_number: string
  grade: string
  class: string
  enrolled_at: string
}

interface CollectionMethod {
  name: string
  value: number
  color: string
}

interface AgingData {
  range: string
  amount: number
  students: number
}

interface MonthlyRevenue {
  month: string
  revenue: number
  target: number
}

interface Props {
  kpi: KPI
  recentPayments: Payment[]
  overdueInvoices: Invoice[]
  studentsByGrade: GradeData[]
  recentStudents: Student[]
  collectionByMethod: CollectionMethod[]
  agingData: AgingData[]
  monthlyRevenue: MonthlyRevenue[]
  principalKPIs: KPIData[]
}

export default function Dashboard() {
  const { kpi, recentPayments, overdueInvoices, studentsByGrade, recentStudents, collectionByMethod, agingData, monthlyRevenue, principalKPIs } = usePage<Props>().props
  const { auth } = usePage().props as { auth: { user: { name: string, school?: { name: string } } } }

  const totalStudents = kpi.total_students
  const totalFees = kpi.total_revenue + kpi.total_pending
  const totalPaid = kpi.total_revenue
  const totalOutstanding = kpi.total_pending
  const collectionRate = kpi.collection_rate

  return (
    <AppLayout>
      <Head title="School Dashboard" />
      
      {/* School Banner */}
      <div 
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${schoolBannerBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="relative h-full flex items-center px-8">
          <div className="flex items-center gap-6">
            <img 
              src={schoolLogo} 
              alt="School Logo" 
              className="h-24 w-24 rounded-full bg-white p-2 shadow-lg"
            />
            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-tight">
                {auth?.user?.school?.name || 'School Dashboard'}
              </h1>
              <p className="text-lg mt-1 opacity-90">
                Welcome back, {auth?.user?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-8">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {principalKPIs.map((kpiData, index) => (
            <KPICard key={kpiData.title} data={kpiData} index={index} />
          ))}
        </div>

        {/* Collection Summary with Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Collection Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-sm font-bold">KES {totalPaid.toLocaleString()}</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Outstanding Fees</span>
                  <span className="text-sm font-bold">KES {totalOutstanding.toLocaleString()}</span>
                </div>
                <Progress value={(totalOutstanding / totalFees) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Collection Rate</span>
                  <span className="text-sm font-bold">{collectionRate}%</span>
                </div>
                <Progress value={collectionRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" fillOpacity={0} name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collection by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Collection by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={collectionByMethod}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: KES ${(entry.value / 1000).toFixed(0)}K`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {collectionByMethod.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Receivables Aging */}
          <Card>
            <CardHeader>
              <CardTitle>Receivables Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" name="Amount (KES)" />
                  <Bar dataKey="students" fill="hsl(var(--muted-foreground))" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.student_name}</TableCell>
                      <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status as 'completed' | 'pending' | 'failed'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Student Distribution and Recent Enrollments */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Students by Grade */}
          <Card>
            <CardHeader>
              <CardTitle>Students by Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentsByGrade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Enrollments</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Admission #</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudents.slice(0, 5).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell>{student.grade} - {student.class}</TableCell>
                      <TableCell className="text-muted-foreground">{student.enrolled_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Invoices */}
        {overdueInvoices.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Overdue Invoices
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.student_name}</TableCell>
                      <TableCell>KES {invoice.total_amount.toLocaleString()}</TableCell>
                      <TableCell>KES {invoice.balance.toLocaleString()}</TableCell>
                      <TableCell>{invoice.due_date}</TableCell>
                      <TableCell>
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {Math.abs(invoice.days_overdue)} days
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
