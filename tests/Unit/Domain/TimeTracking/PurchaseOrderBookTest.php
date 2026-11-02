<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;

beforeEach(function () {
    $this->supplier = Supplier::create(['name' => 'Acme Consulting GmbH']);
    $this->consultant = User::create([
        'name' => 'Jonas Fischer',
        'email' => 'jonas@acme.de',
        'password' => bcrypt('password'),
        'role' => 'consultant',
        'supplier_id' => $this->supplier->id,
    ]);

    $this->order = PurchaseOrder::create([
        'order_number' => '4500044556',
        'title' => 'ERP Migration',
        'total_person_days' => 20.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $this->supplier->id,
    ]);
});

test('successfully books time through PurchaseOrder entity domain method', function () {
    $booking = $this->order->book($this->consultant, [
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '17:00',
        'hours' => 8.0,
        'description' => 'Module development and unit testing',
    ]);

    expect($booking)->toBeInstanceOf(TimeBooking::class);
    expect($booking->purchase_order_id)->toBe($this->order->id);
    expect($booking->user_id)->toBe($this->consultant->id);
    expect((float) $booking->hours)->toBe(8.0);
    expect($booking->requires_compensatory_rest)->toBeFalse();
    expect($booking->status)->toBe('submitted');
});

test('rejects booking through PurchaseOrder entity domain method when free budget is exceeded', function () {
    // Fill up the order: 20 PD = 160 hours
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-10-15',
        'hours' => 152.0, // 19.0 PD used, 1.0 PD (8h) left
        'description' => 'Bulk previous sprints',
        'status' => 'approved',
    ]);

    expect($this->order->remainingPersonDays())->toBe(1.0);

    // Consultant tries to book 16.0 hours (2.0 PD) through Order.book()
    expect(fn () => $this->order->book($this->consultant, [
        'date' => '2026-11-04',
        'hours' => 16.0,
        'description' => 'Two full days of work',
    ]))->toThrow(
        BookingValidationException::class,
        'Booking rejected: only 1 PD left on order 4500044556'
    );
});

test('sets compensatory rest flag when booking between 8 and 10 hours through domain method', function () {
    $booking = $this->order->book($this->consultant, [
        'date' => '2026-11-04',
        'start_time' => '08:00',
        'end_time' => '17:30',
        'hours' => 9.5,
        'description' => 'Extended deployment day',
    ]);

    expect($booking->requires_compensatory_rest)->toBeTrue();
    expect($booking->statutory_notes)->toContain('ArbZG § 3 statutory notice: Working time exceeds 8 h (9.5 h)');
});

