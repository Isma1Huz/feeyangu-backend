<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SchoolController as AdminSchoolController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\ModuleController as AdminModuleController;
use App\Http\Controllers\Admin\ModuleManagementController as AdminModuleManagementController;
use App\Http\Controllers\Admin\SubscriptionPlanController as AdminSubscriptionPlanController;
use App\Http\Controllers\Admin\SchoolUsageController as AdminSchoolUsageController;
use App\Http\Controllers\School\Academics\AcademicsDashboardController as SchoolAcademicsDashboardController;
use App\Http\Controllers\School\Academics\CurriculumController as SchoolCurriculumController;
use App\Http\Controllers\School\Academics\SubjectController as SchoolSubjectController;
use App\Http\Controllers\School\Academics\ExamController as SchoolExamController;
use App\Http\Controllers\School\Academics\MarkEntryController as SchoolMarkEntryController;
use App\Http\Controllers\School\Academics\TimetableController as SchoolTimetableController;
use App\Http\Controllers\School\Academics\GradeScaleController as SchoolGradeScaleController;
use App\Http\Controllers\School\Academics\LearningAreaController as SchoolLearningAreaController;
use App\Http\Controllers\School\Academics\ClassSubjectController as SchoolClassSubjectController;
use App\Http\Controllers\School\Academics\LessonPlanController as SchoolLessonPlanController;
use App\Http\Controllers\School\Academics\ClassController as SchoolAcademicClassController;
use App\Http\Controllers\School\Academics\StreamController as SchoolStreamController;
use App\Http\Controllers\School\DashboardController as SchoolDashboardController;
use App\Http\Controllers\School\StudentController as SchoolStudentController;
use App\Http\Controllers\School\GradeController as SchoolGradeController;
use App\Http\Controllers\School\GradeClassController as SchoolGradeClassController;
use App\Http\Controllers\School\AcademicTermController as SchoolAcademicTermController;
use App\Http\Controllers\School\FeeStructureController as SchoolFeeStructureController;
use App\Http\Controllers\School\PaymentController as SchoolPaymentController;
use App\Http\Controllers\School\ReceiptController as SchoolReceiptController;
use App\Http\Controllers\School\PaymentMethodController as SchoolPaymentMethodController;
use App\Http\Controllers\School\SettingsController as SchoolSettingsController;
use App\Http\Controllers\School\BillingController as SchoolBillingController;
use App\Http\Controllers\School\UserController as SchoolUserController;
use App\Http\Controllers\School\BankApiCredentialController as SchoolBankApiCredentialController;
use App\Http\Controllers\School\PTMeetingController as SchoolPTMeetingController;
use App\Http\Controllers\School\HealthController as SchoolHealthController;
use App\Http\Controllers\School\PortfolioController as SchoolPortfolioController;
use App\Http\Controllers\School\ModuleController as SchoolModuleController;
use App\Http\Controllers\School\RoleController as SchoolRoleController;
use App\Http\Controllers\School\StaffPermissionController as SchoolStaffPermissionController;
use App\Http\Controllers\School\DashboardConfigController as SchoolDashboardConfigController;
use App\Http\Controllers\School\SubscriptionController as SchoolSubscriptionController;
use App\Http\Controllers\Accountant\DashboardController as AccountantDashboardController;
use App\Http\Controllers\Accountant\InvoiceController as AccountantInvoiceController;
use App\Http\Controllers\Accountant\PaymentController as AccountantPaymentController;
use App\Http\Controllers\Accountant\ReconciliationController as AccountantReconciliationController;
use App\Http\Controllers\Accountant\ExpenseController as AccountantExpenseController;
use App\Http\Controllers\Accountant\ReportController as AccountantReportController;
use App\Http\Controllers\Accountant\IntegrationController as AccountantIntegrationController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\Parent\ChildrenController as ParentChildrenController;
use App\Http\Controllers\Parent\PaymentController as ParentPaymentController;
use App\Http\Controllers\Parent\ReceiptController as ParentReceiptController;
use App\Http\Controllers\Parent\HealthController as ParentHealthController;
use App\Http\Controllers\Parent\PortfolioController as ParentPortfolioController;
use App\Http\Controllers\Parent\PTMeetingsController as ParentPTMeetingsController;
use Illuminate\Support\Facades\Route;

