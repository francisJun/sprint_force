<?php

use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\TimeBookingController;
use App\Http\Controllers\VacationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dedicated Project Lead Views
    Route::get('/orders', [DashboardController::class, 'orders'])->name('orders.index');
    Route::get('/approvals', [DashboardController::class, 'approvals'])->name('approvals.index');

    // Dedicated Purchasing Views
    Route::get('/purchasing/orders', [DashboardController::class, 'purchasingOrders'])->name('purchasing.orders');
    Route::get('/purchasing/invoices', [DashboardController::class, 'purchasingInvoices'])->name('purchasing.invoices');

    // Time Booking Actions
    Route::post('/bookings', [TimeBookingController::class, 'store'])->name('bookings.store');
    Route::post('/bookings/{timeBooking}/approve', [TimeBookingController::class, 'approve'])->name('bookings.approve');
    Route::post('/bookings/{timeBooking}/reject', [TimeBookingController::class, 'reject'])->name('bookings.reject');

    // Vacation Actions
    Route::post('/vacations', [VacationController::class, 'store'])->name('vacations.store');
    Route::delete('/vacations/{vacationBlock}', [VacationController::class, 'destroy'])->name('vacations.destroy');

    // AI RAG Chatbot (SSE Stream)
    Route::post('/chat/stream', [ChatbotController::class, 'stream'])->name('chat.stream');
});

require __DIR__.'/settings.php';
