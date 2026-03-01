# School Admin Module Audit

## Overview

This document maps every School Admin page to its backend controller, data source, and actions, and records the audit findings.

---

## Pages & Backend Mapping

### 1. Dashboard
- **Frontend:** `resources/js/pages/school/Dashboard.tsx`
- **Backend:** `app/Http/Controllers/School/DashboardController::index`
- **Route:** `GET /school/dashboard` → `school.dashboard`
- **Data source:** Real DB (Eloquent queries for students, invoices, payments, grades)
- **Props:** `kpi`, `recentPayments`, `overdueInvoices`, `studentsByGrade`, `recentStudents`, `collectionByMethod`, `agingData`, `monthlyRevenue`, `principalKPIs`
- **Actions:** Read-only dashboard
- **Mock data:** None ✅

### 2. Students
- **Frontend:** `resources/js/pages/school/Students.tsx`, `resources/js/pages/school/StudentDetail.tsx`
- **Backend:** `app/Http/Controllers/School/StudentController`
- **Routes:** `GET /school/students`, `POST /school/students`, `PUT /school/students/{student}`, `DELETE /school/students/{student}`
- **Data source:** Real DB ✅
- **Columns:** Admission number, name, grade, class, parent, status, fees balance
- **Filters:** status, grade_id, search
- **Actions:**
  | Action | Handler | Route |
  |--------|---------|-------|
  | List students | `index()` | `GET school.students.index` |
  | Create student | `store()` | `POST school.students.store` |
  | View student | `show()` | `GET school.students.show` |
  | Edit student | `update()` | `PUT school.students.update` |
  | Delete student | `destroy()` | `DELETE school.students.destroy` |
- **Mock data:** None ✅

### 3. Grades
- **Frontend:** `resources/js/pages/school/Grades.tsx`
- **Backend:** `app/Http/Controllers/School/GradeController`
- **Routes:** `GET /school/grades`, `POST /school/grades`, `PUT /school/grades/{grade}`, `DELETE /school/grades/{grade}`
- **Data source:** Real DB ✅
- **Actions:**
  | Action | Handler | Route |
  |--------|---------|-------|
  | List grades | `index()` | `GET school.grades.index` |
  | Create grade | `store()` | `POST school.grades.store` |
  | View grade | `show()` | `GET school.grades.show` |
  | Edit grade | `update()` | `PUT school.grades.update` |
  | Delete grade | `destroy()` | `DELETE school.grades.destroy` |
- **Constraint:** Cannot delete grade with enrolled students
- **Mock data:** None ✅

### 4. Classes (GradeClasses)
- **Frontend:** Shared within Grades page
- **Backend:** `app/Http/Controllers/School/GradeClassController`
- **Routes:** `GET /school/classes`, `POST /school/classes`, `PUT /school/classes/{class}`, `DELETE /school/classes/{class}`
- **Data source:** Real DB ✅
- **Actions:**
  | Action | Handler | Route |
  |--------|---------|-------|
  | List classes | `index()` | `GET school.classes.index` |
  | Create class | `store()` | `POST school.classes.store` |
  | View class | `show()` | `GET school.classes.show` |
  | Edit class | `update()` | `PUT school.classes.update` |
  | Delete class | `destroy()` | `DELETE school.classes.destroy` |
- **Constraint:** Cannot delete class with enrolled students
- **Mock data:** None ✅

### 5. Academic Terms
- **Frontend:** `resources/js/pages/school/Terms.tsx`
- **Backend:** `app/Http/Controllers/School/AcademicTermController`
- **Routes:** `GET /school/terms`, `POST /school/terms`, `PUT /school/terms/{term}`, `DELETE /school/terms/{term}`
- **Data source:** Real DB ✅
- **Columns:** Name, year, start date, end date, status
- **Actions:**
  | Action | Handler | Route |
  |--------|---------|-------|
  | List terms | `index()` | `GET school.terms.index` |
  | Create term | `store()` | `POST school.terms.store` |
  | View term | `show()` | `GET school.terms.show` |
  | Edit term | `update()` | `PUT school.terms.update` |
  | Delete term | `destroy()` | `DELETE school.terms.destroy` |
- **Constraint:** Cannot delete term with associated fee structures
- **Mock data:** None ✅

### 6. Fee Structures
- **Frontend:** `resources/js/pages/school/FeeStructures.tsx`
- **Backend:** `app/Http/Controllers/School/FeeStructureController`
- **Routes:** `GET /school/fee-structures`, `POST /school/fee-structures`, `PUT /school/fee-structures/{feeStructure}`, `DELETE /school/fee-structures/{feeStructure}`
- **Data source:** Real DB ✅
- **Columns:** Name, grade, term, total amount, status, fee items
- **Actions:**
  | Action | Handler | Route |
  |--------|---------|-------|
  | List fee structures | `index()` | `GET school.fee-structures.index` |
  | Create fee structure | `store()` | `POST school.fee-structures.store` |
  | View fee structure | `show()` | `GET school.fee-structures.show` |
  | Edit fee structure | `update()` | `PUT school.fee-structures.update` |
  | Delete fee structure | `destroy()` | `DELETE school.fee-structures.destroy` |
