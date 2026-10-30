<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VacationBlock;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class VacationBlockSeeder extends Seeder
{
    public function run(): void
    {
        $consultant = User::where('email', 'consultant@example.com')->first();

        if (! $consultant) {
            return;
        }

        // Avoid duplicate seeding
        if (VacationBlock::where('user_id', $consultant->id)->exists()) {
            return;
        }

        // Seed 1 week upcoming planned vacation in 2 weeks
        VacationBlock::create([
            'user_id' => $consultant->id,
            'start_date' => Carbon::now()->addWeeks(2)->startOfWeek()->toDateString(),
            'end_date' => Carbon::now()->addWeeks(2)->endOfWeek()->subDays(2)->toDateString(),
            'status' => 'planned',
        ]);
    }
}

