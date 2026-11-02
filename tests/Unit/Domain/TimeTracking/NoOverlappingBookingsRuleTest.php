<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\NoOverlappingBookingsRule;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;

beforeEach(function () {
    $supplier = Supplier::create(['name' => 'Advisory Partner AG']);
    $this->consultant = User::create([
        'name' => 'Lukas Weber',
        'email' => 'lukas@advisory.de',
        'password' => bcrypt('password'),
        'role' => 'consultant',
        'supplier_id' => $supplier->id,
    ]);

    $this->order = PurchaseOrder::create([
        'order_number' => 'PO-4500099',
        'title' => 'Process Optimization',
        'total_person_days' => 50.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $supplier->id,
    ]);

    $this->rule = new NoOverlappingBookingsRule;
});

test('accepts separate non-overlapping time bookings on the same day', function () {
    // Existing morning booking: 09:00 - 12:00
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '12:00',
        'hours' => 3.0,
        'description' => 'Morning architecture sync',
        'status' => 'submitted',
    ]);

    // Afternoon booking: 13:00 - 17:00 (1 hour gap) -> accepted
    $this->rule->validate($this->consultant->id, '2026-11-04', '13:00', '17:00');
    expect(true)->toBeTrue();
});

test('rejects booking overlapping with an existing time interval', function () {
    // Existing booking: 09:00 - 13:00
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '13:00',
        'hours' => 4.0,
        'description' => 'Implementation block',
        'status' => 'submitted',
    ]);

    // Overlapping attempt: 11:00 - 15:00
    expect(fn () => $this->rule->validate($this->consultant->id, '2026-11-04', '11:00', '15:00'))
        ->toThrow(
            BookingValidationException::class,
            'Booking rejected: overlapping booking exists on 2026-11-04 between 09:00 and 13:00'
        );
});

test('accepts contiguous bookings where end time matches next start time', function () {
    // Edge case: touching intervals (09:00 - 12:00 and 12:00 - 16:00)
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '12:00',
        'hours' => 3.0,
        'description' => 'Client meeting',
        'status' => 'submitted',
    ]);

    // Contiguous afternoon block starts exactly when morning ends
    $this->rule->validate($this->consultant->id, '2026-11-04', '12:00', '16:00');
    expect(true)->toBeTrue();
});

test('rejects booking when end time is before start time', function () {
    expect(fn () => $this->rule->validate($this->consultant->id, '2026-11-04', '17:00', '09:00'))
        ->toThrow(
            BookingValidationException::class,
            'Booking rejected: end time (09:00) must be after start time (17:00)'
        );
});

