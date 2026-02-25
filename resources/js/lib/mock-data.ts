import type { User, Student, Payment, KPIData, School, Notification, ChildCard, ChartDataPoint, Grade, GradeClass, FeeStructure, AcademicTerm, PaymentMethodConfig, Receipt } from '@/types';
import type { LearningArea, StudentPortfolio, PortfolioEvidence } from '@/types/portfolio.types';
import type { PTSession, PTSlot, PTBooking } from '@/types/ptMeeting.types';
import type { StudentHealthProfile, HealthUpdateRequest } from '@/types/health.types';
import type { Invoice, ReconciliationItem, BankTransaction, IntegrationConfig, ExpenseRecord } from '@/types/accountant.types';

export const MOCK_USERS: Record<string, User> = {
  admin: {
    id: '1',
    name: 'James Mwangi',
    email: 'admin@feeyangu.com',
    role: 'super_admin',
    avatar: '',
  },
  school: {
    id: '2',
    name: 'Sarah Wanjiku',
    email: 'sarah@greenacademy.co.ke',
    role: 'school_admin',
    schoolId: 's1',
    schoolName: 'Green Valley Academy',
  },
  parent: {
    id: '3',
    name: 'David Ochieng',
    email: 'david.ochieng@gmail.com',
    role: 'parent',
    schoolId: 's1',
    schoolName: 'Green Valley Academy',
  },
  accountant: {
    id: '5',
    name: 'Mary Njoroge',
    email: 'accountant@greenacademy.co.ke',
    role: 'accountant',
    schoolId: 's1',
    schoolName: 'Green Valley Academy',
  },
};

export const MOCK_STUDENTS: Student[] = [
  { id: 'st1', admissionNumber: 'GVA-2024-001', firstName: 'Amina', lastName: 'Hassan', grade: 'Grade 8', className: '8A', parentName: 'Fatima Hassan', parentEmail: 'fatima@gmail.com', status: 'active', totalFees: 45000, paidFees: 45000, balance: 0 },
  { id: 'st2', admissionNumber: 'GVA-2024-002', firstName: 'Brian', lastName: 'Kimani', grade: 'Grade 7', className: '7B', parentName: 'Peter Kimani', parentEmail: 'peter@gmail.com', status: 'active', totalFees: 42000, paidFees: 30000, balance: 12000 },
  { id: 'st3', admissionNumber: 'GVA-2024-003', firstName: 'Carol', lastName: 'Akinyi', grade: 'Grade 6', className: '6A', parentName: 'David Ochieng', parentEmail: 'david.ochieng@gmail.com', status: 'active', totalFees: 40000, paidFees: 40000, balance: 0 },
  { id: 'st4', admissionNumber: 'GVA-2024-004', firstName: 'Dennis', lastName: 'Muthoni', grade: 'Grade 8', className: '8B', parentName: 'Grace Muthoni', parentEmail: 'grace@gmail.com', status: 'active', totalFees: 45000, paidFees: 15000, balance: 30000 },
  { id: 'st5', admissionNumber: 'GVA-2024-005', firstName: 'Esther', lastName: 'Nyambura', grade: 'Grade 5', className: '5A', parentName: 'John Nyambura', parentEmail: 'john@gmail.com', status: 'inactive', totalFees: 38000, paidFees: 0, balance: 38000 },
  { id: 'st6', admissionNumber: 'GVA-2024-006', firstName: 'Felix', lastName: 'Otieno', grade: 'Grade 7', className: '7A', parentName: 'Mary Otieno', parentEmail: 'mary@gmail.com', status: 'active', totalFees: 42000, paidFees: 42000, balance: 0 },
  { id: 'st7', admissionNumber: 'GVA-2024-007', firstName: 'Gloria', lastName: 'Wambui', grade: 'Grade 6', className: '6B', parentName: 'Samuel Wambui', parentEmail: 'samuel@gmail.com', status: 'active', totalFees: 40000, paidFees: 25000, balance: 15000 },
  { id: 'st8', admissionNumber: 'GVA-2024-008', firstName: 'Henry', lastName: 'Kipchoge', grade: 'Grade 8', className: '8A', parentName: 'Ruth Kipchoge', parentEmail: 'ruth@gmail.com', status: 'active', totalFees: 45000, paidFees: 35000, balance: 10000 },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', date: '2026-02-14', studentName: 'Amina Hassan', studentId: 'st1', amount: 15000, method: 'mpesa', status: 'completed', reference: 'MPE-2026-001' },
  { id: 'p2', date: '2026-02-13', studentName: 'Brian Kimani', studentId: 'st2', amount: 10000, method: 'bank', status: 'completed', reference: 'BNK-2026-002' },
  { id: 'p3', date: '2026-02-13', studentName: 'Felix Otieno', studentId: 'st6', amount: 20000, method: 'mpesa', status: 'pending', reference: 'MPE-2026-003' },
  { id: 'p4', date: '2026-02-12', studentName: 'Henry Kipchoge', studentId: 'st8', amount: 5000, method: 'cash', status: 'completed', reference: 'CSH-2026-004' },
  { id: 'p5', date: '2026-02-11', studentName: 'Gloria Wambui', studentId: 'st7', amount: 12000, method: 'mpesa', status: 'failed', reference: 'MPE-2026-005' },
  { id: 'p6', date: '2026-02-10', studentName: 'Carol Akinyi', studentId: 'st3', amount: 20000, method: 'bank', status: 'completed', reference: 'BNK-2026-006' },
  { id: 'p7', date: '2026-02-09', studentName: 'Dennis Muthoni', studentId: 'st4', amount: 8000, method: 'mpesa', status: 'completed', reference: 'MPE-2026-007' },
  { id: 'p8', date: '2026-02-08', studentName: 'Amina Hassan', studentId: 'st1', amount: 15000, method: 'bank', status: 'completed', reference: 'BNK-2026-008' },
  { id: 'p9', date: '2026-02-07', studentName: 'Brian Kimani', studentId: 'st2', amount: 10000, method: 'cash', status: 'completed', reference: 'CSH-2026-009' },
  { id: 'p10', date: '2026-02-06', studentName: 'Esther Nyambura', studentId: 'st5', amount: 5000, method: 'mpesa', status: 'pending', reference: 'MPE-2026-010' },
];

export const SCHOOL_KPI: KPIData[] = [
  { title: 'Total Students', value: '342', change: '+12%', changeType: 'positive', icon: 'Users' },
  { title: 'Fees Collected', value: 'KES 2.4M', change: '+8.2%', changeType: 'positive', icon: 'DollarSign' },
  { title: 'Pending Fees', value: 'KES 680K', change: '-3.1%', changeType: 'positive', icon: 'Clock' },
  { title: 'Overdue Accounts', value: '23', change: '+5', changeType: 'negative', icon: 'AlertTriangle' },
];

export const ADMIN_KPI: KPIData[] = [
  { title: 'Total Schools', value: '156', change: '+18', changeType: 'positive', icon: 'Building2' },
  { title: 'Active Users', value: '4,280', change: '+340', changeType: 'positive', icon: 'Users' },
  { title: 'Monthly Revenue', value: 'KES 12.8M', change: '+15.3%', changeType: 'positive', icon: 'TrendingUp' },
  { title: 'Pending Approvals', value: '8', change: '-2', changeType: 'positive', icon: 'FileCheck' },
];

