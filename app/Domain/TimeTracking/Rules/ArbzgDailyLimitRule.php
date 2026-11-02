<?php

namespace App\Domain\TimeTracking\Rules;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Models\TimeBooking;
use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * German Working Time Act (ArbZG § 3):
 * - Reject bookings where total daily working time exceeds 10 hours.
 * - Issue statutory warning / flag when daily working time exceeds 8 hours (compensatory rest required).
 */
class ArbzgDailyLimitRule implements ValidationRule
{
    public function __construct(
        protected ?int $userId = null,
        protected ?string $date = null,
        protected ?int $ignoreBookingId = null
    ) {}

    /**
     * Domain evaluation method returning compliance evaluation.
     *
     * @return array{
     *     total_hours: float,
     *     requires_compensatory_rest: bool,
     *     warning: ?string
     * }
     *
     * @throws BookingValidationException
     */
    public function evaluate(int $userId, string $date, float $newHours, ?int $ignoreBookingId = null): array
    {
        if ($newHours <= 0) {
            throw new BookingValidationException(
                'The booked hours must be greater than zero.',
                'arbzg_positive_hours',
                'hours'
            );
        }

        $formattedDate = Carbon::parse($date)->format('Y-m-d');

        $query = TimeBooking::where('user_id', $userId)
            ->whereDate('date', $formattedDate)
            ->where('status', '!=', 'rejected');

        if ($ignoreBookingId) {
            $query->where('id', '!=', $ignoreBookingId);
        }

        $existingHours = (float) $query->sum('hours');
        $totalHours = round($existingHours + $newHours, 2);

        // Strict 10-hour statutory ceiling (ArbZG § 3 Satz 1 & 2)
        if ($totalHours > 10.0) {
            throw new BookingValidationException(
                sprintf(
                    'ArbZG § 3 violation: Maximum daily working time is 10 hours. Daily working time of %.1f h exceeds statutory 10-hour maximum ceiling',
                    $totalHours
                ),
                'arbzg_daily_ceiling',
                'hours'
            );
        }

        // Warning flag between 8h and 10h (ArbZG § 3 Satz 2: 6-month averaging requirement)
        $requiresCompensatoryRest = $totalHours > 8.0;
        $warning = $requiresCompensatoryRest
            ? sprintf(
                'ArbZG § 3 statutory notice: Working time exceeds 8 h (%.1f h); compensatory rest required within 6 calendar months (ArbZG § 3 Satz 2)',
                $totalHours
            )
            : null;

        return [
            'total_hours' => $totalHours,
            'requires_compensatory_rest' => $requiresCompensatoryRest,
            'warning' => $warning,
        ];
    }

    /**
     * Laravel ValidationRule contract implementation.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->userId || ! $this->date || ! is_numeric($value)) {
            return;
        }

        try {
            $this->evaluate($this->userId, $this->date, (float) $value, $this->ignoreBookingId);
        } catch (BookingValidationException $e) {
            $fail($e->getMessage());
        }
    }
}