- **Mock data:** None ✅

### 7. Payments
- **Frontend:** `resources/js/pages/school/Payments.tsx`
- **Backend:** `app/Http/Controllers/School/PaymentController`
- **Routes:** `GET /school/payments`, `GET /school/payments/{payment}`
- **Data source:** Real DB ✅
- **Columns:** Student, amount, provider, status, reference, date
- **Actions:** View only (school admin cannot create payments)
- **Mock data:** None ✅

### 8. Receipts
- **Frontend:** `resources/js/pages/school/Receipts.tsx`
- **Backend:** `app/Http/Controllers/School/ReceiptController`
- **Routes:** `GET /school/receipts`, `GET /school/receipts/{receipt}`
- **Data source:** Real DB ✅
- **Actions:** View/download receipts
- **Mock data:** None ✅

### 9. Payment Methods
- **Frontend:** `resources/js/pages/school/PaymentMethods.tsx`
- **Backend:** `app/Http/Controllers/School/PaymentMethodController`
- **Routes:** `GET /school/payment-methods`, `POST /school/payment-methods`, `PUT /school/payment-methods/{id}`, `DELETE /school/payment-methods/{id}`
- **Data source:** Real DB (SchoolPaymentConfig) ✅
- **Actions:** Configure payment methods (M-Pesa, KCB, Equity, etc.)
- **Mock data:** `resources/js/data/payment-config.ts` — DEPRECATED, commented out, not used ✅

### 10. Settings
- **Frontend:** `resources/js/pages/school/Settings.tsx`
- **Backend:** `app/Http/Controllers/School/SettingsController`
- **Routes:** `GET /school/settings`, `PUT /school/settings`
- **Data source:** Real DB (School model) ✅
- **Actions:** Update school name, logo, contact info, colors
- **Mock data:** None ✅

### 11. Billing
- **Frontend:** `resources/js/pages/school/PlatformBilling.tsx`
- **Backend:** `app/Http/Controllers/School/BillingController`
- **Routes:** `GET /school/billing`
- **Data source:** Real DB ✅
- **Actions:** View subscription/billing info
- **Mock data:** None ✅

### 12. Users (Accountants)
- **Frontend:** `resources/js/pages/school/Users.tsx`
- **Backend:** `app/Http/Controllers/School/UserController`
- **Routes:** `GET /school/users`, `POST /school/users`, `PUT /school/users/{user}`, `DELETE /school/users/{user}`
- **Data source:** Real DB ✅
- **Actions:** Invite/manage accountant users
- **Mock data:** None ✅

### 13. Health Records
- **Frontend:** `resources/js/pages/school/HealthRecords.tsx`, `resources/js/pages/school/Health.tsx`, `resources/js/pages/school/HealthDetail.tsx`
- **Backend:** No dedicated School Health controller found (health data accessible via student detail)
- **Data source:** Real DB (StudentHealthProfile, MedicalCondition, etc.)
- **Mock data:** None ✅

---

## Mock Data Audit

| File | Status | Used By |
|------|--------|---------|
| `resources/js/data/payment-config.ts` | DEPRECATED – content commented out | Not imported anywhere ✅ |
| `resources/js/lib/mock-data.ts` | Contains mock data | Only used by `Header.tsx` (notifications) and `AuthContext.tsx` (dev role switcher) |

### Mock Data Remaining Usage

1. **`resources/js/components/Header.tsx`** – Uses `MOCK_NOTIFICATIONS` for notification badge/dropdown. This is dev-time scaffolding; the real `api/notifications` endpoint exists.
2. **`resources/js/contexts/AuthContext.tsx`** – Uses `MOCK_USERS` for a dev-mode role switcher (only relevant in dev mode, not in production Inertia flow).

These two usages are UI development scaffolding and do not affect any school admin page's core data flow. The real authentication is handled by Laravel session + Inertia's `usePage().props.auth`. The notification badge should be replaced with real data from the API.

---

## Multi-Tenancy Verification

All school admin controllers:
- Retrieve `auth()->user()->school` and scope all queries through it
- Verify ownership via `$model->school_id !== auth()->user()->school_id` checks
- Are protected by `role:school_admin` and `school.access` middleware

---

## Gaps and Planned Fixes

| Gap | Fix |
|-----|-----|
| `Header.tsx` uses mock notifications | Replace with real `/api/notifications` call |
| No model factories for School, Grade, GradeClass, AcademicTerm, Student, FeeStructure | Add factories (done in this PR) |
| No feature tests for school admin routes | Add comprehensive PHPUnit feature tests (done in this PR) |
| `ExampleTest` expects 200 at `/` but route redirects to login (302) | Update test to assert 302 redirect |
