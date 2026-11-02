<?php

/** @var \Tests\TestCase $this */

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\ArbzgSundayHolidayRule;

beforeEach(function () {
    $this->rule = new ArbzgSundayHolidayRule;
});

test('accepts booking on a standard working weekday', function () {
    // 2026-11-04 is a Wednesday (regular working day)
    $this->rule->validate('2026-11-04', specialAuthorization: false);
    expect(true)->toBeTrue();
});

test('rejects booking on Sunday under ArbZG 9', function () {
    // 2026-11-01 is a Sunday
    expect(fn () => $this->rule->validate('2026-11-01', specialAuthorization: false))
        ->toThrow(
            BookingValidationException::class,
            'ArbZG § 9 violation: Work on Sundays is prohibited without special statutory authorization (ArbZG § 9 Abs. 1)'
        );
});

test('rejects booking on German statutory public holiday under ArbZG 9', function () {
    // 2026-10-03 is Tag der Deutschen Einheit (German Unity Day, statutory federal holiday)
    expect(fn () => $this->rule->validate('2026-10-03', specialAuthorization: false))
        ->toThrow(
            BookingValidationException::class,
            'ArbZG § 9 violation: Work on statutory public holiday (Tag der Deutschen Einheit) is prohibited without special statutory authorization (ArbZG § 9 Abs. 1)'
        );
});

test('accepts booking on Sunday or holiday when statutory special authorization is granted', function () {
    // Edge case: Critical weekend maintenance on Sunday with statutory exemption (ArbZG § 14)
    $this->rule->validate('2026-11-01', specialAuthorization: true);
    // Holiday with statutory exemption
    $this->rule->validate('2026-10-03', specialAuthorization: true);

    expect(true)->toBeTrue();
});

