<?php

namespace App\Domain\TimeTracking\Rules;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Models\TimeBooking;
use Carbon\Carbon;

class NoOverlappingBookingsRule
{
    /**
     * Validate that one person does not have overlapping bookings on the same date.
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

        $formattedDate = Carbon::parse($date)->format('Y-m-d');
        $newStart = Carbon::parse("{$formattedDate} {$startTime}");
        $newEnd = Carbon::parse("{$formattedDate} {$endTime}");

        // If end time is before or equal to start time, that's an invalid interval
        if ($newEnd->lte($newStart)) {
            throw new BookingValidationException(
                "Booking rejected: end time ({$endTime}) must be after start time ({$startTime})",
                'invalid_time_interval',
                'end_time'
            );
        }

        $existingBookings = TimeBooking::query()
            ->where('user_id', $userId)
            ->whereDate('date', $formattedDate)
            ->where('status', '!=', 'rejected')
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->when($ignoreBookingId, fn ($q) => $q->where('id', '!=', $ignoreBookingId))
            ->get();

        foreach ($existingBookings as $existing) {
            $existingStart = Carbon::parse("{$formattedDate} {$existing->start_time}");
            $existingEnd = Carbon::parse("{$formattedDate} {$existing->end_time}");

            // Two intervals [A, B) and [C, D) overlap if max(A, C) < min(B, D)
            // Touching endpoints (e.g. 09:00-12:00 and 12:00-17:00) do NOT overlap
            $overlapStart = $newStart->gt($existingStart) ? $newStart : $existingStart;
            $overlapEnd = $newEnd->lt($existingEnd) ? $newEnd : $existingEnd;

            if ($overlapStart->lt($overlapEnd)) {
                $existingStartFmt = $existingStart->format('H:i');
                $existingEndFmt = $existingEnd->format('H:i');

                throw new BookingValidationException(
                    "Booking rejected: overlapping booking exists on {$formattedDate} between {$existingStartFmt} and {$existingEndFmt}",
                    'overlapping_booking',
                    'start_time'
                );
            }
        }
    }
}

