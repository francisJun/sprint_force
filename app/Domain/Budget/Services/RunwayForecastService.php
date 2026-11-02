<?php

namespace App\Domain\Budget\Services;

use App\Models\PurchaseOrder;
use App\Models\VacationBlock;
use Carbon\Carbon;
use Carbon\CarbonInterface;

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
     *   reorder_deadline_date: string,
     *   vacation_days_affecting_runway: int,
     *   burndown_series: array<int, array{
     *     date: string,
     *     label: string,
     *     ideal_pd: float,
     *     actual_pd: float|null,
     *     projected_pd: float|null,
     *     is_today: bool,
     *     is_reorder_window: bool
     *   }>
     * }
     */
    public function calculate(PurchaseOrder $order, ?CarbonInterface $asOfDate = null): array
    {
        $today = $asOfDate ? Carbon::parse($asOfDate) : Carbon::today();
        $targetEnd = Carbon::parse($order->target_end_date);
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
            $forecastedEnd = $today->copy();
            $reorderDeadline = $forecastedEnd->copy()->subDays(28);

            return [
                'total_person_days' => $totalPd,
                'used_person_days' => $usedPd,
                'remaining_person_days' => 0.0,
                'average_weekly_burn_pd' => $weeklyBurnPd,
                'daily_burn_pd' => $dailyBurnPd,
                'forecasted_end_date' => $today->toDateString(),
                'target_end_date' => $targetEnd->toDateString(),
                'status_traffic_light' => 'red',
                'needs_reorder_alert' => true,
                'days_until_reorder_deadline' => 0,
                'reorder_deadline_date' => $reorderDeadline->toDateString(),
                'vacation_days_affecting_runway' => 0,
                'burndown_series' => $this->buildBurndownSeries(
                    $order,
                    $today,
                    $totalPd,
                    0.0,
                    $targetEnd,
                    $forecastedEnd,
                    $weeklyBurnPd
                ),
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
            'reorder_deadline_date' => $reorderDeadline->toDateString(),
            'vacation_days_affecting_runway' => $vacationDaysCount,
            'burndown_series' => $this->buildBurndownSeries(
                $order,
                $today,
                $totalPd,
                $remainingPd,
                $targetEnd,
                $forecastedEnd,
                $weeklyBurnPd
            ),
        ];
    }

    /**
     * Generate weekly timeline points for the burndown trajectory chart.
     *
     * @return array<int, array{
     *     date: string,
     *     label: string,
     *     ideal_pd: float,
     *     actual_pd: float|null,
     *     projected_pd: float|null,
     *     is_today: bool,
     *     is_reorder_window: bool
     * }>
     */
    protected function buildBurndownSeries(
        PurchaseOrder $order,
        CarbonInterface $today,
        float $totalPd,
        float $remainingPd,
        CarbonInterface $targetEnd,
        CarbonInterface $forecastedEnd,
        float $weeklyBurnPd
    ): array {
        // Normalize all inputs to mutable Carbon instances
        $today = Carbon::parse($today);
        $targetEnd = Carbon::parse($targetEnd);
        $forecastedEnd = Carbon::parse($forecastedEnd);

        // Start date of order or 8 weeks prior
        $startDate = $order->start_date
            ? Carbon::parse($order->start_date)
            : $today->copy()->subWeeks(8);

        if ($startDate->gte($today)) {
            $startDate = $today->copy()->subWeeks(4);
        }

        $totalPlannedDays = max(1, $startDate->diffInDays($targetEnd, false));

        // Load all approved time bookings to calculate historical actual remaining PD
        $approvedBookings = $order->relationLoaded('timeBookings')
            ? $order->timeBookings->where('status', 'approved')
            : $order->timeBookings()->where('status', 'approved')->get();

        $reorderDeadline = $forecastedEnd->copy()->subDays(28);

        // Define weekly sample points from start to the furthest horizon
        $endHorizon = $forecastedEnd->gt($targetEnd)
            ? $forecastedEnd->copy()->endOfWeek()
            : $targetEnd->copy()->endOfWeek();

        // Sample up to 52 weeks max
        $currentWeek = $startDate->copy()->startOfWeek();
        $points = [];
        $weekNumber = 1;
        $maxWeeks = 52;

        while ($currentWeek->lte($endHorizon) && count($points) < $maxWeeks) {
            $dateStr = $currentWeek->toDateString();
            $isPastOrCurrent = $currentWeek->lte($today->copy()->endOfWeek());
            $isTodayWeek = $currentWeek->isSameWeek($today);

            // 1. Ideal planned linear burn from start to targetEnd
            $daysSinceStart = max(0, $startDate->diffInDays($currentWeek, false));
            $idealRatio = min(1.0, max(0.0, $daysSinceStart / $totalPlannedDays));
            $idealPd = round(max(0.0, $totalPd - ($totalPd * $idealRatio)), 2);

            // 2. Actual remaining PD (for historical weeks up to current)
            $actualPd = null;
            if ($isPastOrCurrent) {
                if ($isTodayWeek) {
                    $actualPd = round($remainingPd, 2);
                } else {
                    $hoursBookedUpToWeek = (float) $approvedBookings
                        ->filter(fn ($b) => Carbon::parse($b->date)->lte($currentWeek->copy()->endOfWeek()))
                        ->sum('hours');
                    $usedUpToWeek = $hoursBookedUpToWeek / 8.0;
                    $actualPd = round(max(0.0, $totalPd - $usedUpToWeek), 2);
                }
            }

            // 3. Projected remaining PD (for current week into future)
            $projectedPd = null;
            if ($currentWeek->gte($today->copy()->startOfWeek())) {
                if ($isTodayWeek) {
                    $projectedPd = round($remainingPd, 2);
                } else {
                    $daysFromToday = max(0, $today->diffInDays($currentWeek, false));
                    $weeksFromToday = $daysFromToday / 7.0;
                    $simulatedRemaining = $remainingPd - ($weeklyBurnPd * $weeksFromToday);
                    $projectedPd = round(max(0.0, $simulatedRemaining), 2);
                }
            }

            $isReorderWindow = $currentWeek->gte($reorderDeadline) && $currentWeek->lte($forecastedEnd);

            $points[] = [
                'date' => $dateStr,
                'label' => $isTodayWeek ? 'Today' : 'W'.$weekNumber,
                'ideal_pd' => $idealPd,
                'actual_pd' => $actualPd,
                'projected_pd' => $projectedPd,
                'is_today' => $isTodayWeek,
                'is_reorder_window' => $isReorderWindow,
            ];

            $currentWeek->addWeek();
            $weekNumber++;
        }

        return $points;
    }

    /**
     * Check if a given date is a nationwide German public holiday.
     */
    protected function isGermanPublicHoliday(CarbonInterface $date): bool
    {
        $date = Carbon::parse($date);
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
