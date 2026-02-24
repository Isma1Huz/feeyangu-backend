<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SchoolController as AdminSchoolController;
use App\Http\Controllers\School\DashboardController as SchoolDashboardController;
use App\Http\Controllers\School\StudentController as SchoolStudentController;
use App\Http\Controllers\School\GradeController as SchoolGradeController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\Parent\ChildrenController as ParentChildrenController;
use App\Http\Controllers\Parent\PaymentController as ParentPaymentController;
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
        
        // Additional admin routes will be added here
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
        
        // Additional school admin routes will be added here
    });

// Accountant Routes
Route::prefix('accountant')
    ->middleware(['auth', 'verified', 'role:accountant', 'school.access'])
    ->name('accountant.')
    ->group(function () {
        // Accountant routes will be added here
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
