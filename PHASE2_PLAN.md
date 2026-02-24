# Phase 2 Implementation Plan

## Overview

Phase 2 focuses on building the application layer with controllers, routes, form requests, policies, and Inertia.js page responses. This phase will make the backend fully functional and ready to serve data to the frontend.

---

## 📋 Phase 2 Deliverables

### 1. Controllers (Estimated: 25-30 controllers)

#### Super Admin Controllers (`app/Http/Controllers/Admin/`)
- `DashboardController` - Platform-wide KPIs and analytics
- `SchoolController` - School CRUD operations
- `UserController` - User management across all schools
- `SettingsController` - Platform settings

#### School Admin Controllers (`app/Http/Controllers/School/`)
- `DashboardController` - School-specific dashboard
- `StudentController` - Student CRUD operations
- `GradeController` - Grade management
- `GradeClassController` - Class management
- `AcademicTermController` - Term management
- `FeeStructureController` - Fee structure management
- `PaymentMethodController` - Payment provider configuration
- `PaymentController` - View payments
- `ReceiptController` - View receipts
- `SettingsController` - School settings
- `BillingController` - Platform billing for school
- `HealthController` - Student health management
- `PTMeetingController` - Parent-teacher meeting management

#### Accountant Controllers (`app/Http/Controllers/Accountant/`)
- `DashboardController` - Financial dashboard
- `FeeStructureController` - View fee structures
- `InvoiceController` - Invoice management
- `PaymentController` - Payment management
- `ReconciliationController` - Bank reconciliation
- `ReportController` - Financial reports
- `ExpenseController` - Expense management
- `IntegrationController` - Accounting software integrations
- `PaymentGatewayController` - Payment gateway monitoring

#### Parent Controllers (`app/Http/Controllers/Parent/`)
- `DashboardController` - Parent dashboard
- `ChildrenController` - View children
- `FeeController` - View fees for children
- `PaymentController` - Initiate and view payments
- `PaymentHistoryController` - Payment history
- `ReceiptController` - View and download receipts

---

### 2. Form Request Validation (Estimated: 20-25 requests)

Create form request classes in `app/Http/Requests/` with validation rules:

#### School Management
- `StoreSchoolRequest`
- `UpdateSchoolRequest`

#### Student Management
- `StoreStudentRequest`
- `UpdateStudentRequest`

#### Academic Structure
- `StoreGradeRequest`
- `UpdateGradeRequest`
- `StoreClassRequest`
- `UpdateClassRequest`
- `StoreTermRequest`
- `UpdateTermRequest`

#### Fee Management
- `StoreFeeStructureRequest`
- `UpdateFeeStructureRequest`

#### Payment
- `InitiatePaymentRequest`
- `ConfirmPaymentRequest`

#### Invoice
- `StoreInvoiceRequest`
- `UpdateInvoiceRequest`
- `SendInvoiceRequest`

#### Health
- `StoreHealthProfileRequest`
- `UpdateHealthProfileRequest`

#### Parent-Teacher Meetings
- `StorePTSessionRequest`
- `BookPTSlotRequest`

---

### 3. Policies (Estimated: 10-15 policies)

Authorization policies in `app/Policies/`:

- `SchoolPolicy` - School access control
- `StudentPolicy` - Student access control
- `PaymentPolicy` - Payment authorization
- `InvoicePolicy` - Invoice authorization
- `FeeStructurePolicy` - Fee structure authorization
- `ReceiptPolicy` - Receipt access control
- `HealthProfilePolicy` - Health data access control
- `PTSessionPolicy` - PT meeting authorization
- `ExpensePolicy` - Expense authorization
- `UserPolicy` - User management authorization

---

### 4. Routes (Estimated: 100+ routes)

Define routes in `routes/web.php` and `routes/api.php`:

#### Super Admin Routes (`/admin/*`)
```php
Route::prefix('admin')->middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::resource('schools', AdminSchoolController::class);
    Route::resource('users', AdminUserController::class);
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('admin.settings');
    Route::put('/settings', [AdminSettingsController::class, 'update'])->name('admin.settings.update');
});
```

