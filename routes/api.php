<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentCallbackController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Payment API routes
Route::prefix('payments')->group(function () {
    // Payment callback webhooks (no auth required, verified by IP and signature)
    Route::post('/callback/{provider}', [PaymentCallbackController::class, 'handle'])
        ->name('api.payment.callback')
        ->middleware('payment.callback');

    // Authenticated payment status and confirmation endpoints
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/{transaction}/status', [PaymentCallbackController::class, 'status'])
            ->name('api.payment.status');
        
        Route::post('/{transaction}/confirm', [PaymentCallbackController::class, 'confirmManual'])
            ->name('api.payment.confirm');
    });
});

