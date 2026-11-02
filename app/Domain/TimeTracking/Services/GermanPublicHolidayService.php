<?php

namespace App\Domain\TimeTracking\Services;

use Carbon\Carbon;
use Carbon\CarbonInterface;

class GermanPublicHolidayService
{
    /**
     * Determine if a given date is a German statutory public holiday.
     */
    public function isHoliday(CarbonInterface|string $date, ?string $state = 'ALL'): bool
    {
        return $this->getHolidayName($date, $state) !== null;
    }

    /**
     * Get the name of the statutory holiday, or null if not a holiday.
     */
    public function getHolidayName(CarbonInterface|string $date, ?string $state = 'ALL'): ?string
    {
        $carbon = $date instanceof CarbonInterface ? $date : Carbon::parse($date);
        $holidays = $this->getHolidaysForYear((int) $carbon->year, $state);

        return $holidays[$carbon->format('Y-m-d')] ?? null;
    }

    /**
     * Compute German statutory holidays for a specific year.
     *
     * @return array<string, string> Map of 'YYYY-MM-DD' => 'Holiday Name'
     */
    public function getHolidaysForYear(int $year, ?string $state = 'ALL'): array
    {
        $holidays = [];

        // 1. Fixed federal statutory holidays (all 16 states)
        $holidays["{$year}-01-01"] = 'Neujahr';
        $holidays["{$year}-05-01"] = 'Tag der Arbeit';
        $holidays["{$year}-10-03"] = 'Tag der Deutschen Einheit';
        $holidays["{$year}-12-25"] = '1. Weihnachtstag';
        $holidays["{$year}-12-26"] = '2. Weihnachtstag';

        // 2. Easter-dependent movable holidays
        $easterTimestamp = easter_date($year);
        $easterSunday = Carbon::createFromTimestamp($easterTimestamp);

        $goodFriday = (clone $easterSunday)->subDays(2);
        $easterMonday = (clone $easterSunday)->addDay();
        $ascension = (clone $easterSunday)->addDays(39);
        $whitMonday = (clone $easterSunday)->addDays(50);
        $corpusChristi = (clone $easterSunday)->addDays(60);

        $holidays[$goodFriday->format('Y-m-d')] = 'Karfreitag';
        $holidays[$easterMonday->format('Y-m-d')] = 'Ostermontag';
        $holidays[$ascension->format('Y-m-d')] = 'Christi Himmelfahrt';
        $holidays[$whitMonday->format('Y-m-d')] = 'Pfingstmontag';

        // 3. Common state-specific statutory holidays (BY, NW, BW, etc.)
        $stateUpper = strtoupper($state ?? 'ALL');
        if (in_array($stateUpper, ['ALL', 'BY', 'BW', 'NW', 'HE', 'RP', 'SL'], true)) {
            $holidays[$corpusChristi->format('Y-m-d')] = 'Fronleichnam';
        }

        if (in_array($stateUpper, ['ALL', 'BY', 'BW', 'NW', 'RP', 'SL'], true)) {
            $holidays["{$year}-11-01"] = 'Allerheiligen';
        }

        if (in_array($stateUpper, ['ALL', 'BB', 'MV', 'SN', 'ST', 'TH', 'HB', 'HH', 'NI', 'SH'], true)) {
            $holidays["{$year}-10-31"] = 'Reformationstag';
        }

        if (in_array($stateUpper, ['ALL', 'BW', 'BY', 'ST'], true)) {
            $holidays["{$year}-01-06"] = 'Heilige Drei Könige';
        }

        return $holidays;
    }
}