export const MONTHLY_REVENUE: ChartDataPoint[] = [
  { month: 'Sep', revenue: 1800000, target: 2000000 },
  { month: 'Oct', revenue: 2100000, target: 2000000 },
  { month: 'Nov', revenue: 1950000, target: 2200000 },
  { month: 'Dec', revenue: 2400000, target: 2200000 },
  { month: 'Jan', revenue: 2800000, target: 2500000 },
  { month: 'Feb', revenue: 2400000, target: 2500000 },
];

export const MOCK_SCHOOLS: School[] = [
  { id: 's1', name: 'Green Valley Academy', owner: 'Sarah Wanjiku', status: 'active', studentCount: 342, feesCollected: 2400000, location: 'Nairobi' },
  { id: 's2', name: 'Sunrise Primary School', owner: 'Tom Otieno', status: 'active', studentCount: 510, feesCollected: 3100000, location: 'Mombasa' },
  { id: 's3', name: 'Heritage Academy', owner: 'Ann Mutua', status: 'active', studentCount: 280, feesCollected: 1900000, location: 'Kisumu' },
  { id: 's4', name: 'Excel Junior School', owner: 'Mark Kamau', status: 'pending', studentCount: 0, feesCollected: 0, location: 'Nakuru' },
  { id: 's5', name: 'Bright Future Academy', owner: 'Lucy Njeri', status: 'suspended', studentCount: 150, feesCollected: 800000, location: 'Eldoret' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Payment Received', message: 'KES 15,000 received from Amina Hassan via M-Pesa', type: 'success', read: false, createdAt: '2026-02-14T10:30:00Z' },
  { id: 'n2', title: 'Overdue Alert', message: '5 students have overdue fee balances exceeding 30 days', type: 'warning', read: false, createdAt: '2026-02-14T09:00:00Z' },
  { id: 'n3', title: 'New Registration', message: 'A new parent account has been created', type: 'info', read: true, createdAt: '2026-02-13T14:00:00Z' },
];

export const PARENT_CHILDREN: ChildCard[] = [
  { studentId: 'st3', name: 'Carol Akinyi', grade: 'Grade 6', className: '6A', totalFees: 40000, paidFees: 40000, status: 'paid' },
  { studentId: 'st9', name: 'Kevin Ochieng', grade: 'Grade 3', className: '3B', totalFees: 35000, paidFees: 20000, status: 'partial' },
];

export const MOCK_GRADES: Grade[] = [
  { id: 'g1', name: 'Grade 5', studentCount: 64, classes: [
    { id: 'c1', name: '5A', gradeId: 'g1', gradeName: 'Grade 5', teacher: 'Mrs. Kamau', studentCount: 32 },
    { id: 'c2', name: '5B', gradeId: 'g1', gradeName: 'Grade 5', teacher: 'Mr. Njoroge', studentCount: 32 },
  ]},
  { id: 'g2', name: 'Grade 6', studentCount: 58, classes: [
    { id: 'c3', name: '6A', gradeId: 'g2', gradeName: 'Grade 6', teacher: 'Ms. Achieng', studentCount: 30 },
    { id: 'c4', name: '6B', gradeId: 'g2', gradeName: 'Grade 6', teacher: 'Mr. Wekesa', studentCount: 28 },
  ]},
  { id: 'g3', name: 'Grade 7', studentCount: 72, classes: [
    { id: 'c5', name: '7A', gradeId: 'g3', gradeName: 'Grade 7', teacher: 'Mrs. Odhiambo', studentCount: 36 },
    { id: 'c6', name: '7B', gradeId: 'g3', gradeName: 'Grade 7', teacher: 'Mr. Mwangi', studentCount: 36 },
  ]},
  { id: 'g4', name: 'Grade 8', studentCount: 70, classes: [
    { id: 'c7', name: '8A', gradeId: 'g4', gradeName: 'Grade 8', teacher: 'Mrs. Wanjiru', studentCount: 35 },
    { id: 'c8', name: '8B', gradeId: 'g4', gradeName: 'Grade 8', teacher: 'Mr. Kiplagat', studentCount: 35 },
  ]},
];

export const MOCK_FEE_STRUCTURES: FeeStructure[] = [
  { id: 'fs1', name: 'Grade 5 - Term 1 2026', grade: 'Grade 5', term: 'Term 1 2026', totalAmount: 38000, status: 'active', items: [
    { id: 'fi1', name: 'Tuition', amount: 25000 },
    { id: 'fi2', name: 'Lunch Program', amount: 8000 },
    { id: 'fi3', name: 'Activity Fee', amount: 3000 },
    { id: 'fi4', name: 'ICT Levy', amount: 2000 },
  ]},
  { id: 'fs2', name: 'Grade 6 - Term 1 2026', grade: 'Grade 6', term: 'Term 1 2026', totalAmount: 40000, status: 'active', items: [
    { id: 'fi5', name: 'Tuition', amount: 27000 },
    { id: 'fi6', name: 'Lunch Program', amount: 8000 },
    { id: 'fi7', name: 'Activity Fee', amount: 3000 },
    { id: 'fi8', name: 'ICT Levy', amount: 2000 },
  ]},
  { id: 'fs3', name: 'Grade 7 - Term 1 2026', grade: 'Grade 7', term: 'Term 1 2026', totalAmount: 42000, status: 'active', items: [
    { id: 'fi9', name: 'Tuition', amount: 28000 },
    { id: 'fi10', name: 'Lunch Program', amount: 8000 },
    { id: 'fi11', name: 'Activity Fee', amount: 3500 },
    { id: 'fi12', name: 'ICT Levy', amount: 2500 },
  ]},
  { id: 'fs4', name: 'Grade 8 - Term 1 2026', grade: 'Grade 8', term: 'Term 1 2026', totalAmount: 45000, status: 'active', items: [
    { id: 'fi13', name: 'Tuition', amount: 30000 },
    { id: 'fi14', name: 'Lunch Program', amount: 8000 },
    { id: 'fi15', name: 'Exam Fee', amount: 4000 },
    { id: 'fi16', name: 'ICT Levy', amount: 3000 },
  ]},
  { id: 'fs5', name: 'Grade 5 - Term 3 2025', grade: 'Grade 5', term: 'Term 3 2025', totalAmount: 36000, status: 'inactive', items: [
    { id: 'fi17', name: 'Tuition', amount: 24000 },
    { id: 'fi18', name: 'Lunch Program', amount: 7500 },
    { id: 'fi19', name: 'Activity Fee', amount: 2500 },
    { id: 'fi20', name: 'ICT Levy', amount: 2000 },
  ]},
];

export const MOCK_TERMS: AcademicTerm[] = [
  { id: 't1', name: 'Term 1 2026', year: 2026, startDate: '2026-01-06', endDate: '2026-04-03', status: 'active' },
  { id: 't2', name: 'Term 2 2026', year: 2026, startDate: '2026-05-04', endDate: '2026-08-07', status: 'upcoming' },
  { id: 't3', name: 'Term 3 2026', year: 2026, startDate: '2026-09-01', endDate: '2026-11-20', status: 'upcoming' },
  { id: 't4', name: 'Term 3 2025', year: 2025, startDate: '2025-09-01', endDate: '2025-11-21', status: 'completed' },
  { id: 't5', name: 'Term 2 2025', year: 2025, startDate: '2025-05-05', endDate: '2025-08-08', status: 'completed' },
];

export const MOCK_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'pm1', name: 'M-Pesa', type: 'mpesa', enabled: true, details: 'Paybill: 123456, Account: School Fees', order: 1 },
  { id: 'pm2', name: 'Bank Transfer', type: 'bank', enabled: true, details: 'Kenya Commercial Bank, Acc: 1234567890', order: 2 },
  { id: 'pm3', name: 'Cash Payment', type: 'cash', enabled: true, details: 'Pay at the school bursar office', order: 3 },
  { id: 'pm4', name: 'Card Payment', type: 'card', enabled: false, details: 'Visa/Mastercard via payment gateway', order: 4 },
];

