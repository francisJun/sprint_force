<?php

namespace App\Domain\TimeTracking\Rules;

use App\Models\TimeBooking;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * German Working Time Act (ArbZG § 3):
 * Daily working time must not exceed 10 hours.
 */
class ArbzgDailyLimitRule implements ValidationRule
{
    public function __construct(
        protected int $userId,
        protected ?string $date,
        protected ?int $ignoreBookingId = null
    ) {}

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->date || ! is_numeric($value)) {
            return;
        }

        $newHours = (float) $value;

        if ($newHours <= 0) {
            $fail('The booked hours must be greater than zero.');

            return;
        }

        // Query existing booked hours on this specific date for the user
        $query = TimeBooking::where('user_id', $this->userId)
            ->whereDate('date', $this->date)
            ->where('status', '!=', 'rejected');

        if ($this->ignoreBookingId) {
            $query->where('id', '!=', $this->ignoreBookingId);
        }

        $existingHours = (float) $query->sum('hours');
        $totalHours = $existingHours + $newHours;

        if ($totalHours > 10.0) {
            $fail(sprintf(
                'ArbZG § 3 violation: Maximum daily working time is 10 hours. You already have %.1fh logged on %s, adding %.1fh would result in %.1fh.',
                $existingHours,
                $this->date,
                $newHours,
                $totalHours
            ));
        }
    }
}

