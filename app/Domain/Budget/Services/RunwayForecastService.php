<?php

namespace App\Domain\Budget\Services;

use App\Models\PurchaseOrder;
use App\Models\VacationBlock;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class RunwayForecastService
{
    /**
     * Compute runway forecast for a given Purchase Order.
     *
     * @return array{
     *   total_person_days: float,
     *   used_person_days: float,
     *   remaining_person_days: float,
     *   average_weekly_burn_pd: float,
     *   daily_burn_pd: float,
     *   forecasted_end_date: string|null,
     *   target_end_date: string,
     *   status_traffic_light: string, // 'green', 'yellow', 'red'
     *   needs_reorder_alert: bool,
     *   days_until_reorder_deadline: int|null,
     *   vacation_days_affecting_runway: int
     * }
     */
    public function calculate(PurchaseOrder $order, ?Carbon $asOfDate = null): array
    {
        $today = $asOfDate ?? Carbon::today();
        $totalPd = (float) $order->total_person_days;
        $usedPd = $order->usedPersonDays();
        $remainingPd = $order->remainingPersonDays();

        // 1. Calculate historical average weekly pace (over last 4 weeks)
        $fourWeeksAgo = $today->copy()->subWeeks(4)->startOfDay();
        $recentApprovedHours = (float) $order->timeBookings()
            ->where('status', 'approved')
            ->where('date', '>=', $fourWeeksAgo->toDateString())
            ->sum('hours');

        $recentPd = $recentApprovedHours / 8.0;
        $weeklyBurnPd = $recentPd > 0 ? round($recentPd / 4.0, 2) : 5.0; // fallback default: 1 person working full-time = 5 PD/week
        $dailyBurnPd = max(0.1, round($weeklyBurnPd / 5.0, 2)); // 5 working days/week

        if ($remainingPd <= 0) {
            return [
                'total_person_days' => $totalPd,
                'used_person_days' => $usedPd,
                'remaining_person_days' => 0.0,
                'average_weekly_burn_pd' => $weeklyBurnPd,
                'daily_burn_pd' => $dailyBurnPd,
                'forecasted_end_date' => $today->toDateString(),
                'target_end_date' => $order->target_end_date->toDateString(),
                'status_traffic_light' => 'red',
                'needs_reorder_alert' => true,
                'days_until_reorder_deadline' => 0,
                'vacation_days_affecting_runway' => 0,
            ];
        }

        // 2. Fetch assigned consultants' upcoming vacations
        $consultantIds = $order->assignedConsultants()->pluck('users.id');
        $vacationBlocks = VacationBlock::whereIn('user_id', $consultantIds)
            ->where('end_date', '>=', $today->toDateString())
            ->get();

        // 3. Step day-by-day to simulate runway
        $current = $today->copy();
        $budgetLeft = $remainingPd;
        $vacationDaysCount = 0;
        $maxIterationDays = 365 * 2; // guard against infinite loops
        $iterations = 0;

        while ($budgetLeft > 0 && $iterations < $maxIterationDays) {
            $current->addDay();
            $iterations++;

            // Skip weekends
            if ($current->isWeekend()) {
                continue;
            }

            // Check if day is a German statutory holiday
            if ($this->isGermanPublicHoliday($current)) {
                continue;
            }

            // Check if consultant is on vacation
            $isOnVacation = $vacationBlocks->contains(function ($vacation) use ($current) {
                return $current->betweenIncluded($vacation->start_date, $vacation->end_date);
            });

            if ($isOnVacation) {
                $vacationDaysCount++;
                continue; // no budget consumed on vacation days
            }

            // Consume daily burn
            $budgetLeft -= $dailyBurnPd;
        }

        $forecastedEnd = $current->copy();
        $targetEnd = $order->target_end_date;

        // 4. Procurement lead time calculation (4 weeks = 28 calendar days before runway)
        $reorderDeadline = $forecastedEnd->copy()->subDays(28);
        $daysUntilReorder = $today->diffInDays($reorderDeadline, false);

        // 5. Traffic light assessment
        // RED: Runway exhausts before target end date, or re-order deadline has passed/is critical (<= 7 days)
        // YELLOW: Runway exhausts within 2 weeks of target end date, or re-order is within 28 days
        // GREEN: Healthy budget runway beyond target end date
        if ($forecastedEnd->lt($targetEnd) || $daysUntilReorder <= 7) {
            $trafficLight = 'red';
            $needsReorderAlert = true;
        } elseif ($daysUntilReorder <= 28) {
            $trafficLight = 'yellow';
            $needsReorderAlert = true;
        } else {
            $trafficLight = 'green';
            $needsReorderAlert = false;
        }

        return [
            'total_person_days' => $totalPd,
            'used_person_days' => $usedPd,
            'remaining_person_days' => $remainingPd,
            'average_weekly_burn_pd' => $weeklyBurnPd,
            'daily_burn_pd' => $dailyBurnPd,
            'forecasted_end_date' => $forecastedEnd->toDateString(),
            'target_end_date' => $targetEnd->toDateString(),
            'status_traffic_light' => $trafficLight,
            'needs_reorder_alert' => $needsReorderAlert,
            'days_until_reorder_deadline' => (int) $daysUntilReorder,
            'vacation_days_affecting_runway' => $vacationDaysCount,
        ];
    }

    /**
     * Check if a given date is a nationwide German public holiday.
     */
    protected function isGermanPublicHoliday(Carbon $date): bool
    {
        $year = $date->year;
        $holidays = [
            sprintf('%d-01-01', $year), // Neujahr
            sprintf('%d-05-01', $year), // Tag der Arbeit
            sprintf('%d-10-03', $year), // Tag der Deutschen Einheit
            sprintf('%d-12-25', $year), // 1. Weihnachtstag
            sprintf('%d-12-26', $year), // 2. Weihnachtstag
        ];

        // Easter-dependent holidays
        $easterDays = easter_days($year);
        $easterDate = Carbon::createFromDate($year, 3, 21)->addDays($easterDays);
        $holidays[] = $easterDate->copy()->subDays(2)->toDateString(); // Karfreitag
        $holidays[] = $easterDate->copy()->addDay()->toDateString();    // Ostermontag
        $holidays[] = $easterDate->copy()->addDays(39)->toDateString(); // Christi Himmelfahrt
        $holidays[] = $easterDate->copy()->addDays(50)->toDateString(); // Pfingstmontag

        return in_array($date->toDateString(), $holidays, true);
    }
}

