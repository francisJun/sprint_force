<?php

namespace App\Domain\TimeTracking\Rules;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Models\VacationBlock;
use Carbon\Carbon;

class NoApprovedVacationRule
{
    /**
     * Validate that the consultant does not book time on an approved vacation day.
     *
     * @throws BookingValidationException
     */
    public function validate(int $userId, string $date): void
    {
        $dateStr = Carbon::parse($date)->format('Y-m-d');

        $vacation = VacationBlock::query()
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $dateStr)
            ->whereDate('end_date', '>=', $dateStr)
            ->first();

        if ($vacation) {
            $startFmt = Carbon::parse($vacation->start_date)->format('Y-m-d');
            $endFmt = Carbon::parse($vacation->end_date)->format('Y-m-d');

            throw new BookingValidationException(
                "Booking rejected: Date {$dateStr} falls within approved vacation block from {$startFmt} to {$endFmt}",
                'approved_vacation_block',
                'date'
            );
        }
    }
}

