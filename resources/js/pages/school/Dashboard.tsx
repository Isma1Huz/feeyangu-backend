import { Head, usePage } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import AppLayout from '@/layouts/AppLayout'
import KPICard from '@/components/KPICard'
import StatusBadge from '@/components/StatusBadge'
import type { KPIData } from '@/types'

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

  return (
    <AppLayout>
      <Head title="School Dashboard" />
      
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {auth?.user?.name}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {principalKPIs.map((kpiData, index) => (
            <KPICard key={index} data={kpiData} index={index} />
          ))}
        </div>

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
                    {collectionByMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
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
                        <StatusBadge status={payment.status as any} />
                      </TableCell>
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
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
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
                        <span className="text-red-600 font-semibold">
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