#### School Admin Routes (`/school/*`)
```php
Route::prefix('school')->middleware(['auth', 'role:school_admin', 'school.access'])->group(function () {
    Route::get('/dashboard', [SchoolDashboardController::class, 'index'])->name('school.dashboard');
    Route::resource('students', SchoolStudentController::class);
    Route::resource('grades', SchoolGradeController::class);
    Route::resource('classes', SchoolClassController::class);
    Route::resource('terms', SchoolTermController::class);
    Route::resource('fee-structures', SchoolFeeStructureController::class);
    Route::get('/payments', [SchoolPaymentController::class, 'index'])->name('school.payments');
    Route::get('/receipts', [SchoolReceiptController::class, 'index'])->name('school.receipts');
    // ... more routes
});
```

#### Accountant Routes (`/accountant/*`)
```php
Route::prefix('accountant')->middleware(['auth', 'role:accountant', 'school.access'])->group(function () {
    Route::get('/dashboard', [AccountantDashboardController::class, 'index'])->name('accountant.dashboard');
    Route::resource('invoices', AccountantInvoiceController::class);
    Route::post('/invoices/{invoice}/send', [AccountantInvoiceController::class, 'send'])->name('accountant.invoices.send');
    Route::get('/payments', [AccountantPaymentController::class, 'index'])->name('accountant.payments');
    Route::resource('expenses', AccountantExpenseController::class);
    Route::get('/reconciliation', [AccountantReconciliationController::class, 'index'])->name('accountant.reconciliation');
    Route::post('/reconciliation/match', [AccountantReconciliationController::class, 'match'])->name('accountant.reconciliation.match');
    // ... more routes
});
```

#### Parent Routes (`/parent/*`)
```php
Route::prefix('parent')->middleware(['auth', 'role:parent', 'parent.access'])->group(function () {
    Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('parent.dashboard');
    Route::get('/children', [ParentChildrenController::class, 'index'])->name('parent.children');
    Route::get('/children/{student}/fees', [ParentFeeController::class, 'show'])->name('parent.fees.show');
    Route::post('/children/{student}/pay', [ParentPaymentController::class, 'initiate'])->name('parent.payment.initiate');
    Route::post('/children/{student}/pay/confirm', [ParentPaymentController::class, 'confirm'])->name('parent.payment.confirm');
    Route::get('/children/{student}/pay/status/{transaction}', [ParentPaymentController::class, 'status'])->name('parent.payment.status');
    Route::get('/payments', [ParentPaymentHistoryController::class, 'index'])->name('parent.payments');
    Route::get('/receipts', [ParentReceiptController::class, 'index'])->name('parent.receipts');
    Route::get('/receipts/{receipt}/download', [ParentReceiptController::class, 'download'])->name('parent.receipts.download');
});
```

#### API Routes (`/api/*`)
```php
Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/payments/initiate', [ApiPaymentController::class, 'initiate']);
    Route::get('/payments/{transaction}/status', [ApiPaymentController::class, 'status']);
    Route::post('/payments/{transaction}/confirm', [ApiPaymentController::class, 'confirm']);
    Route::get('/notifications/unread', [ApiNotificationController::class, 'unread']);
    Route::post('/notifications/{notification}/read', [ApiNotificationController::class, 'markAsRead']);
    Route::get('/receipts/{receipt}/pdf', [ApiReceiptController::class, 'pdf']);
    
    // Payment provider callbacks
    Route::post('/payments/callback/mpesa', [PaymentCallbackController::class, 'mpesa']);
    Route::post('/payments/callback/{provider}/{school}', [PaymentCallbackController::class, 'handle']);
});
```

---

### 5. Inertia Page Responses

All controllers should return Inertia responses with properly structured data:

#### Example: Parent Dashboard Controller
```php
namespace App\Http\Controllers\Parent;

use App\Models\Student;
use App\Models\Notification;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $children = auth()->user()->students()
            ->with(['grade', 'class', 'school'])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'admission_number' => $student->admission_number,
                    'grade' => $student->grade->name,
                    'class' => $student->class->name,
                    'school' => $student->school->name,
                    'balance' => $this->calculateBalance($student),
                ];
            });

        $notifications = auth()->user()->notifications()
            ->where('read', false)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('parent/Dashboard', [
            'children' => $children,
            'notifications' => $notifications,
        ]);
    }

    private function calculateBalance($student)
    {
        // Calculate total fees vs paid amount
        // Implementation details...
    }
}
```

