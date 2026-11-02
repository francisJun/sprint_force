<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\NoApprovedVacationRule;
use App\Models\Supplier;
use App\Models\User;
use App\Models\VacationBlock;

beforeEach(function () {
    $supplier = Supplier::create(['name' => 'Expert Partners']);
    $this->consultant = User::create([
        'name' => 'Clara Hoffmann',
        'email' => 'clara@expert.de',
        'password' => bcrypt('password'),
        'role' => 'consultant',
        'supplier_id' => $supplier->id,
    ]);

    $this->rule = new NoApprovedVacationRule;
});

test('accepts booking on normal working day outside vacation blocks', function () {
    // Consultant has approved vacation in December
    VacationBlock::create([
        'user_id' => $this->consultant->id,
        'start_date' => '2026-12-20',
        'end_date' => '2026-12-31',
        'status' => 'approved',
    ]);

    // Booking in November is allowed
    $this->rule->validate($this->consultant->id, '2026-11-04');
    expect(true)->toBeTrue();
});

test('accepts booking on date with pending or rejected vacation request', function () {
    // Unapproved vacation request (pending manager review)
    VacationBlock::create([
        'user_id' => $this->consultant->id,
        'start_date' => '2026-11-10',
        'end_date' => '2026-11-14',
        'status' => 'pending',
    ]);

    // Rejected vacation request
    VacationBlock::create([
        'user_id' => $this->consultant->id,
        'start_date' => '2026-11-17',
        'end_date' => '2026-11-20',
        'status' => 'rejected',
    ]);

    $this->rule->validate($this->consultant->id, '2026-11-11');
    $this->rule->validate($this->consultant->id, '2026-11-18');
    expect(true)->toBeTrue();
});

test('rejects booking on date within an approved vacation block', function () {
    VacationBlock::create([
        'user_id' => $this->consultant->id,
        'start_date' => '2026-11-09',
        'end_date' => '2026-11-13',
        'status' => 'approved',
    ]);

    expect(fn () => $this->rule->validate($this->consultant->id, '2026-11-11'))
        ->toThrow(
            BookingValidationException::class,
            'Booking rejected: Date 2026-11-11 falls within approved vacation block from 2026-11-09 to 2026-11-13'
        );
});

test('rejects booking on exact start and end dates of approved vacation block', function () {
    // Edge case: boundary days (start date and end date) are included in the vacation
    VacationBlock::create([
        'user_id' => $this->consultant->id,
        'start_date' => '2026-11-09',
        'end_date' => '2026-11-13',
        'status' => 'approved',
    ]);

    // Start date boundary
    expect(fn () => $this->rule->validate($this->consultant->id, '2026-11-09'))
        ->toThrow(BookingValidationException::class);

    // End date boundary
    expect(fn () => $this->rule->validate($this->consultant->id, '2026-11-13'))
        ->toThrow(BookingValidationException::class);
});

test('accepts booking on the day immediately following vacation end date', function () {
    // Edge case: first day back from vacation
    VacationBlock::create([
        'user_id' => $this->consultant->id,
        'start_date' => '2026-11-09',
        'end_date' => '2026-11-13',
        'status' => 'approved',
    ]);

    // 2026-11-16 (Monday after Friday vacation ended)
    $this->rule->validate($this->consultant->id, '2026-11-16');
    expect(true)->toBeTrue();
});