export const MOCK_RECEIPTS: Receipt[] = [
  { id: 'r1', receiptNumber: 'RCT-2026-001', date: '2026-02-14', studentName: 'Amina Hassan', studentId: 'st1', amount: 15000, paymentMethod: 'M-Pesa', paymentReference: 'MPE-2026-001', items: [{ name: 'Tuition', amount: 10000 }, { name: 'Lunch Program', amount: 5000 }] },
  { id: 'r2', receiptNumber: 'RCT-2026-002', date: '2026-02-13', studentName: 'Brian Kimani', studentId: 'st2', amount: 10000, paymentMethod: 'Bank Transfer', paymentReference: 'BNK-2026-002', items: [{ name: 'Tuition', amount: 10000 }] },
  { id: 'r3', receiptNumber: 'RCT-2026-003', date: '2026-02-12', studentName: 'Henry Kipchoge', studentId: 'st8', amount: 5000, paymentMethod: 'Cash', paymentReference: 'CSH-2026-004', items: [{ name: 'Activity Fee', amount: 3000 }, { name: 'ICT Levy', amount: 2000 }] },
  { id: 'r4', receiptNumber: 'RCT-2026-004', date: '2026-02-10', studentName: 'Carol Akinyi', studentId: 'st3', amount: 20000, paymentMethod: 'Bank Transfer', paymentReference: 'BNK-2026-006', items: [{ name: 'Tuition', amount: 15000 }, { name: 'Lunch Program', amount: 5000 }] },
  { id: 'r5', receiptNumber: 'RCT-2026-005', date: '2026-02-09', studentName: 'Dennis Muthoni', studentId: 'st4', amount: 8000, paymentMethod: 'M-Pesa', paymentReference: 'MPE-2026-007', items: [{ name: 'Tuition', amount: 8000 }] },
  { id: 'r6', receiptNumber: 'RCT-2026-006', date: '2026-02-08', studentName: 'Carol Akinyi', studentId: 'st3', amount: 20000, paymentMethod: 'M-Pesa', paymentReference: 'MPE-2026-011', items: [{ name: 'Tuition', amount: 12000 }, { name: 'Lunch Program', amount: 8000 }] },
  { id: 'r7', receiptNumber: 'RCT-2026-007', date: '2026-02-05', studentName: 'Kevin Ochieng', studentId: 'st9', amount: 10000, paymentMethod: 'Bank Transfer', paymentReference: 'BNK-2026-012', items: [{ name: 'Tuition', amount: 7000 }, { name: 'Activity Fee', amount: 3000 }] },
  { id: 'r8', receiptNumber: 'RCT-2026-008', date: '2026-02-03', studentName: 'Kevin Ochieng', studentId: 'st9', amount: 10000, paymentMethod: 'M-Pesa', paymentReference: 'MPE-2026-013', items: [{ name: 'Tuition', amount: 10000 }] },
];

export const PARENT_FEE_ITEMS: Record<string, { name: string; amount: number; paid: number }[]> = {
  st3: [
    { name: 'Tuition', amount: 27000, paid: 27000 },
    { name: 'Lunch Program', amount: 8000, paid: 8000 },
    { name: 'Activity Fee', amount: 3000, paid: 3000 },
    { name: 'ICT Levy', amount: 2000, paid: 2000 },
  ],
  st9: [
    { name: 'Tuition', amount: 22000, paid: 12000 },
    { name: 'Lunch Program', amount: 7000, paid: 5000 },
    { name: 'Activity Fee', amount: 3000, paid: 3000 },
    { name: 'ICT Levy', amount: 3000, paid: 0 },
  ],
};

export const MOCK_ADMIN_USERS: { id: string; name: string; email: string; role: string; school: string; status: 'active' | 'inactive'; lastLogin: string }[] = [
  { id: 'u1', name: 'James Mwangi', email: 'admin@feeyangu.com', role: 'Super Admin', school: '—', status: 'active', lastLogin: '2026-02-16' },
  { id: 'u2', name: 'Sarah Wanjiku', email: 'sarah@greenacademy.co.ke', role: 'School Admin', school: 'Green Valley Academy', status: 'active', lastLogin: '2026-02-15' },
  { id: 'u3', name: 'Tom Otieno', email: 'tom@sunrise.co.ke', role: 'School Admin', school: 'Sunrise Primary School', status: 'active', lastLogin: '2026-02-14' },
  { id: 'u4', name: 'David Ochieng', email: 'david.ochieng@gmail.com', role: 'Parent', school: 'Green Valley Academy', status: 'active', lastLogin: '2026-02-13' },
  { id: 'u5', name: 'Fatima Hassan', email: 'fatima@gmail.com', role: 'Parent', school: 'Green Valley Academy', status: 'active', lastLogin: '2026-02-12' },
  { id: 'u6', name: 'Ann Mutua', email: 'ann@heritage.co.ke', role: 'School Admin', school: 'Heritage Academy', status: 'active', lastLogin: '2026-02-11' },
  { id: 'u7', name: 'Mark Kamau', email: 'mark@excel.co.ke', role: 'School Admin', school: 'Excel Junior School', status: 'inactive', lastLogin: '2026-01-20' },
  { id: 'u8', name: 'Lucy Njeri', email: 'lucy@brightfuture.co.ke', role: 'School Admin', school: 'Bright Future Academy', status: 'inactive', lastLogin: '2026-01-10' },
];

// ==================== TEACHER DATA ====================
export const TEACHER_CLASSES = [
  { id: 'tc1', name: '6A', grade: 'Grade 6', studentCount: 30, avgGPA: 3.2, attendanceRate: 92, portfolioCompletion: 68 },
  { id: 'tc2', name: '7A', grade: 'Grade 7', studentCount: 36, avgGPA: 2.9, attendanceRate: 88, portfolioCompletion: 55 },
  { id: 'tc3', name: '8A', grade: 'Grade 8', studentCount: 35, avgGPA: 3.5, attendanceRate: 95, portfolioCompletion: 72 },
];

export const TEACHER_KPI: KPIData[] = [
  { title: 'My Classes', value: '3', change: '', changeType: 'neutral', icon: 'Layers' },
  { title: 'My Students', value: '101', change: '+4', changeType: 'positive', icon: 'Users' },
  { title: 'Assessments Submitted', value: '12', change: '+3', changeType: 'positive', icon: 'FileText' },
  { title: 'Attendance Rate', value: '91.7%', change: '+1.2%', changeType: 'positive', icon: 'Calendar' },
];

