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
