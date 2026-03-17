export type UserRole = 'super_admin' | 'school_admin' | 'parent' | 'accountant';

// ─── Module ────────────────────────────────────────────────────────────────────

export type ModuleKey =
  | 'academics'
  | 'finance'
  | 'attendance'
  | 'transport'
  | 'communication'
  | 'nemis'
  | 'parent_portal'
  | 'student_portal'
  | 'staff_portal'
  | 'store'
  | 'hostel'
  | 'alumni'
  | 'examination'
  | 'sports'
  | 'health'
  | 'tasks'
  | 'diary'
  | 'pt_meetings';

export interface Module {
  id: number;
  name: string;
  key: ModuleKey;
  icon: string;
  description: string;
  dependencies: ModuleKey[];
  permissions: string[];
  settings: Record<string, unknown>;
  sort_order: number;
  is_core: boolean;
  is_active: boolean;
  /** Pivot data when loaded via school's module relationship */
  pivot?: {
    is_enabled: boolean;
    settings: Record<string, unknown> | null;
    permissions_override: string[] | null;
  };
}

// ─── Tenant / School ───────────────────────────────────────────────────────────

export type SchoolStatus = 'active' | 'suspended' | 'trial' | 'inactive';
export type SubscriptionPlan = 'basic' | 'standard' | 'premium' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
  schoolName?: string;
  school?: { id: number; name: string } | null;
  /** All permission names assigned to this user */
  permissions?: string[];
}

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  parentName: string;
  parentEmail: string;
  status: 'active' | 'inactive';
  totalFees: number;
  paidFees: number;
  balance: number;
}

