<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentCallbackController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\PDFController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\BulkOperationController;
use App\Http\Controllers\Api\HealthCheckController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Payment API routes
Route::prefix('payments')->group(function () {
    // Payment callback webhooks (no auth required, verified by IP and signature)
    Route::post('/callback/{provider}', [PaymentCallbackController::class, 'handle'])
        ->name('api.payment.callback')
        ->middleware('payment.callback');

    // School-aware callback: includes school ID so webhooks work without subdomain routing
    Route::post('/callback/{provider}/{school}', [PaymentCallbackController::class, 'handle'])
        ->name('api.payment.callback.school')
        ->middleware('payment.callback');

    // Authenticated payment status and confirmation endpoints
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/{transaction}/status', [PaymentCallbackController::class, 'status'])
            ->name('api.payment.status');
        
        Route::post('/{transaction}/confirm', [PaymentCallbackController::class, 'confirmManual'])
            ->name('api.payment.confirm');
    });
});

// Notification API routes (authenticated)
Route::middleware(['auth:sanctum'])->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('api.notifications.index');
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('api.notifications.unread-count');
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.mark-read');
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('api.notifications.destroy');
});

// Search API routes (authenticated)
Route::middleware(['auth:sanctum'])->prefix('search')->group(function () {
    Route::get('/students', [SearchController::class, 'students'])->name('api.search.students');
    Route::get('/invoices', [SearchController::class, 'invoices'])->name('api.search.invoices');
    Route::get('/receipts', [SearchController::class, 'receipts'])->name('api.search.receipts');
    Route::get('/global', [SearchController::class, 'global'])->name('api.search.global');
});

// PDF Generation API routes (authenticated)
Route::middleware(['auth:sanctum'])->prefix('pdf')->group(function () {
    Route::get('/receipt/{id}', [PDFController::class, 'receipt'])->name('api.pdf.receipt');
    Route::get('/invoice/{id}', [PDFController::class, 'invoice'])->name('api.pdf.invoice');
    Route::get('/student-report/{id}', [PDFController::class, 'studentReport'])->name('api.pdf.student-report');
    Route::post('/financial-statement', [PDFController::class, 'financialStatement'])->name('api.pdf.financial-statement');
});

// Reporting API routes (authenticated)
Route::middleware(['auth:sanctum'])->prefix('reports')->group(function () {
    Route::post('/financial-summary', [ReportController::class, 'financialSummary'])->name('api.reports.financial-summary');
    Route::get('/student-enrollment', [ReportController::class, 'studentEnrollment'])->name('api.reports.student-enrollment');
    Route::post('/payment-collection', [ReportController::class, 'paymentCollection'])->name('api.reports.payment-collection');
    Route::get('/fee-arrears', [ReportController::class, 'feeArrears'])->name('api.reports.fee-arrears');
    Route::post('/expenses', [ReportController::class, 'expenses'])->name('api.reports.expenses');
    Route::get('/dashboard-kpis', [ReportController::class, 'dashboardKPIs'])->name('api.reports.dashboard-kpis');
});

// Export API routes (authenticated)
Route::middleware(['auth:sanctum'])->prefix('export')->group(function () {
    Route::get('/students', [ExportController::class, 'students'])->name('api.export.students');
    Route::get('/invoices', [ExportController::class, 'invoices'])->name('api.export.invoices');
    Route::get('/payments', [ExportController::class, 'payments'])->name('api.export.payments');
    Route::get('/receipts', [ExportController::class, 'receipts'])->name('api.export.receipts');
});

// Bulk Operations API routes (authenticated, school_admin/accountant only)
Route::middleware(['auth:sanctum', 'role:school_admin|accountant'])->prefix('bulk')->group(function () {
    Route::post('/generate-invoices', [BulkOperationController::class, 'generateInvoices'])->name('api.bulk.generate-invoices');
    Route::post('/send-invoices', [BulkOperationController::class, 'sendInvoices'])->name('api.bulk.send-invoices');
    Route::post('/import-students', [BulkOperationController::class, 'importStudents'])->name('api.bulk.import-students');
    Route::post('/update-student-status', [BulkOperationController::class, 'updateStudentStatus'])->name('api.bulk.update-student-status');
});

// Health Check API routes (public)
Route::prefix('health')->group(function () {
    Route::get('/', [HealthCheckController::class, 'index'])->name('api.health.index');
    Route::get('/stats', [HealthCheckController::class, 'stats'])->name('api.health.stats');
});

