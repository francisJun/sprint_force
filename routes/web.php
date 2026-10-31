<?php

use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TimeBookingController;
use App\Http\Controllers\VacationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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