export interface Payment {
  id: string;
  date: string;
  studentName: string;
  studentId: string;
  amount: number;
  method: 'mpesa' | 'bank' | 'cash' | 'card';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface KPIData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface School {
  id: string;
  name: string;
  owner: string;
  status: SchoolStatus;
  studentCount: number;
  feesCollected: number;
  location: string;
  logo?: string;
  email?: string;
  phone?: string;
  subscription_plan?: SubscriptionPlan;
  enabled_modules?: ModuleKey[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ChildCard {
  studentId: string;
  name: string;
  grade: string;
  className: string;
  totalFees: number;
  paidFees: number;
  status: 'paid' | 'partial' | 'overdue';
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  target: number;
}

export interface NavItem {
  title: string;
  url: string;
  icon: string;
}

export interface SidebarSection {
  label: string;
  items: NavItem[];
}

export interface Grade {
  id: string;
  name: string;
  studentCount: number;
  classes: GradeClass[];
}

export interface GradeClass {
  id: string;
  name: string;
  gradeId: string;
  gradeName: string;
  teacher: string;
  studentCount: number;
}

export interface FeeStructure {
  id: string;
  name: string;
  grade: string;
  term: string;
  totalAmount: number;
  status: 'active' | 'inactive';
  items: FeeItem[];
}

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
}

export interface AcademicTerm {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'mpesa' | 'bank' | 'cash' | 'card';
  enabled: boolean;
  details: string;
  order: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  studentName: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  items: { name: string; amount: number }[];
}

// ─── Subscription Plans ────────────────────────────────────────────────────────

export interface SubscriptionPlanModel {
  id: number;
  name: string;
  code: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  student_limit: number;  // 0 = unlimited
  staff_limit: number;    // 0 = unlimited
  storage_limit_mb: number; // 0 = unlimited
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
  schools_count?: number;
  included_modules?: Module[];
}

export interface PlanModule {
  plan_id: number;
  module_id: number;
  is_included: boolean;
}

// ─── School Roles ──────────────────────────────────────────────────────────────

export interface SchoolRole {
  id: number;
  tenant_id: number;
  name: string;
  description: string | null;
  is_system: boolean;
  created_by: number | null;
  staff_assignments_count?: number;
  permissions?: Permission[];
  staff?: User[];
  parent_roles?: SchoolRole[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface StaffRoleAssignment {
  staff_id: number;
  role_id: number;
  assigned_by: number | null;
  assigned_at: string;
  expires_at: string | null;
  role?: SchoolRole;
  assigned_by_user?: User;
}

export interface StaffDirectPermission {
  staff_id: number;
  permission_id: number;
  assigned_by: number | null;
  assigned_at: string;
  expires_at: string | null;
  permission?: Permission;
  assigned_by_user?: User;
}

// ─── Dashboard Config ──────────────────────────────────────────────────────────

export type DashboardUserType = 'parent' | 'student' | 'teacher' | 'staff' | 'principal';

export interface DashboardConfig {
  id: number;
  tenant_id: number;
  user_type: DashboardUserType;
  config_key: string;
  config_value: boolean;
}

// ─── Usage ─────────────────────────────────────────────────────────────────────

export interface UsageMetric {
  current: number;
  limit: number;  // 0 = unlimited
  percent: number;
  unlimited?: boolean;
  near_limit?: boolean;
  at_limit?: boolean;
}

export interface SchoolUsageSummary {
  id: number;
  name: string;
  plan_name: string;
  subscription_status: string;
  subscription_end_date: string | null;
  students: UsageMetric;
  staff: UsageMetric;
}

// ─── Module Overrides ──────────────────────────────────────────────────────────

export type ModuleOverrideStatus = 'enabled' | 'disabled' | 'inherit';

export interface ModuleTenantOverride {
  module_id: number;
  school_id: number;
  status: ModuleOverrideStatus;
}

// ─── Academics ────────────────────────────────────────────────────────────────

export type CurriculumType = 'cbc' | '844' | 'cambridge';
export type ExamType = 'cat' | 'end_term' | 'mock' | 'final';
export type ExamStatus = 'draft' | 'published' | 'in_progress' | 'completed';
export type LessonPlanStatus = 'draft' | 'published';
export type TimetableDayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface Curriculum {
  id: number;
  school_id: number;
  name: string;
  code: string;
  type: CurriculumType;
  description: string | null;
  is_active: boolean;
  settings: Record<string, unknown> | null;
  subjects_count?: number;
}

export interface LearningArea {
  id: number;
  curriculum_id: number;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  strands?: Strand[];
  curriculum?: { id: number; name: string };
}

export interface Strand {
  id: number;
  learning_area_id: number;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  sub_strands?: SubStrand[];
}

export interface SubStrand {
  id: number;
  strand_id: number;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  learning_outcomes?: LearningOutcome[];
}

export interface LearningOutcome {
  id: number;
  sub_strand_id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface AcademicSubject {
  id: number;
  school_id: number;
  curriculum_id: number | null;
  name: string;
  code: string;
  is_core: boolean;
  credits: number;
  description: string | null;
  curriculum?: { id: number; name: string } | null;
}

export interface GradeScaleLevel {
  grade: string;
  min: number;
  max: number;
  points?: number;
  remarks?: string;
}

export interface GradeScale {
  id: number;
  school_id: number;
  curriculum_id: number | null;
  name: string;
  levels: GradeScaleLevel[];
  is_default: boolean;
  curriculum?: { id: number; name: string } | null;
}

export interface AcademicExam {
  id: number;
  school_id: number;
  name: string;
  type: ExamType;
  term: number;
  year: number;
  start_date: string | null;
  end_date: string | null;
  status: ExamStatus;
  settings: Record<string, unknown> | null;
  papers_count?: number;
}

export interface ExamPaper {
  id: number;
  exam_id: number;
  subject_id: number;
  name: string;
  max_marks: number;
  weight: number;
  date: string | null;
  start_time: string | null;
  duration: number | null;
  venue: string | null;
  subject?: { id: number; name: string };
  marks_entered?: number;
  average?: number;
}

export interface StudentMark {
  id: number;
  exam_paper_id: number;
  student_id: number;
  marks_obtained: number | null;
  grade: string | null;
  remarks: string | null;
  is_absent: boolean;
}

export interface TimetableEntry {
  id: number;
  school_id: number;
  grade_class_id: number | null;
  subject_id: number;
  teacher_id: number | null;
  day_of_week: TimetableDayOfWeek;
  time_slot: string;
  duration: number;
  room: string | null;
  effective_from: string;
  effective_to: string | null;
  class?: { id: number; name: string } | null;
  subject?: { id: number; name: string };
  teacher?: { id: number; name: string } | null;
}

export interface LessonPlan {
  id: number;
  school_id: number;
  teacher_id: number;
  subject_id: number;
  grade_class_id: number | null;
  topic: string;
  sub_topic: string | null;
  learning_objectives: string[] | null;
  resources: string[] | null;
  lesson_structure: Record<string, unknown> | null;
  assessment_methods: string[] | null;
  differentiation: string | null;
  reflection: string | null;
  status: LessonPlanStatus;
  date: string;
  subject?: { id: number; name: string };
  class?: { id: number; name: string } | null;
  teacher?: { id: number; name: string };
}

export interface SchemeOfWork {
  id: number;
  school_id: number;
  teacher_id: number;
  subject_id: number;
  grade_class_id: number | null;
  term: number;
  year: number;
  weeks: Record<string, unknown>[] | null;
  status: LessonPlanStatus;
  subject?: { id: number; name: string };
  class?: { id: number; name: string } | null;
}

export interface ClassSubject {
  id: number;
  grade_class_id: number;
  subject_id: number;
  teacher_id: number | null;
  periods_per_week: number;
  subject?: { id: number; name: string };
  teacher?: { id: number; name: string } | null;
}
