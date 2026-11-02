<?php

namespace App\Domain\TimeTracking\Rules;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Models\TimeBooking;
use Carbon\Carbon;

/**
 * German Working Time Act (ArbZG § 5 Abs. 1):
 * Employees must have an uninterrupted rest period of at least 11 hours
 * after finishing daily working time before resuming work.
 */
class ArbzgRestPeriodRule
{
    /**
     * Validate that at least 11 consecutive hours of rest elapse between shifts.
     *
     * @throws BookingValidationException
     */
    public function validate(
        int $userId,
        string $date,
        ?string $startTime = null,
        ?string $endTime = null,
        ?int $ignoreBookingId = null
    ): void {
        if (! $startTime || ! $endTime) {
            return;
        }

        $currentDate = Carbon::parse($date)->format('Y-m-d');
        $currStart = Carbon::parse("{$currentDate} {$startTime}");
        $currEnd = Carbon::parse("{$currentDate} {$endTime}");

        // 1. Check previous day's latest ending booking
        $previousDate = Carbon::parse($date)->subDay()->format('Y-m-d');
        $prevLatestBooking = TimeBooking::query()
            ->where('user_id', $userId)
            ->whereDate('date', $previousDate)
            ->where('status', '!=', 'rejected')
            ->whereNotNull('end_time')
            ->when($ignoreBookingId, fn ($q) => $q->where('id', '!=', $ignoreBookingId))
            ->orderByDesc('end_time')
            ->first();

        if ($prevLatestBooking && $prevLatestBooking->end_time) {
            $prevEnd = Carbon::parse("{$previousDate} {$prevLatestBooking->end_time}");
            $restMinutes = $prevEnd->diffInMinutes($currStart, false);
            $restHours = sprintf('%.1f', $restMinutes / 60.0);

            if ((float) $restHours < 11.0) {
                $prevEndFmt = $prevEnd->format('Y-m-d H:i');
                $currStartFmt = $currStart->format('Y-m-d H:i');

                throw new BookingValidationException(
                    "ArbZG § 5 violation: Rest period between {$prevEndFmt} and {$currStartFmt} is only {$restHours} h (statutory minimum is 11.0 h)",
                    'arbzg_rest_period_previous_day',
                    'start_time'
                );
            }
        }

        // 2. Check next day's earliest starting booking
        $nextDate = Carbon::parse($date)->addDay()->format('Y-m-d');
        $nextEarliestBooking = TimeBooking::query()
            ->where('user_id', $userId)
            ->whereDate('date', $nextDate)
            ->where('status', '!=', 'rejected')
            ->whereNotNull('start_time')
            ->when($ignoreBookingId, fn ($q) => $q->where('id', '!=', $ignoreBookingId))
            ->orderBy('start_time')
            ->first();

        if ($nextEarliestBooking && $nextEarliestBooking->start_time) {
            $nextStart = Carbon::parse("{$nextDate} {$nextEarliestBooking->start_time}");
            $restMinutes = $currEnd->diffInMinutes($nextStart, false);
            $restHours = sprintf('%.1f', $restMinutes / 60.0);

            if ((float) $restHours < 11.0) {
                $currEndFmt = $currEnd->format('Y-m-d H:i');
                $nextStartFmt = $nextStart->format('Y-m-d H:i');

                throw new BookingValidationException(
                    "ArbZG § 5 violation: Rest period between {$currEndFmt} and {$nextStartFmt} is only {$restHours} h (statutory minimum is 11.0 h)",
                    'arbzg_rest_period_next_day',
                    'end_time'
                );
            }
        }
    }
}
