<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SchoolController as AdminSchoolController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
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
        Route::resource('schools', AdminSchoolController::class);
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    });

// School Admin Routes
Route::prefix('school')
    ->middleware(['auth', 'verified', 'role:school_admin', 'school.access'])
    ->name('school.')
    ->group(function () {
        Route::get('/dashboard', [SchoolDashboardController::class, 'index'])->name('dashboard');
        
        // Student management
        Route::resource('students', SchoolStudentController::class);
        
        // Grade management
        Route::resource('grades', SchoolGradeController::class);
        
        // Class management
        Route::resource('classes', SchoolGradeClassController::class);
        
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
        
        // Billing
        Route::get('/billing', [SchoolBillingController::class, 'index'])->name('billing.index');
        
        // User/Accountant management
        Route::get('/users', [SchoolUserController::class, 'index'])->name('users.index');
        Route::post('/users', [SchoolUserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [SchoolUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [SchoolUserController::class, 'destroy'])->name('users.destroy');

        // PT Meetings
        Route::get('/pt-meetings', [SchoolPTMeetingController::class, 'index'])->name('pt-meetings.index');

        // Health
        Route::get('/health', [SchoolHealthController::class, 'index'])->name('health.index');

        // Portfolio
        Route::get('/portfolio', [SchoolPortfolioController::class, 'index'])->name('portfolio.index');
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
