<?php

namespace App\Domain\TimeTracking\Rules;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Services\GermanPublicHolidayService;
use Carbon\Carbon;

/**
 * German Working Time Act (ArbZG § 9):
 * Prohibition of employment on Sundays and statutory public holidays
 * from 00:00 to 24:00, unless special statutory authorization applies.
 */
class ArbzgSundayHolidayRule
{
    public function __construct(
        protected ?GermanPublicHolidayService $holidayService = null
    ) {
        $this->holidayService = $holidayService ?? new GermanPublicHolidayService;
    }

    /**
     * Validate that work is not scheduled on Sundays or German public holidays without authorization.
     *
     * @throws BookingValidationException
     */
    public function validate(
        string $date,
        bool $specialAuthorization = false,
        ?string $state = 'ALL'
    ): void {
        if ($specialAuthorization) {
            return;
        }

        $carbon = Carbon::parse($date);

        // 1. Sunday check (ArbZG § 9 Abs. 1)
        if ($carbon->isSunday()) {
            throw new BookingValidationException(
                'ArbZG § 9 violation: Work on Sundays is prohibited without special statutory authorization (ArbZG § 9 Abs. 1)',
                'arbzg_sunday_prohibition',
                'date'
            );
        }

        // 2. German statutory public holiday check (ArbZG § 9 Abs. 1)
        $holidayName = $this->holidayService->getHolidayName($carbon, $state);
        if ($holidayName !== null) {
            throw new BookingValidationException(
                "ArbZG § 9 violation: Work on statutory public holiday ({$holidayName}) is prohibited without special statutory authorization (ArbZG § 9 Abs. 1)",
                'arbzg_holiday_prohibition',
                'date'
            );
        }
    }
}