export const TEACHER_SCHEDULE = [
  { time: '08:00 - 08:40', subject: 'Mathematics', class: '6A', room: 'Room 3' },
  { time: '08:45 - 09:25', subject: 'English', class: '7A', room: 'Room 5' },
  { time: '09:30 - 10:10', subject: 'Science', class: '8A', room: 'Lab 1' },
  { time: '10:30 - 11:10', subject: 'Mathematics', class: '7A', room: 'Room 5' },
  { time: '11:15 - 11:55', subject: 'Science', class: '6A', room: 'Lab 1' },
  { time: '14:00 - 14:40', subject: 'Mathematics', class: '8A', room: 'Room 3' },
];

export const TEACHER_ATTENDANCE_TREND = [
  { day: 'Mon', rate: 94 }, { day: 'Tue', rate: 91 }, { day: 'Wed', rate: 89 },
  { day: 'Thu', rate: 93 }, { day: 'Fri', rate: 90 },
];

export const TEACHER_GRADE_DISTRIBUTION = [
  { grade: 'EE', count: 18, color: 'hsl(142, 72%, 35%)' },
  { grade: 'ME', count: 42, color: 'hsl(200, 72%, 45%)' },
  { grade: 'AE', count: 28, color: 'hsl(45, 90%, 50%)' },
  { grade: 'BE', count: 13, color: 'hsl(0, 72%, 45%)' },
];

// ==================== PORTFOLIO DATA ====================
export const MOCK_LEARNING_AREAS: LearningArea[] = [
  {
    id: 'la1', name: 'Literacy & Communication', code: 'LIT', gradeIds: ['g1', 'g2', 'g3', 'g4'],
    strands: [
      { id: 'ls1', learningAreaId: 'la1', name: 'Listening & Speaking', requiredEvidenceCount: 3, subStrands: [
        { id: 'lss1', strandId: 'ls1', name: 'Oral Communication' },
        { id: 'lss2', strandId: 'ls1', name: 'Listening Comprehension' },
      ]},
      { id: 'ls2', learningAreaId: 'la1', name: 'Reading', requiredEvidenceCount: 3, subStrands: [
        { id: 'lss3', strandId: 'ls2', name: 'Fluency' },
        { id: 'lss4', strandId: 'ls2', name: 'Comprehension' },
      ]},
      { id: 'ls3', learningAreaId: 'la1', name: 'Writing', requiredEvidenceCount: 2, subStrands: [
        { id: 'lss5', strandId: 'ls3', name: 'Creative Writing' },
        { id: 'lss6', strandId: 'ls3', name: 'Handwriting' },
      ]},
    ],
  },
  {
    id: 'la2', name: 'Numeracy & Mathematics', code: 'NUM', gradeIds: ['g1', 'g2', 'g3', 'g4'],
    strands: [
      { id: 'ns1', learningAreaId: 'la2', name: 'Numbers', requiredEvidenceCount: 3, subStrands: [
        { id: 'nss1', strandId: 'ns1', name: 'Whole Numbers' },
        { id: 'nss2', strandId: 'ns1', name: 'Fractions' },
      ]},
      { id: 'ns2', learningAreaId: 'la2', name: 'Measurement', requiredEvidenceCount: 2, subStrands: [
        { id: 'nss3', strandId: 'ns2', name: 'Length & Area' },
      ]},
    ],
  },
  {
    id: 'la3', name: 'Environmental Activities', code: 'ENV', gradeIds: ['g1', 'g2'],
    strands: [
      { id: 'es1', learningAreaId: 'la3', name: 'Living Things', requiredEvidenceCount: 2, subStrands: [
        { id: 'ess1', strandId: 'es1', name: 'Plants' },
        { id: 'ess2', strandId: 'es1', name: 'Animals' },
      ]},
      { id: 'es2', learningAreaId: 'la3', name: 'Weather & Climate', requiredEvidenceCount: 2, subStrands: [
        { id: 'ess3', strandId: 'es2', name: 'Seasons' },
      ]},
    ],
  },
];

