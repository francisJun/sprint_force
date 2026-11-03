<?php

use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\TimeBookingController;
use App\Http\Controllers\VacationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

// Error Page Preview Route
Route::get('/error/{code}', function (int $code) {
    abort_if(! in_array($code, [403, 404, 419, 500, 503]), 404);

    if (request()->header('X-Inertia')) {
        return \Inertia\Inertia::render('error', [
            'status' => $code,
        ]);
    }

    return response()->view("errors.{$code}", [], $code);
})->name('error.preview');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dedicated Project Lead & Runway Views
    Route::get('/orders', [DashboardController::class, 'orders'])
        ->middleware('role:project_lead,purchasing,super_admin')
        ->name('orders.index');

    Route::get('/approvals', [DashboardController::class, 'approvals'])
        ->middleware('role:project_lead,super_admin')
        ->name('approvals.index');

    // Dedicated Purchasing Views
    Route::prefix('purchasing')
        ->middleware('role:purchasing,super_admin')
        ->name('purchasing.')
        ->group(function () {
            Route::get('/orders', [DashboardController::class, 'purchasingOrders'])->name('orders');
            Route::get('/invoices', [DashboardController::class, 'purchasingInvoices'])->name('invoices');
        });

    // Time Booking Actions
    Route::post('/bookings', [TimeBookingController::class, 'store'])->name('bookings.store');
    Route::post('/bookings/{timeBooking}/approve', [TimeBookingController::class, 'approve'])->name('bookings.approve');
    Route::post('/bookings/{timeBooking}/reject', [TimeBookingController::class, 'reject'])->name('bookings.reject');

    // Vacation Actions
    Route::post('/vacations', [VacationController::class, 'store'])->name('vacations.store');
    Route::delete('/vacations/{vacationBlock}', [VacationController::class, 'destroy'])->name('vacations.destroy');

    // AI RAG Chatbot (SSE Stream)
    Route::post('/chat/stream', [ChatbotController::class, 'stream'])->name('chat.stream');

    // Super Admin Governance & User Management
    Route::middleware([\App\Http\Middleware\EnsureSuperAdmin::class])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
            Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('users.store');
            Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
            Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
        });
});

require __DIR__.'/settings.php';
