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

        $startDate = Carbon::now()->addWeeks(2)->startOfWeek()->toDateString();
        $endDate = Carbon::now()->addWeeks(2)->endOfWeek()->subDays(2)->toDateString();

        // Seed 1 week upcoming planned vacation in 2 weeks (idempotent via updateOrCreate)
        VacationBlock::updateOrCreate(
            [
                'user_id' => $consultant->id,
                'start_date' => $startDate,
            ],
            [
                'end_date' => $endDate,
                'status' => 'planned',
            ]
        );
    }
}