export const MOCK_PORTFOLIO_EVIDENCE: PortfolioEvidence[] = [
  { id: 'pe1', studentId: 'st1', learningAreaId: 'la1', strandId: 'ls1', subStrandId: 'lss1', termId: 't1', title: 'Oral Presentation — My Family', description: 'Student presented a 3-minute talk about their family', evidenceType: 'photo', fileUrls: ['/placeholder.svg'], thumbnailUrl: '/placeholder.svg', teacherObservation: 'Amina spoke clearly with good eye contact. She used descriptive language effectively.', cbcRating: 'EE', dateOfActivity: '2026-01-20', uploadedBy: '4', visibility: 'published', createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: 'pe2', studentId: 'st1', learningAreaId: 'la1', strandId: 'ls2', subStrandId: 'lss3', termId: 't1', title: 'Reading Fluency Assessment', description: 'Reading passage with comprehension questions', evidenceType: 'document', fileUrls: ['/placeholder.svg'], thumbnailUrl: '/placeholder.svg', teacherObservation: 'Read at grade level with minimal errors. Good expression.', cbcRating: 'ME', dateOfActivity: '2026-02-01', uploadedBy: '4', visibility: 'published', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
  { id: 'pe3', studentId: 'st1', learningAreaId: 'la2', strandId: 'ns1', subStrandId: 'nss1', termId: 't1', title: 'Number Patterns Worksheet', description: 'Completed worksheet on identifying and extending number patterns', evidenceType: 'written_work', fileUrls: ['/placeholder.svg'], thumbnailUrl: '/placeholder.svg', teacherObservation: 'Correctly identified all patterns. Shows strong analytical thinking.', cbcRating: 'EE', dateOfActivity: '2026-01-25', uploadedBy: '4', visibility: 'published', createdAt: '2026-01-25T10:00:00Z', updatedAt: '2026-01-25T10:00:00Z' },
  { id: 'pe4', studentId: 'st2', learningAreaId: 'la1', strandId: 'ls3', subStrandId: 'lss5', termId: 't1', title: 'Creative Story — The Lost Puppy', description: 'Short story written during creative writing class', evidenceType: 'written_work', fileUrls: ['/placeholder.svg'], thumbnailUrl: '/placeholder.svg', teacherObservation: 'Good imagination but needs work on sentence structure.', cbcRating: 'AE', dateOfActivity: '2026-02-05', uploadedBy: '4', visibility: 'published', createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-02-05T10:00:00Z' },
  { id: 'pe5', studentId: 'st2', learningAreaId: 'la2', strandId: 'ns2', subStrandId: 'nss3', termId: 't1', title: 'Measuring Objects Around School', description: 'Practical activity measuring classroom objects', evidenceType: 'photo', fileUrls: ['/placeholder.svg'], thumbnailUrl: '/placeholder.svg', teacherObservation: 'Measured accurately. Recorded results in a neat table.', cbcRating: 'ME', dateOfActivity: '2026-02-10', uploadedBy: '4', visibility: 'draft', createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-10T10:00:00Z' },
  { id: 'pe6', studentId: 'st3', learningAreaId: 'la3', strandId: 'es1', subStrandId: 'ess1', termId: 't1', title: 'Plant Growth Diary', description: 'Two-week observation diary of bean plant growth', evidenceType: 'drawing', fileUrls: ['/placeholder.svg'], thumbnailUrl: '/placeholder.svg', teacherObservation: 'Excellent observation skills. Drew detailed diagrams with labels.', cbcRating: 'EE', dateOfActivity: '2026-01-15', uploadedBy: '4', visibility: 'published', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
];

export const MOCK_STUDENT_PORTFOLIOS: StudentPortfolio[] = [
  { id: 'sp1', studentId: 'st1', termId: 't1', completionPercentage: 75, evidenceItems: MOCK_PORTFOLIO_EVIDENCE.filter(e => e.studentId === 'st1'), learningAreaSummaries: [
    { learningAreaId: 'la1', completedStrands: 2, totalStrands: 3, evidenceCount: 2, overallRating: 'ME' },
    { learningAreaId: 'la2', completedStrands: 1, totalStrands: 2, evidenceCount: 1, overallRating: 'EE' },
  ], lastUpdated: '2026-02-01T10:00:00Z' },
  { id: 'sp2', studentId: 'st2', termId: 't1', completionPercentage: 45, evidenceItems: MOCK_PORTFOLIO_EVIDENCE.filter(e => e.studentId === 'st2'), learningAreaSummaries: [
    { learningAreaId: 'la1', completedStrands: 1, totalStrands: 3, evidenceCount: 1, overallRating: 'AE' },
    { learningAreaId: 'la2', completedStrands: 1, totalStrands: 2, evidenceCount: 1, overallRating: 'ME' },
  ], lastUpdated: '2026-02-10T10:00:00Z' },
  { id: 'sp3', studentId: 'st3', termId: 't1', completionPercentage: 30, evidenceItems: MOCK_PORTFOLIO_EVIDENCE.filter(e => e.studentId === 'st3'), learningAreaSummaries: [
    { learningAreaId: 'la3', completedStrands: 1, totalStrands: 2, evidenceCount: 1, overallRating: 'EE' },
  ], lastUpdated: '2026-01-15T10:00:00Z' },
];

// ==================== PT MEETING DATA ====================
export const MOCK_PT_SESSIONS: PTSession[] = [
  { id: 'pts1', schoolId: 's1', name: 'Term 2 Parent-Teacher Day', dates: ['2026-05-15', '2026-05-16'], slotDurationMinutes: 15, breakBetweenSlotsMinutes: 5, startTime: '08:00', endTime: '16:00', teacherIds: ['4', 'u9', 'u10'], venue: 'School Hall & Classrooms', parentInstructions: 'Please arrive 5 minutes before your slot. Bring your child\'s report card from Term 1.', status: 'open', bookingDeadline: '2026-05-13', createdAt: '2026-04-01T10:00:00Z' },
];

export const MOCK_PT_SLOTS: PTSlot[] = [
  { id: 'slot1', sessionId: 'pts1', teacherId: '4', date: '2026-05-15', startTime: '08:00', endTime: '08:15', status: 'booked' },
  { id: 'slot2', sessionId: 'pts1', teacherId: '4', date: '2026-05-15', startTime: '08:20', endTime: '08:35', status: 'available' },
  { id: 'slot3', sessionId: 'pts1', teacherId: '4', date: '2026-05-15', startTime: '08:40', endTime: '08:55', status: 'available' },
  { id: 'slot4', sessionId: 'pts1', teacherId: '4', date: '2026-05-15', startTime: '09:00', endTime: '09:15', status: 'blocked', blockedReason: 'Staff meeting' },
  { id: 'slot5', sessionId: 'pts1', teacherId: '4', date: '2026-05-15', startTime: '09:20', endTime: '09:35', status: 'booked' },
  { id: 'slot6', sessionId: 'pts1', teacherId: '4', date: '2026-05-16', startTime: '08:00', endTime: '08:15', status: 'available' },
  { id: 'slot7', sessionId: 'pts1', teacherId: '4', date: '2026-05-16', startTime: '08:20', endTime: '08:35', status: 'available' },
  { id: 'slot8', sessionId: 'pts1', teacherId: '4', date: '2026-05-16', startTime: '08:40', endTime: '08:55', status: 'completed' },
];

export const MOCK_PT_BOOKINGS: PTBooking[] = [
  { id: 'ptb1', slotId: 'slot1', sessionId: 'pts1', parentId: '3', studentId: 'st3', teacherId: '4', status: 'confirmed', parentMessage: 'Would like to discuss Carol\'s math performance.', teacherNotes: '', rescheduleReason: '', bookedAt: '2026-04-20T10:00:00Z', confirmedAt: '2026-04-21T09:00:00Z', completedAt: '' },
  { id: 'ptb2', slotId: 'slot5', sessionId: 'pts1', parentId: 'p5', studentId: 'st1', teacherId: '4', status: 'pending', parentMessage: 'Concerned about Amina\'s attendance this term.', teacherNotes: '', rescheduleReason: '', bookedAt: '2026-04-22T14:00:00Z', confirmedAt: '', completedAt: '' },
  { id: 'ptb3', slotId: 'slot8', sessionId: 'pts1', parentId: 'p6', studentId: 'st8', teacherId: '4', status: 'completed', parentMessage: '', teacherNotes: 'Discussed Henry\'s progress in Science. Parent satisfied with improvement.', rescheduleReason: '', bookedAt: '2026-04-18T11:00:00Z', confirmedAt: '2026-04-19T08:00:00Z', completedAt: '2026-05-16T09:00:00Z' },
];

// ==================== HEALTH DATA ====================
export const MOCK_HEALTH_PROFILES: StudentHealthProfile[] = [
  {
    id: 'hp1', studentId: 'st1', bloodType: 'O+', height: 142, weight: 38, visionNotes: 'Normal', hearingNotes: 'Normal', generalHealthStatus: 'Good with managed conditions',
    conditions: [
      { id: 'mc1', studentId: 'st1', name: 'Asthma', type: 'chronic', severity: 'moderate', diagnosedDate: '2022-03-15', treatingDoctor: 'Dr. Kamau, Nairobi Hospital', managementNotes: 'Uses inhaler (Ventolin) as needed. Avoid dusty environments.', emergencyActionPlan: '1. Sit student upright. 2. Give 2 puffs of blue inhaler. 3. Wait 5 minutes. 4. If no improvement, give 2 more puffs. 5. Call parent and ambulance if severe.', status: 'active', documents: [], createdAt: '2024-01-10T10:00:00Z' },
    ],
    allergies: [
      { id: 'al1', studentId: 'st1', allergen: 'Peanuts', allergenCategory: 'food', reactionType: 'Anaphylaxis', severity: 'life_threatening', emergencyProtocol: 'Administer EpiPen immediately. Call ambulance (999). Keep student lying down with legs raised. Do NOT give food or drink.', epiPenAvailable: true, epiPenLocation: 'School bag, front pocket + School nurse office', createdAt: '2024-01-10T10:00:00Z' },
    ],
    vaccinations: [
      { id: 'v1', studentId: 'st1', vaccineName: 'BCG', dateAdministered: '2013-09-05', administeredBy: 'Kenyatta National Hospital', nextDueDate: '', batchNumber: 'BCG-2013-K45', certificateUrl: '', status: 'up_to_date' },
      { id: 'v2', studentId: 'st1', vaccineName: 'Polio (OPV)', dateAdministered: '2013-11-10', administeredBy: 'Kenyatta National Hospital', nextDueDate: '', batchNumber: 'OPV-2013-78', certificateUrl: '', status: 'up_to_date' },
      { id: 'v3', studentId: 'st1', vaccineName: 'MMR', dateAdministered: '2014-09-15', administeredBy: 'Nairobi Hospital', nextDueDate: '', batchNumber: 'MMR-2014-22', certificateUrl: '', status: 'up_to_date' },
      { id: 'v4', studentId: 'st1', vaccineName: 'Hepatitis B', dateAdministered: '2013-09-05', administeredBy: 'Kenyatta National Hospital', nextDueDate: '', batchNumber: 'HB-2013-11', certificateUrl: '', status: 'up_to_date' },
    ],
    incidents: [
      { id: 'hi1', studentId: 'st1', incidentDate: '2026-01-28', incidentTime: '10:30', type: 'allergic_reaction', description: 'Student accidentally ate a biscuit containing peanuts during break time. Developed hives on arms and face within 5 minutes.', actionTaken: 'EpiPen administered by school nurse. Student kept calm and monitored. Ambulance called as precaution. Student recovered fully within 30 minutes.', reportedBy: 'Mrs. Odhiambo (Class Teacher)', parentNotified: true, parentNotifiedAt: '2026-01-28T10:35:00Z', externalMedicalHelp: true, externalMedicalDetails: 'Ambulance arrived, paramedics checked vitals. Recommended hospital follow-up.', photoUrls: [], followUpRequired: true, followUpDate: '2026-02-04', followUpCompleted: true, followUpNotes: 'Parent confirmed student visited hospital. Doctor advised continued EpiPen carry.', createdAt: '2026-01-28T10:45:00Z' },
    ],
    emergencyContacts: [
      { id: 'ec1', studentId: 'st1', fullName: 'Fatima Hassan', relationship: 'Mother', primaryPhone: '+254 712 345 678', secondaryPhone: '+254 733 456 789', priority: 1, notes: '' },
      { id: 'ec2', studentId: 'st1', fullName: 'Ali Hassan', relationship: 'Father', primaryPhone: '+254 722 567 890', secondaryPhone: '', priority: 2, notes: 'Available after 5pm on weekdays' },
    ],
    documents: [], lastUpdatedBy: '2', lastUpdatedAt: '2026-01-28T11:00:00Z',
  },
  {
    id: 'hp2', studentId: 'st2', bloodType: 'A+', height: 138, weight: 35, visionNotes: 'Normal', hearingNotes: 'Normal', generalHealthStatus: 'Managed chronic condition',
    conditions: [
      { id: 'mc2', studentId: 'st2', name: 'Type 1 Diabetes', type: 'chronic', severity: 'severe', diagnosedDate: '2021-06-20', treatingDoctor: 'Dr. Njuguna, Aga Khan Hospital', managementNotes: 'Insulin pump worn at all times. Blood sugar checks before meals and PE. Carries glucose tablets.', emergencyActionPlan: '1. If hypoglycaemic (shaky, confused): Give glucose tablets or juice immediately. 2. If unconscious: Place in recovery position, call ambulance. 3. Do NOT give insulin. 4. Call parent immediately.', status: 'active', documents: [], createdAt: '2023-01-15T10:00:00Z' },
    ],
    allergies: [],
    vaccinations: [
      { id: 'v5', studentId: 'st2', vaccineName: 'BCG', dateAdministered: '2014-07-12', administeredBy: 'Aga Khan Hospital', nextDueDate: '', batchNumber: 'BCG-2014-M21', certificateUrl: '', status: 'up_to_date' },
      { id: 'v6', studentId: 'st2', vaccineName: 'MMR', dateAdministered: '2015-07-20', administeredBy: 'Aga Khan Hospital', nextDueDate: '', batchNumber: 'MMR-2015-67', certificateUrl: '', status: 'up_to_date' },
    ],
    incidents: [],
    emergencyContacts: [
      { id: 'ec3', studentId: 'st2', fullName: 'Peter Kimani', relationship: 'Father', primaryPhone: '+254 711 222 333', secondaryPhone: '', priority: 1, notes: '' },
      { id: 'ec4', studentId: 'st2', fullName: 'Margaret Kimani', relationship: 'Mother', primaryPhone: '+254 722 333 444', secondaryPhone: '+254 700 555 666', priority: 2, notes: '' },
    ],
    documents: [], lastUpdatedBy: '2', lastUpdatedAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'hp3', studentId: 'st3', bloodType: 'B+', height: 135, weight: 33, visionNotes: 'Normal', hearingNotes: 'Normal', generalHealthStatus: 'Excellent',
    conditions: [],
    allergies: [],
    vaccinations: [
      { id: 'v7', studentId: 'st3', vaccineName: 'BCG', dateAdministered: '2015-04-10', administeredBy: 'Nairobi Women\'s Hospital', nextDueDate: '', batchNumber: 'BCG-2015-A09', certificateUrl: '', status: 'up_to_date' },
      { id: 'v8', studentId: 'st3', vaccineName: 'Polio (OPV)', dateAdministered: '2015-06-15', administeredBy: 'Nairobi Women\'s Hospital', nextDueDate: '', batchNumber: 'OPV-2015-12', certificateUrl: '', status: 'up_to_date' },
      { id: 'v9', studentId: 'st3', vaccineName: 'MMR', dateAdministered: '2016-04-20', administeredBy: 'Nairobi Women\'s Hospital', nextDueDate: '', batchNumber: 'MMR-2016-45', certificateUrl: '', status: 'up_to_date' },
      { id: 'v10', studentId: 'st3', vaccineName: 'Hepatitis B', dateAdministered: '2015-04-10', administeredBy: 'Nairobi Women\'s Hospital', nextDueDate: '', batchNumber: 'HB-2015-33', certificateUrl: '', status: 'up_to_date' },
      { id: 'v11', studentId: 'st3', vaccineName: 'Covid-19', dateAdministered: '2025-08-20', administeredBy: 'Green Valley Academy Health Drive', nextDueDate: '', batchNumber: 'COV-2025-KE', certificateUrl: '', status: 'up_to_date' },
    ],
    incidents: [],
    emergencyContacts: [
      { id: 'ec5', studentId: 'st3', fullName: 'David Ochieng', relationship: 'Father', primaryPhone: '+254 710 111 222', secondaryPhone: '', priority: 1, notes: '' },
      { id: 'ec6', studentId: 'st3', fullName: 'Grace Akinyi', relationship: 'Mother', primaryPhone: '+254 723 444 555', secondaryPhone: '', priority: 2, notes: '' },
    ],
    documents: [], lastUpdatedBy: '2', lastUpdatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'hp4', studentId: 'st4', bloodType: 'AB-', height: 145, weight: 40, visionNotes: 'Normal', hearingNotes: 'Mild hearing impairment in left ear',
    generalHealthStatus: 'Stable with mild disability',
    conditions: [
      { id: 'mc3', studentId: 'st4', name: 'Mild Hearing Impairment (Left Ear)', type: 'disability', severity: 'mild', diagnosedDate: '2020-09-10', treatingDoctor: 'Dr. Otieno, ENT Specialist, KNH', managementNotes: 'Seat student at front of class, left side. Speak clearly facing student. Uses hearing aid occasionally.', emergencyActionPlan: '', status: 'active', documents: [], createdAt: '2023-02-01T10:00:00Z' },
    ],
    allergies: [],
    vaccinations: [
      { id: 'v12', studentId: 'st4', vaccineName: 'BCG', dateAdministered: '2013-05-20', administeredBy: 'Kenyatta National Hospital', nextDueDate: '', batchNumber: 'BCG-2013-N12', certificateUrl: '', status: 'up_to_date' },
      { id: 'v13', studentId: 'st4', vaccineName: 'Covid-19', dateAdministered: '', administeredBy: '', nextDueDate: '2026-03-01', batchNumber: '', certificateUrl: '', status: 'overdue' },
    ],
    incidents: [
      { id: 'hi2', studentId: 'st4', incidentDate: '2025-11-12', incidentTime: '13:15', type: 'injury', description: 'Student fell during lunch break while running. Scraped left knee and palm.', actionTaken: 'Wound cleaned with antiseptic. Bandaged. Ice applied for swelling. Student rested in sick bay for 20 minutes.', reportedBy: 'Mr. Kiplagat (Duty Teacher)', parentNotified: true, parentNotifiedAt: '2025-11-12T13:30:00Z', externalMedicalHelp: false, externalMedicalDetails: '', photoUrls: [], followUpRequired: false, followUpDate: '', followUpCompleted: false, followUpNotes: '', createdAt: '2025-11-12T13:20:00Z' },
    ],
    emergencyContacts: [
      { id: 'ec7', studentId: 'st4', fullName: 'Grace Muthoni', relationship: 'Mother', primaryPhone: '+254 712 777 888', secondaryPhone: '', priority: 1, notes: '' },
      { id: 'ec8', studentId: 'st4', fullName: 'James Muthoni', relationship: 'Uncle', primaryPhone: '+254 700 999 000', secondaryPhone: '', priority: 2, notes: 'Guardian, available anytime' },
    ],
    documents: [], lastUpdatedBy: '2', lastUpdatedAt: '2025-11-12T14:00:00Z',
  },
  {
    id: 'hp5', studentId: 'st6', bloodType: 'O-', height: 140, weight: 37, visionNotes: 'Normal', hearingNotes: 'Normal', generalHealthStatus: 'Good with allergy alert',
    conditions: [],
    allergies: [
      { id: 'al2', studentId: 'st6', allergen: 'Bee Stings', allergenCategory: 'insect', reactionType: 'Severe swelling, difficulty breathing', severity: 'severe', emergencyProtocol: '1. Remove stinger if visible. 2. Apply ice. 3. Administer antihistamine (Cetirizine in nurse office). 4. If breathing difficulty: call ambulance immediately. 5. Notify parent.', epiPenAvailable: false, epiPenLocation: '', createdAt: '2024-03-01T10:00:00Z' },
    ],
    vaccinations: [
      { id: 'v14', studentId: 'st6', vaccineName: 'BCG', dateAdministered: '2014-01-15', administeredBy: 'Mombasa Hospital', nextDueDate: '', batchNumber: 'BCG-2014-C33', certificateUrl: '', status: 'up_to_date' },
      { id: 'v15', studentId: 'st6', vaccineName: 'Hepatitis B', dateAdministered: '', administeredBy: '', nextDueDate: '2026-02-28', batchNumber: '', certificateUrl: '', status: 'due_soon' },
    ],
    incidents: [],
    emergencyContacts: [
      { id: 'ec9', studentId: 'st6', fullName: 'Mary Otieno', relationship: 'Mother', primaryPhone: '+254 715 666 777', secondaryPhone: '', priority: 1, notes: '' },
      { id: 'ec10', studentId: 'st6', fullName: 'Joseph Otieno', relationship: 'Father', primaryPhone: '+254 726 888 999', secondaryPhone: '', priority: 2, notes: '' },
    ],
    documents: [], lastUpdatedBy: '2', lastUpdatedAt: '2026-01-05T10:00:00Z',
  },
];

export const MOCK_HEALTH_UPDATE_REQUESTS: HealthUpdateRequest[] = [
  { id: 'hur1', studentId: 'st1', parentId: '3', updateDescription: 'Amina has been prescribed a new inhaler (Seretide) by Dr. Kamau as of February 2026. The old Ventolin should be replaced.', status: 'pending', submittedAt: '2026-02-12T15:00:00Z', reviewedBy: '', reviewedAt: '', reviewNotes: '' },
];

// ==================== ACCOUNTANT DATA ====================
export const ACCOUNTANT_KPI = {
  dailyCollections: 'KES 185,000',
  pendingReconciliation: 14,
  unmatchedTransactions: 6,
  outstandingInvoices: 47,
  paymentSuccessRate: '94.2%',
  pettyCashBalance: 'KES 23,500',
};

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2026-001', studentId: 'st1', studentName: 'Amina Hassan', grade: 'Grade 8', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 30000 }, { name: 'Lunch Program', amount: 8000 }, { name: 'ICT Levy', amount: 3000 }], totalAmount: 41000, paidAmount: 41000, balance: 0, status: 'paid', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'email' },
  { id: 'inv2', invoiceNumber: 'INV-2026-002', studentId: 'st2', studentName: 'Brian Kimani', grade: 'Grade 7', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 28000 }, { name: 'Lunch Program', amount: 8000 }, { name: 'Activity Fee', amount: 3500 }], totalAmount: 39500, paidAmount: 20000, balance: 19500, status: 'partial', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'both' },
  { id: 'inv3', invoiceNumber: 'INV-2026-003', studentId: 'st4', studentName: 'Dennis Muthoni', grade: 'Grade 8', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 30000 }, { name: 'Lunch Program', amount: 8000 }, { name: 'Exam Fee', amount: 4000 }], totalAmount: 42000, paidAmount: 15000, balance: 27000, status: 'overdue', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'sms' },
  { id: 'inv4', invoiceNumber: 'INV-2026-004', studentId: 'st5', studentName: 'Esther Nyambura', grade: 'Grade 5', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 25000 }, { name: 'Lunch Program', amount: 8000 }], totalAmount: 33000, paidAmount: 0, balance: 33000, status: 'overdue', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'none' },
  { id: 'inv5', invoiceNumber: 'INV-2026-005', studentId: 'st3', studentName: 'Carol Akinyi', grade: 'Grade 6', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 27000 }, { name: 'Lunch Program', amount: 8000 }, { name: 'Activity Fee', amount: 3000 }], totalAmount: 38000, paidAmount: 38000, balance: 0, status: 'paid', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'email' },
  { id: 'inv6', invoiceNumber: 'INV-2026-006', studentId: 'st7', studentName: 'Gloria Wambui', grade: 'Grade 6', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 27000 }, { name: 'Lunch Program', amount: 8000 }], totalAmount: 35000, paidAmount: 20000, balance: 15000, status: 'partial', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'email' },
  { id: 'inv7', invoiceNumber: 'INV-2026-007', studentId: 'st6', studentName: 'Felix Otieno', grade: 'Grade 7', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 28000 }, { name: 'Lunch Program', amount: 8000 }], totalAmount: 36000, paidAmount: 36000, balance: 0, status: 'paid', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'both' },
  { id: 'inv8', invoiceNumber: 'INV-2026-008', studentId: 'st8', studentName: 'Henry Kipchoge', grade: 'Grade 8', term: 'Term 1 2026', items: [{ name: 'Tuition', amount: 30000 }, { name: 'Lunch Program', amount: 8000 }], totalAmount: 38000, paidAmount: 35000, balance: 3000, status: 'partial', dueDate: '2026-01-20', issuedDate: '2026-01-06', sentVia: 'email' },
];

