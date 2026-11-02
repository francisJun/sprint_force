<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\ArbzgDailyLimitRule;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;

beforeEach(function () {
    $supplier = Supplier::create(['name' => 'Consulting Group GmbH']);
    $this->consultant = User::create([
        'name' => 'Stefan Meyer',
        'email' => 'stefan@consulting.de',
        'password' => bcrypt('password'),
        'role' => 'consultant',
        'supplier_id' => $supplier->id,
    ]);

    $this->order = PurchaseOrder::create([
        'order_number' => 'PO-888',
        'title' => 'Security Audit',
        'total_person_days' => 40.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $supplier->id,
    ]);

    $this->rule = new ArbzgDailyLimitRule;
});

test('accepts booking of 8 hours or less without statutory warning', function () {
    $eval = $this->rule->evaluate($this->consultant->id, '2026-11-04', 8.0);

    expect($eval['total_hours'])->toBe(8.0);
    expect($eval['requires_compensatory_rest'])->toBeFalse();
    expect($eval['warning'])->toBeNull();
});

test('accepts booking between 8 and 10 hours with compensatory rest warning flag', function () {
    // 9.0 hours: legally permitted up to 10h under ArbZG § 3 Satz 2, but requires compensatory rest
    $eval = $this->rule->evaluate($this->consultant->id, '2026-11-04', 9.0);

    expect($eval['total_hours'])->toBe(9.0);
    expect($eval['requires_compensatory_rest'])->toBeTrue();
    expect($eval['warning'])->toContain('ArbZG § 3 statutory notice: Working time exceeds 8 h (9.0 h)');
    expect($eval['warning'])->toContain('compensatory rest required within 6 calendar months');
});

test('rejects booking exceeding statutory 10 hour daily limit', function () {
    // Consultant books 6.0 hours first
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 6.0,
        'description' => 'Morning shift',
        'status' => 'submitted',
    ]);

    // Attempting to book an additional 5.0 hours (total 11.0 hours) exceeds legal 10h ceiling
    expect(fn () => $this->rule->evaluate($this->consultant->id, '2026-11-04', 5.0))
        ->toThrow(
            BookingValidationException::class,
            'ArbZG § 3 violation: Maximum daily working time is 10 hours'
        );
});

test('accepts booking of exactly 10.0 hours as edge case', function () {
    // Edge case: exactly 10.0 hours on the statutory maximum boundary
    $eval = $this->rule->evaluate($this->consultant->id, '2026-11-04', 10.0);

    expect($eval['total_hours'])->toBe(10.0);
    expect($eval['requires_compensatory_rest'])->toBeTrue();
    expect($eval['warning'])->toContain('ArbZG § 3 statutory notice');
});
