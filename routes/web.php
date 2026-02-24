<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SchoolController as AdminSchoolController;
use App\Http\Controllers\School\DashboardController as SchoolDashboardController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
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
        
        // Additional parent routes will be added here
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