export const MOCK_BANK_TRANSACTIONS: BankTransaction[] = [
  { id: 'bt1', date: '2026-02-14', description: 'MPESA-Amina Hassan-SchoolFees', reference: 'MPE-2026-001', amount: 15000, balance: 2415000 },
  { id: 'bt2', date: '2026-02-13', description: 'EFT-Peter Kimani-Fees', reference: 'BNK-2026-002', amount: 10000, balance: 2400000 },
  { id: 'bt3', date: '2026-02-13', description: 'MPESA-Felix Otieno-Term1', reference: 'MPE-2026-003', amount: 20000, balance: 2390000 },
  { id: 'bt4', date: '2026-02-12', description: 'CASH DEPOSIT-Henry K', reference: 'CSH-2026-004', amount: 5000, balance: 2370000 },
  { id: 'bt5', date: '2026-02-11', description: 'MPESA-G Wambui-School', reference: 'MPE-2026-005X', amount: 12000, balance: 2365000 },
  { id: 'bt6', date: '2026-02-10', description: 'EFT-D Ochieng-Carol fees', reference: 'BNK-2026-006', amount: 20000, balance: 2353000 },
  { id: 'bt7', date: '2026-02-09', description: 'MPESA-Dennis M-Fees', reference: 'MPE-2026-007', amount: 8000, balance: 2333000 },
  { id: 'bt8', date: '2026-02-08', description: 'EFT-Unknown Deposit', reference: 'UNK-2026-099', amount: 25000, balance: 2325000 },
  { id: 'bt9', date: '2026-02-07', description: 'MPESA-B Kimani-GVA', reference: 'CSH-2026-009', amount: 10000, balance: 2300000 },
];