// Welcome/Landing page
Route::get('/', [AdminDashboardController::class, 'home'])->name('home');


// Super Admin Routes
Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:super_admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        // School usage — must be declared BEFORE the schools resource route to avoid
        // the {school} wildcard matching 'usage' as a school identifier.
        Route::get('/schools/usage', [AdminSchoolUsageController::class, 'index'])->name('schools.usage');
        Route::get('/schools/usage/export', [AdminSchoolUsageController::class, 'exportUsage'])->name('schools.usage.export');
        Route::get('/schools/{tenant}/usage', [AdminSchoolUsageController::class, 'show'])->name('schools.usage.show');

        Route::resource('schools', AdminSchoolController::class);
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
        // User role & permission management
        Route::get('/users/{user}/roles', [AdminUserController::class, 'getUserRoles'])->name('users.roles.get');
        Route::post('/users/{user}/roles', [AdminUserController::class, 'attachRole'])->name('users.roles.attach');
        Route::delete('/users/{user}/roles/{role}', [AdminUserController::class, 'detachRole'])->name('users.roles.detach');
        Route::post('/users/{user}/permissions', [AdminUserController::class, 'attachPermission'])->name('users.permissions.attach');
        Route::delete('/users/{user}/permissions/{permission}', [AdminUserController::class, 'detachPermission'])->name('users.permissions.detach');
        // Platform roles & permissions management
        Route::get('/roles', [AdminRoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [AdminRoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{id}', [AdminRoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{id}', [AdminRoleController::class, 'destroy'])->name('roles.destroy');
        Route::post('/roles/{id}/permissions', [AdminRoleController::class, 'syncPermissions'])->name('roles.permissions.sync');
        Route::post('/permissions', [AdminRoleController::class, 'storePermission'])->name('permissions.store');
        Route::delete('/permissions/{id}', [AdminRoleController::class, 'destroyPermission'])->name('permissions.destroy');
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
        // Module management
        Route::get('/modules', [AdminModuleController::class, 'index'])->name('modules.index');
        Route::patch('/modules/{key}', [AdminModuleController::class, 'update'])->name('modules.update');

        // Enhanced module management with global/tenant overrides
        Route::get('/module-management', [AdminModuleManagementController::class, 'index'])->name('module-management.index');
        Route::post('/module-management/{moduleKey}/toggle-global', [AdminModuleManagementController::class, 'toggleGlobal'])->name('module-management.toggle-global');
        Route::get('/module-management/{moduleKey}/tenant-overrides', [AdminModuleManagementController::class, 'showTenantOverrides'])->name('module-management.tenant-overrides');
        Route::post('/module-management/{moduleKey}/tenant-overrides', [AdminModuleManagementController::class, 'setTenantOverridePost'])->name('module-management.set-tenant-override');
        Route::post('/module-management/{moduleKey}/reset-overrides', [AdminModuleManagementController::class, 'resetAllTenantOverrides'])->name('module-management.reset-overrides');

        // Subscription plans
        Route::resource('subscription-plans', AdminSubscriptionPlanController::class)
            ->except(['show'])
            ->parameters(['subscription-plans' => 'id']);
        Route::post('/subscription-plans/{id}/duplicate', [AdminSubscriptionPlanController::class, 'duplicate'])->name('subscription-plans.duplicate');
        Route::get('/subscription-plans/{id}/preview-update', [AdminSubscriptionPlanController::class, 'previewChanges'])->name('subscription-plans.preview');
    });

