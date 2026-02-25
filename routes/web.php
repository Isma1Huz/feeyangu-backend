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
use App\Http\Controllers\Accountant\DashboardController as AccountantDashboardController;
use App\Http\Controllers\Accountant\InvoiceController as AccountantInvoiceController;
use App\Http\Controllers\Accountant\PaymentController as AccountantPaymentController;
use App\Http\Controllers\Accountant\ReconciliationController as AccountantReconciliationController;
use App\Http\Controllers\Accountant\ExpenseController as AccountantExpenseController;
use App\Http\Controllers\Accountant\ReportController as AccountantReportController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\Parent\ChildrenController as ParentChildrenController;
use App\Http\Controllers\Parent\PaymentController as ParentPaymentController;
use App\Http\Controllers\Parent\ReceiptController as ParentReceiptController;
use Illuminate\Support\Facades\Route;

// Welcome/Landing page
Route::get('/', function () {
    return redirect()->route('login');
});

// Super Admin Routes
Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:super_admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::resource('schools', AdminSchoolController::class);
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
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
        
        // Payment viewing
        Route::get('/payments', [SchoolPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [SchoolPaymentController::class, 'show'])->name('payments.show');
        
        // Receipt viewing
        Route::get('/receipts', [SchoolReceiptController::class, 'index'])->name('receipts.index');
        Route::get('/receipts/{receipt}', [SchoolReceiptController::class, 'show'])->name('receipts.show');
    });

// Accountant Routes
Route::prefix('accountant')
    ->middleware(['auth', 'verified', 'role:accountant', 'school.access'])
    ->name('accountant.')
    ->group(function () {
        Route::get('/dashboard', [AccountantDashboardController::class, 'index'])->name('dashboard');
        
        // Invoice management
        Route::resource('invoices', AccountantInvoiceController::class);
        Route::post('/invoices/{invoice}/send', [AccountantInvoiceController::class, 'send'])->name('invoices.send');
        
        // Payment viewing
        Route::get('/payments', [AccountantPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [AccountantPaymentController::class, 'show'])->name('payments.show');
        
        // Reconciliation
        Route::get('/reconciliation', [AccountantReconciliationController::class, 'index'])->name('reconciliation.index');
        Route::post('/reconciliation/match', [AccountantReconciliationController::class, 'match'])->name('reconciliation.match');
        
        // Expense management
        Route::resource('expenses', AccountantExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('/expenses/{expense}/approve', [AccountantExpenseController::class, 'approve'])->name('expenses.approve');
        Route::post('/expenses/{expense}/reject', [AccountantExpenseController::class, 'reject'])->name('expenses.reject');
        
        // Reports
        Route::get('/reports', [AccountantReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/generate', [AccountantReportController::class, 'generate'])->name('reports.generate');
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