export const MOCK_RECONCILIATION: ReconciliationItem[] = [
  { id: 'rc1', bankTransaction: MOCK_BANK_TRANSACTIONS[0], systemPaymentId: 'p1', systemPaymentRef: 'MPE-2026-001', systemAmount: 15000, systemStudentName: 'Amina Hassan', status: 'matched', confidence: 'high', matchedAt: '2026-02-14T12:00:00Z', matchedBy: 'auto' },
  { id: 'rc2', bankTransaction: MOCK_BANK_TRANSACTIONS[1], systemPaymentId: 'p2', systemPaymentRef: 'BNK-2026-002', systemAmount: 10000, systemStudentName: 'Brian Kimani', status: 'matched', confidence: 'high', matchedAt: '2026-02-13T12:00:00Z', matchedBy: 'auto' },
  { id: 'rc3', bankTransaction: MOCK_BANK_TRANSACTIONS[4], systemPaymentId: 'p5', systemPaymentRef: 'MPE-2026-005', systemAmount: 12000, systemStudentName: 'Gloria Wambui', status: 'suggested', confidence: 'medium' },
  { id: 'rc4', bankTransaction: MOCK_BANK_TRANSACTIONS[7], status: 'unmatched_bank' },
  { id: 'rc5', systemPaymentId: 'p10', systemPaymentRef: 'MPE-2026-010', systemAmount: 5000, systemStudentName: 'Esther Nyambura', status: 'unmatched_system' },
];

