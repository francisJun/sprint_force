<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\ArbzgRestPeriodRule;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;

beforeEach(function () {
    $supplier = Supplier::create(['name' => 'IT Services AG']);
    $this->consultant = User::create([
        'name' => 'Max Schneider',
        'email' => 'max@itservices.de',
        'password' => bcrypt('password'),
        'role' => 'consultant',
        'supplier_id' => $supplier->id,
    ]);

    $this->order = PurchaseOrder::create([
        'order_number' => 'PO-REST-01',
        'title' => 'Migration Wave 1',
        'total_person_days' => 30.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $supplier->id,
    ]);

    $this->rule = new ArbzgRestPeriodRule;
});

test('accepts next-day booking with 11 or more hours of rest', function () {
    // Monday finishes at 18:00
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-02',
        'start_time' => '09:00',
        'end_time' => '18:00',
        'hours' => 9.0,
        'description' => 'Monday shift',
        'status' => 'submitted',
    ]);

    // Tuesday starts at 08:00 (14.0 hours rest >= 11.0h) -> accepted
    $this->rule->validate($this->consultant->id, '2026-11-03', '08:00', '16:00');
    expect(true)->toBeTrue();
});

test('rejects next-day booking with less than 11 hours of rest between shifts', function () {
    // Monday late shift finishes at 22:00
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-02',
        'start_time' => '14:00',
        'end_time' => '22:00',
        'hours' => 8.0,
        'description' => 'Monday evening deployment',
        'status' => 'submitted',
    ]);

    // Tuesday early shift starts at 07:00 (only 9.0 hours rest between 22:00 and 07:00)
    expect(fn () => $this->rule->validate($this->consultant->id, '2026-11-03', '07:00', '15:00'))
        ->toThrow(
            BookingValidationException::class,
            'ArbZG § 5 violation: Rest period between 2026-11-02 22:00 and 2026-11-03 07:00 is only 9.0 h (statutory minimum is 11.0 h)'
        );
});

test('accepts next-day booking with exactly 11.0 hours of rest as edge case', function () {
    // Monday finishes at 21:00
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-02',
        'start_time' => '13:00',
        'end_time' => '21:00',
        'hours' => 8.0,
        'description' => 'Monday afternoon shift',
        'status' => 'submitted',
    ]);

    // Tuesday starts at exactly 08:00 (exactly 11.0 hours rest boundary)
    $this->rule->validate($this->consultant->id, '2026-11-03', '08:00', '16:00');
    expect(true)->toBeTrue();
});