#### Example: School Admin Dashboard Controller
```php
namespace App\Http\Controllers\School;

use App\Models\Student;
use App\Models\PaymentTransaction;
use App\Models\Invoice;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $kpi = [
            'total_students' => $school->students()->count(),
            'active_students' => $school->students()->where('status', 'active')->count(),
            'total_revenue' => $school->paymentTransactions()
                ->where('status', 'completed')
                ->sum('amount') / 100, // Convert from cents
            'pending_payments' => $school->invoices()
                ->whereIn('status', ['sent', 'partial'])
                ->sum('balance') / 100,
        ];

        $recentPayments = $school->paymentTransactions()
            ->with(['student', 'parent'])
            ->latest()
            ->take(10)
            ->get();

        $overdueInvoices = $school->invoices()
            ->where('status', 'overdue')
            ->with('student')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('school/Dashboard', [
            'kpi' => $kpi,
            'recentPayments' => $recentPayments,
            'overdueInvoices' => $overdueInvoices,
        ]);
    }
}
```

---

### 6. Resource Transformers (Optional but Recommended)

Create API Resource classes in `app/Http/Resources/` to standardize data transformation:

- `StudentResource`
- `InvoiceResource`
- `PaymentTransactionResource`
- `ReceiptResource`
- `SchoolResource`
- `UserResource`

Example:
```php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'admission_number' => $this->admission_number,
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'grade' => [
                'id' => $this->grade->id,
                'name' => $this->grade->name,
            ],
            'class' => [
                'id' => $this->class->id,
                'name' => $this->class->name,
            ],
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
```

---

## 🎯 Implementation Order

1. **Week 1: Super Admin Module**
   - Controllers for dashboard, schools, users, settings
   - Routes and middleware
   - Form requests and policies
   - Inertia responses

2. **Week 2: School Admin Module**
   - Student management controllers
   - Academic structure controllers (grades, classes, terms)
   - Fee structure controllers
   - Routes and policies

3. **Week 3: Accountant Module**
   - Invoice management controllers
   - Payment and reconciliation controllers
   - Expense tracking controllers
   - Report generation

4. **Week 4: Parent Module**
   - Dashboard and children controllers
   - Fee viewing controllers
   - Payment initiation controllers
   - Receipt viewing controllers

5. **Week 5: API Endpoints & Integration**
   - Payment status polling endpoints
   - Notification endpoints
   - PDF generation endpoints
   - Payment provider callback handlers

---

## 🧪 Testing Strategy

Each controller should have corresponding feature tests:

- Test authentication and authorization
- Test data scoping (multi-tenancy)
- Test form validation
- Test policy enforcement
- Test Inertia responses structure

Example test:
```php
public function test_parent_can_only_view_their_own_children()
{
    $parent = User::factory()->create()->assignRole('parent');
    $student1 = Student::factory()->create();
    $student2 = Student::factory()->create();
    
    $parent->students()->attach($student1);
    
    $response = $this->actingAs($parent)->get('/parent/children');
    
    $response->assertInertia(fn ($page) => $page
        ->has('children', 1)
        ->where('children.0.id', $student1->id)
    );
}
```

---

## 📚 Documentation Updates

- Update README.md with Phase 2 completion status
- Create PHASE2_SETUP.md with API documentation
- Document all routes and their expected parameters
- Document Inertia page props for frontend developers

---

## ✅ Success Criteria

Phase 2 will be considered complete when:

1. ✅ All controllers implemented and tested
2. ✅ All routes defined and working
3. ✅ Form validation working on all endpoints
4. ✅ Policies enforcing proper authorization
5. ✅ Inertia responses returning correct data structure
6. ✅ Multi-tenancy working correctly (users can only access their data)
7. ✅ All CRUD operations functional
8. ✅ API endpoints responding correctly
9. ✅ Feature tests passing
10. ✅ Documentation updated

---

**Target Completion:** 4-5 weeks
**Estimated Lines of Code:** 5,000-7,000 lines
**Testing Coverage Goal:** >80%