export const MOCK_INTEGRATIONS: IntegrationConfig[] = [
  { id: 'int1', provider: 'xero', displayName: 'Xero', status: 'connected', lastSyncedAt: '2026-02-14T08:00:00Z', syncFrequency: 'daily', itemsSynced: 342, syncErrors: 0 },
  { id: 'int2', provider: 'quickbooks', displayName: 'QuickBooks Online', status: 'disconnected', lastSyncedAt: '', syncFrequency: 'manual', itemsSynced: 0, syncErrors: 0 },
];

export const MOCK_EXPENSES: ExpenseRecord[] = [
  { id: 'exp1', date: '2026-02-10', category: 'Utilities', description: 'Electricity bill — January 2026', amount: 45000, vendor: 'Kenya Power', receiptUrl: '', status: 'approved', submittedBy: 'Mary Njoroge' },
  { id: 'exp2', date: '2026-02-08', category: 'Supplies', description: 'Textbooks for Grade 7 Science', amount: 28000, vendor: 'Text Book Centre', receiptUrl: '', status: 'approved', submittedBy: 'Mary Njoroge' },
  { id: 'exp3', date: '2026-02-12', category: 'Maintenance', description: 'Plumbing repair — Boys washroom', amount: 12000, vendor: 'Quick Fix Plumbers', receiptUrl: '', status: 'pending', submittedBy: 'Mary Njoroge' },
  { id: 'exp4', date: '2026-02-14', category: 'Salaries', description: 'February staff salaries', amount: 680000, vendor: 'Staff Payroll', receiptUrl: '', status: 'approved', submittedBy: 'Mary Njoroge' },
  { id: 'exp5', date: '2026-02-06', category: 'Transport', description: 'School bus fuel — Week 5', amount: 18000, vendor: 'Total Kenya', receiptUrl: '', status: 'approved', submittedBy: 'Mary Njoroge' },
];

export const ACCOUNTANT_MONTHLY_COLLECTIONS = [
  { month: 'Sep', collected: 1650000, invoiced: 2000000 },
  { month: 'Oct', collected: 1900000, invoiced: 2000000 },
  { month: 'Nov', collected: 1750000, invoiced: 2200000 },
  { month: 'Dec', collected: 2100000, invoiced: 2200000 },
  { month: 'Jan', collected: 2600000, invoiced: 2800000 },
  { month: 'Feb', collected: 2400000, invoiced: 2800000 },
];

export const PAYMENT_METHOD_DISTRIBUTION = [
  { method: 'M-Pesa', value: 58, color: 'hsl(142, 72%, 35%)' },
  { method: 'Bank Transfer', value: 28, color: 'hsl(200, 72%, 45%)' },
  { method: 'Cash', value: 10, color: 'hsl(45, 90%, 50%)' },
  { method: 'Card', value: 4, color: 'hsl(280, 60%, 50%)' },
];

export const RECEIVABLES_AGING = [
  { range: 'Current', amount: 380000, count: 24 },
  { range: '1-30 days', amount: 215000, count: 12 },
  { range: '31-60 days', amount: 145000, count: 8 },
  { range: '61-90 days', amount: 78000, count: 5 },
  { range: '90+ days', amount: 62000, count: 3 },
];
