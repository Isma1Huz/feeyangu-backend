import { Head, usePage } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react'

interface KPI {
  total_students: number
  active_students: number
  inactive_students: number
  total_revenue: number
  total_pending: number
  total_overdue: number
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

interface Props {
  kpi: KPI
  recentPayments: Payment[]
  overdueInvoices: Invoice[]
  studentsByGrade: GradeData[]
  recentStudents: Student[]
}

export default function Dashboard() {
  const { kpi, recentPayments, overdueInvoices, studentsByGrade, recentStudents } = usePage<Props>().props
  const { auth } = usePage().props as { auth: { user: { name: string, school?: { name: string } } } }

  return (
    <>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.total_students}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.active_students} active, {kpi.inactive_students} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(kpi.total_revenue / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Collected payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(kpi.total_pending / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Outstanding balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Fees</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(kpi.total_overdue / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Students by Grade Chart */}
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
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
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
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
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

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.admission_number}</TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.enrolled_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
