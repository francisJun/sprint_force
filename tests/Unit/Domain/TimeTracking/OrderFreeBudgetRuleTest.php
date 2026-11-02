<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\OrderFreeBudgetRule;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;

beforeEach(function () {
    $supplier = Supplier::create(['name' => 'Tech Corp GmbH']);
    $this->consultant = User::create([
        'name' => 'Alice Consultant',
        'email' => 'alice@test.de',
        'password' => bcrypt('secret'),
        'role' => 'consultant',
        'supplier_id' => $supplier->id,
    ]);

    $this->order = PurchaseOrder::create([
        'order_number' => '4500012345',
        'title' => 'Core Modernization',
        'total_person_days' => 10.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $supplier->id,
    ]);

    $this->rule = new OrderFreeBudgetRule;
});

test('accepts booking within free budget', function () {
    // 10.0 PD total = 80 hours. Booking 8.0 hours (1.0 PD) is well within free budget.
    $this->rule->validate($this->order, 8.0);
    expect(true)->toBeTrue();
});

test('rejects booking beyond free budget with clear remaining PD message', function () {
    // Order has 10.0 PD total. Simulate 7.5 PD already approved (60 hours), leaving 2.5 PD.
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-10-10',
        'hours' => 60.0,
        'description' => 'Initial sprint development',
        'status' => 'approved',
    ]);

    expect($this->order->remainingPersonDays())->toBe(2.5);

    // Consultant tries to book 3.0 PD (24 hours), which exceeds remaining 2.5 PD
    expect(fn () => $this->rule->validate($this->order, 24.0))
        ->toThrow(
            BookingValidationException::class,
            'Booking rejected: only 2.5 PD left on order 4500012345'
        );
});

test('accepts booking that consumes exactly the remaining free budget', function () {
    // Edge case: exactly 2.5 PD left (20 hours requested against 2.5 PD remaining)
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-10-12',
        'hours' => 60.0,
        'description' => 'Initial sprint development',
        'status' => 'approved',
    ]);

    expect($this->order->remainingPersonDays())->toBe(2.5);

    // Exact edge case: 20 hours = exactly 2.5 PD
    $this->rule->validate($this->order, 20.0);
    expect(true)->toBeTrue();
});