// School Admin Routes
Route::prefix('school')
    ->middleware(['auth', 'verified', 'role:school_admin', 'school.access'])
    ->name('school.')
    ->group(function () {
        Route::get('/dashboard', [SchoolDashboardController::class, 'index'])->name('dashboard');
        
        // Student management (store route has subscription limit check)
        Route::resource('students', SchoolStudentController::class)->except(['store']);
        Route::post('/students', [SchoolStudentController::class, 'store'])
            ->middleware('subscription.limit:students')
            ->name('students.store');
        
        // Grade management
        Route::resource('grades', SchoolGradeController::class);
        
        // Class management
        Route::resource('classes', SchoolGradeClassController::class);

        // Class subject assignments
        Route::get('/classes/{gradeClass}/subjects', [SchoolClassSubjectController::class, 'index'])->name('classes.subjects.index');
        Route::post('/classes/{gradeClass}/subjects', [SchoolClassSubjectController::class, 'store'])->name('classes.subjects.store');
        Route::put('/classes/{gradeClass}/subjects/{classSubject}', [SchoolClassSubjectController::class, 'update'])->name('classes.subjects.update');
        Route::delete('/classes/{gradeClass}/subjects/{classSubject}', [SchoolClassSubjectController::class, 'destroy'])->name('classes.subjects.destroy');
        
        // Academic term management
        Route::resource('terms', SchoolAcademicTermController::class);
        
        // Fee structure management
        Route::resource('fee-structures', SchoolFeeStructureController::class);
        
        // Payment method configuration
        Route::get('/payment-methods', [SchoolPaymentMethodController::class, 'index'])->name('payment-methods.index');
        Route::post('/payment-methods', [SchoolPaymentMethodController::class, 'store'])->name('payment-methods.store');
        Route::put('/payment-methods/{id}', [SchoolPaymentMethodController::class, 'update'])->name('payment-methods.update');
        Route::delete('/payment-methods/{id}', [SchoolPaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');

        // Bank API credentials configuration
        Route::post('/api-credentials', [SchoolBankApiCredentialController::class, 'store'])->name('api-credentials.store');
        Route::post('/api-credentials/test', [SchoolBankApiCredentialController::class, 'test'])->name('api-credentials.test');
        
        // Payment viewing
        Route::get('/payments', [SchoolPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [SchoolPaymentController::class, 'show'])->name('payments.show');
        
        // Receipt viewing
        Route::get('/receipts', [SchoolReceiptController::class, 'index'])->name('receipts.index');
        Route::get('/receipts/{receipt}', [SchoolReceiptController::class, 'show'])->name('receipts.show');
        
        // Settings
        Route::get('/settings', [SchoolSettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SchoolSettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/logo', [SchoolSettingsController::class, 'uploadLogo'])->name('settings.logo');
        
        // Billing
        Route::get('/billing', [SchoolBillingController::class, 'index'])->name('billing.index');
        
        // User/Accountant management (store route has subscription limit check)
        Route::get('/users', [SchoolUserController::class, 'index'])->name('users.index');
        Route::post('/users', [SchoolUserController::class, 'store'])
            ->middleware('subscription.limit:staff')
            ->name('users.store');
        Route::put('/users/{user}', [SchoolUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [SchoolUserController::class, 'destroy'])->name('users.destroy');

        // PT Meetings
        Route::get('/pt-meetings', [SchoolPTMeetingController::class, 'index'])->name('pt-meetings.index');

        // Health
        Route::get('/health', [SchoolHealthController::class, 'index'])->name('health.index');

        // Portfolio
        Route::get('/portfolio', [SchoolPortfolioController::class, 'index'])->name('portfolio.index');

        // Module management for this school
        Route::get('/modules', [SchoolModuleController::class, 'index'])->name('modules.index');
        Route::patch('/modules/{key}', [SchoolModuleController::class, 'update'])->name('modules.update');

        // Role management
        Route::resource('roles', SchoolRoleController::class)->parameters(['roles' => 'id']);
        Route::post('/roles/{id}/duplicate', [SchoolRoleController::class, 'duplicate'])->name('roles.duplicate');

        // Staff permission management
        Route::get('/staff/{staff}/permissions', [SchoolStaffPermissionController::class, 'index'])->name('staff.permissions');
        Route::post('/staff/{staff}/roles/{role}', [SchoolStaffPermissionController::class, 'assignRole'])->name('staff.roles.assign');
        Route::delete('/staff/{staff}/roles/{role}', [SchoolStaffPermissionController::class, 'removeRole'])->name('staff.roles.remove');
        Route::post('/staff/{staff}/permissions/{permission}', [SchoolStaffPermissionController::class, 'addDirectPermission'])->name('staff.permissions.add');
        Route::delete('/staff/{staff}/permissions/{permission}', [SchoolStaffPermissionController::class, 'removeDirectPermission'])->name('staff.permissions.remove');
        Route::get('/staff/{staff}/permissions/effective', [SchoolStaffPermissionController::class, 'getEffectivePermissions'])->name('staff.permissions.effective');

        // Dashboard configuration
        Route::get('/dashboard-config', [SchoolDashboardConfigController::class, 'index'])->name('dashboard-config.index');
        Route::put('/dashboard-config/{userType}', [SchoolDashboardConfigController::class, 'updateForUserType'])->name('dashboard-config.update');
        Route::post('/dashboard-config/user/{user}', [SchoolDashboardConfigController::class, 'overrideForUser'])->name('dashboard-config.override');
        Route::post('/dashboard-config/reset/{userType}', [SchoolDashboardConfigController::class, 'resetToDefault'])->name('dashboard-config.reset');

        // Subscription management
        Route::get('/subscription', [SchoolSubscriptionController::class, 'index'])->name('subscription.index');
        Route::get('/subscription/upgrade', [SchoolSubscriptionController::class, 'upgrade'])->name('subscription.upgrade');
        Route::post('/subscription/upgrade', [SchoolSubscriptionController::class, 'processUpgrade'])->name('subscription.process-upgrade');

        // Academics
        Route::prefix('academics')->name('academics.')->group(function () {
            Route::get('/', [SchoolAcademicsDashboardController::class, 'index'])->name('dashboard');

            Route::get('/curricula', [SchoolCurriculumController::class, 'index'])->name('curricula.index');
            Route::post('/curricula', [SchoolCurriculumController::class, 'store'])->name('curricula.store');
            Route::put('/curricula/{curriculum}', [SchoolCurriculumController::class, 'update'])->name('curricula.update');
            Route::delete('/curricula/{curriculum}', [SchoolCurriculumController::class, 'destroy'])->name('curricula.destroy');

            Route::get('/subjects', [SchoolSubjectController::class, 'index'])->name('subjects.index');
            Route::post('/subjects', [SchoolSubjectController::class, 'store'])->name('subjects.store');
            Route::put('/subjects/{subject}', [SchoolSubjectController::class, 'update'])->name('subjects.update');
            Route::delete('/subjects/{subject}', [SchoolSubjectController::class, 'destroy'])->name('subjects.destroy');

            Route::get('/exams', [SchoolExamController::class, 'index'])->name('exams.index');
            Route::post('/exams', [SchoolExamController::class, 'store'])->name('exams.store');
            Route::get('/exams/{exam}', [SchoolExamController::class, 'show'])->name('exams.show');
            Route::put('/exams/{exam}', [SchoolExamController::class, 'update'])->name('exams.update');
            Route::delete('/exams/{exam}', [SchoolExamController::class, 'destroy'])->name('exams.destroy');
            Route::post('/exams/{exam}/publish', [SchoolExamController::class, 'publish'])->name('exams.publish');
            Route::get('/exams/{exam}/results', [SchoolExamController::class, 'results'])->name('exams.results');

            Route::get('/exam-papers/{examPaper}/marks', [SchoolMarkEntryController::class, 'index'])->name('marks.index');
            Route::post('/exam-papers/{examPaper}/marks', [SchoolMarkEntryController::class, 'save'])->name('marks.save');
            Route::get('/exam-papers/{examPaper}/stats', [SchoolMarkEntryController::class, 'getStats'])->name('marks.stats');

            Route::get('/timetable', [SchoolTimetableController::class, 'index'])->name('timetable.index');
            Route::post('/timetable', [SchoolTimetableController::class, 'store'])->name('timetable.store');
            Route::put('/timetable/{timetableEntry}', [SchoolTimetableController::class, 'update'])->name('timetable.update');
            Route::delete('/timetable/{timetableEntry}', [SchoolTimetableController::class, 'destroy'])->name('timetable.destroy');
            Route::get('/timetable/class/{gradeClass}', [SchoolTimetableController::class, 'classTimetable'])->name('timetable.class');
            Route::get('/timetable/teacher/{teacher}', [SchoolTimetableController::class, 'teacherTimetable'])->name('timetable.teacher');
            Route::post('/timetable/check-conflicts', [SchoolTimetableController::class, 'checkConflicts'])->name('timetable.check-conflicts');
            Route::post('/timetable/reorder', [SchoolTimetableController::class, 'reorder'])->name('timetable.reorder');

            Route::get('/grade-scales', [SchoolGradeScaleController::class, 'index'])->name('grade-scales.index');
            Route::post('/grade-scales', [SchoolGradeScaleController::class, 'store'])->name('grade-scales.store');
            Route::put('/grade-scales/{gradeScale}', [SchoolGradeScaleController::class, 'update'])->name('grade-scales.update');
            Route::delete('/grade-scales/{gradeScale}', [SchoolGradeScaleController::class, 'destroy'])->name('grade-scales.destroy');

            // Learning Areas (nested under curricula)
            Route::get('/curricula/{curriculum}/learning-areas', [SchoolLearningAreaController::class, 'index'])->name('learning-areas.index');
            Route::post('/curricula/{curriculum}/learning-areas', [SchoolLearningAreaController::class, 'store'])->name('learning-areas.store');
            Route::put('/curricula/{curriculum}/learning-areas/{learningArea}', [SchoolLearningAreaController::class, 'update'])->name('learning-areas.update');
            Route::delete('/curricula/{curriculum}/learning-areas/{learningArea}', [SchoolLearningAreaController::class, 'destroy'])->name('learning-areas.destroy');

            // Lesson Plans
            Route::get('/lesson-plans', [SchoolLessonPlanController::class, 'index'])->name('lesson-plans.index');
            Route::post('/lesson-plans', [SchoolLessonPlanController::class, 'store'])->name('lesson-plans.store');
            Route::put('/lesson-plans/{lessonPlan}', [SchoolLessonPlanController::class, 'update'])->name('lesson-plans.update');
            Route::delete('/lesson-plans/{lessonPlan}', [SchoolLessonPlanController::class, 'destroy'])->name('lesson-plans.destroy');

            // Academic Classes
            Route::get('/academic-classes', [SchoolAcademicClassController::class, 'index'])->name('academic-classes.index');
            Route::post('/academic-classes', [SchoolAcademicClassController::class, 'store'])->name('academic-classes.store');
            Route::put('/academic-classes/{academicClass}', [SchoolAcademicClassController::class, 'update'])->name('academic-classes.update');
            Route::delete('/academic-classes/{academicClass}', [SchoolAcademicClassController::class, 'destroy'])->name('academic-classes.destroy');

            // Streams (nested under academic-classes)
            Route::post('/academic-classes/{academicClass}/streams', [SchoolStreamController::class, 'store'])->name('streams.store');
            Route::put('/academic-classes/{academicClass}/streams/{stream}', [SchoolStreamController::class, 'update'])->name('streams.update');
            Route::delete('/academic-classes/{academicClass}/streams/{stream}', [SchoolStreamController::class, 'destroy'])->name('streams.destroy');
        });
    });

// Accountant Routes
Route::prefix('accountant')
    ->middleware(['auth', 'verified', 'role:accountant', 'school.access'])
    ->name('accountant.')
    ->group(function () {
        Route::get('/dashboard', [AccountantDashboardController::class, 'index'])->name('dashboard');
        
        // Invoice management
        Route::get('/invoicing', [AccountantInvoiceController::class, 'index'])->name('invoicing');
        Route::resource('invoices', AccountantInvoiceController::class);
        Route::post('/invoices/{invoice}/send', [AccountantInvoiceController::class, 'send'])->name('invoices.send');
        Route::post('/invoices/{invoice}/void', [AccountantInvoiceController::class, 'void'])->name('invoices.void');
        Route::post('/invoices/{invoice}/mark-paid', [AccountantInvoiceController::class, 'markPaid'])->name('invoices.mark-paid');
        Route::post('/invoices/bulk-generate', [AccountantInvoiceController::class, 'bulkGenerate'])->name('invoices.bulk-generate');
        Route::post('/invoices/bulk-send', [AccountantInvoiceController::class, 'bulkSend'])->name('invoices.bulk-send');
        Route::post('/invoices/bulk-void', [AccountantInvoiceController::class, 'bulkVoid'])->name('invoices.bulk-void');
        
        // Payment viewing
        Route::get('/payments', [AccountantPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [AccountantPaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments', [AccountantPaymentController::class, 'store'])->name('payments.store');
        Route::post('/payments/{payment}/approve', [AccountantPaymentController::class, 'approve'])->name('payments.approve');
        Route::post('/payments/{payment}/reject', [AccountantPaymentController::class, 'reject'])->name('payments.reject');
        
        // Reconciliation
        Route::get('/reconciliation', [AccountantReconciliationController::class, 'index'])->name('reconciliation.index');
        Route::post('/reconciliation/match', [AccountantReconciliationController::class, 'match'])->name('reconciliation.match');
        Route::post('/reconciliation/confirm', [AccountantReconciliationController::class, 'confirm'])->name('reconciliation.confirm');
        Route::post('/reconciliation/unmatch', [AccountantReconciliationController::class, 'unmatch'])->name('reconciliation.unmatch');
        Route::post('/reconciliation/auto-match', [AccountantReconciliationController::class, 'autoMatch'])->name('reconciliation.auto-match');
        Route::post('/reconciliation/import-statement', [AccountantReconciliationController::class, 'importStatement'])->name('reconciliation.import-statement');
        
        // Expense management
        Route::resource('expenses', AccountantExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('/expenses/{expense}/approve', [AccountantExpenseController::class, 'approve'])->name('expenses.approve');
        Route::post('/expenses/{expense}/reject', [AccountantExpenseController::class, 'reject'])->name('expenses.reject');
        
        // Reports
        Route::get('/reports', [AccountantReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/generate', [AccountantReportController::class, 'generate'])->name('reports.generate');
        Route::get('/reports/download', [AccountantReportController::class, 'download'])->name('reports.download');
        
        // Fee Structures (uses School controller)
        Route::get('/fee-structures', [SchoolFeeStructureController::class, 'index'])->name('fee-structures.index');
        
        // Payment Gateway/Methods (uses School controller)
        Route::get('/payment-gateway', [SchoolPaymentMethodController::class, 'index'])->name('payment-gateway.index');
        
        // Integrations
        Route::get('/integrations', [AccountantIntegrationController::class, 'index'])->name('integrations.index');
    });

// Parent Routes
Route::prefix('parent')
    ->middleware(['auth', 'verified', 'role:parent'])
    ->name('parent.')
    ->group(function () {
        Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');
        
        // Children management
        Route::get('/children', [ParentChildrenController::class, 'index'])->name('children.index');
        Route::get('/children/{student}', [ParentChildrenController::class, 'show'])->name('children.show');
        
        // Payment routes
        Route::post('/children/{student}/pay', [ParentPaymentController::class, 'initiate'])->name('payment.initiate');
        Route::get('/children/{student}/pay/{transaction}/status', [ParentPaymentController::class, 'status'])->name('payment.status');
        Route::post('/children/{student}/pay/confirm', [ParentPaymentController::class, 'confirm'])->name('payment.confirm');
        Route::get('/payments', [ParentPaymentController::class, 'index'])->name('payments.index');
        
        // Receipt routes
        Route::get('/receipts', [ParentReceiptController::class, 'index'])->name('receipts.index');
        Route::get('/receipts/{receipt}', [ParentReceiptController::class, 'show'])->name('receipts.show');
        Route::get('/receipts/{receipt}/download', [ParentReceiptController::class, 'download'])->name('receipts.download');

        // Health routes (per student)
        Route::get('/children/{student}/health', [ParentHealthController::class, 'show'])->name('children.health');

        // Portfolio routes (per student)
        Route::get('/children/{student}/portfolio', [ParentPortfolioController::class, 'show'])->name('children.portfolio');

        // PT Meetings routes
        Route::get('/pt-meetings', [ParentPTMeetingsController::class, 'index'])->name('pt-meetings.index');
        Route::post('/pt-meetings', [ParentPTMeetingsController::class, 'store'])->name('pt-meetings.store');
        Route::post('/pt-meetings/{booking}/cancel', [ParentPTMeetingsController::class, 'cancel'])->name('pt-meetings.cancel');
    });

// Fallback route - redirect to appropriate dashboard based on user role
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    $user = auth()->user();
    
    if ($user->hasRole('super_admin')) {
        return redirect()->route('admin.dashboard');
    } elseif ($user->hasRole('school_admin')) {
        return redirect()->route('school.dashboard');
    } elseif ($user->hasRole('accountant')) {
        return redirect()->route('accountant.dashboard');
    } elseif ($user->hasRole('parent')) {
        return redirect()->route('parent.dashboard');
    }
    
    abort(403, 'Unauthorized access');
})->name('dashboard');

require __DIR__.'/auth.php';
