<?php

namespace App\Domain\TimeTracking\Services;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\ArbzgDailyLimitRule;
use App\Domain\TimeTracking\Rules\ArbzgRestPeriodRule;
use App\Domain\TimeTracking\Rules\ArbzgSundayHolidayRule;
use App\Domain\TimeTracking\Rules\NoApprovedVacationRule;
use App\Domain\TimeTracking\Rules\NoOverlappingBookingsRule;
use App\Domain\TimeTracking\Rules\OrderFreeBudgetRule;
use App\Models\PurchaseOrder;
use App\Models\User;

class TimeBookingValidator
{
    public function __construct(
        protected OrderFreeBudgetRule $freeBudgetRule = new OrderFreeBudgetRule,
        protected NoOverlappingBookingsRule $overlappingRule = new NoOverlappingBookingsRule,
        protected ArbzgDailyLimitRule $dailyLimitRule = new ArbzgDailyLimitRule,
        protected ArbzgRestPeriodRule $restPeriodRule = new ArbzgRestPeriodRule,
        protected ArbzgSundayHolidayRule $sundayHolidayRule = new ArbzgSundayHolidayRule,
        protected NoApprovedVacationRule $vacationRule = new NoApprovedVacationRule,
    ) {}

    /**
     * Validate all domain business rules for a proposed time booking.
     *
     * @param  array{
     *     date: string,
     *     hours: float,
     *     start_time?: ?string,
     *     end_time?: ?string,
     *     special_authorization?: bool,
     *     ignore_booking_id?: ?int,
     *     state?: ?string
     * }  $data
     * @return array{
     *     requires_compensatory_rest: bool,
     *     statutory_notes: ?string
     * }
     *
     * @throws BookingValidationException
     */
    public function validateBooking(PurchaseOrder $order, User $consultant, array $data): array
    {
        $hours = (float) ($data['hours'] ?? 0.0);
        $date = (string) ($data['date'] ?? '');
        $startTime = $data['start_time'] ?? null;
        $endTime = $data['end_time'] ?? null;
        $specialAuth = (bool) ($data['special_authorization'] ?? false);
        $ignoreId = $data['ignore_booking_id'] ?? null;
        $state = $data['state'] ?? 'ALL';

        // 1. Order Free Budget Rule
        $this->freeBudgetRule->validate($order, $hours);

        // 2. ArbZG § 9: Sunday and Statutory Public Holiday Rule
        $this->sundayHolidayRule->validate($date, $specialAuth, $state);

        // 3. Approved Vacation Block Rule
        $this->vacationRule->validate($consultant->id, $date);

        // 4. No Overlapping Bookings Rule
        if ($startTime && $endTime) {
            $this->overlappingRule->validate($consultant->id, $date, $startTime, $endTime, $ignoreId);
        }

        // 5. ArbZG § 5: 11-Hour Rest Period Rule
        if ($startTime && $endTime) {
            $this->restPeriodRule->validate($consultant->id, $date, $startTime, $endTime, $ignoreId);
        }

        // 6. ArbZG § 3: Daily 10-Hour Maximum Ceiling & 8-Hour Notice
        $dailyEval = $this->dailyLimitRule->evaluate($consultant->id, $date, $hours, $ignoreId);

        $notes = [];
        if ($dailyEval['warning']) {
            $notes[] = $dailyEval['warning'];
        }
        if ($specialAuth) {
            $notes[] = 'Statutory special authorization applied (ArbZG § 14/§ 15).';
        }

        return [
            'requires_compensatory_rest' => $dailyEval['requires_compensatory_rest'],
            'statutory_notes' => ! empty($notes) ? implode("\n", $notes) : null,
        ];
    }
}

