<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\TimeBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TimeBookingSeeder extends Seeder
{
    public function run(): void
    {
        $order = PurchaseOrder::where('order_number', '4500012345')->first();
        $consultant = User::where('email', 'consultant@example.com')->first();

        if (! $order || ! $consultant) {
            return;
        }

        $descriptions = [
            0 => 'Sprint backlog planning, technical architecture alignment, and schema design.',
            1 => 'Core data migration pipelines and backend API endpoint implementation.',
            2 => 'Integration with identity services, database indexing, and query tuning.',
            3 => 'Automated test suite expansion, validation rules, and error handling.',
            4 => 'End-of-week code review, deliverable documentation, and sprint demo prep.',
        ];

        // Seed 10 weeks of approved historical daily bookings conforming to ArbZG § 3 (8.00h/day, Mon-Fri = 40h/week, 50 PD total)
        for ($i = 10; $i >= 1; $i--) {
            $weekStart = Carbon::now()->subWeeks($i)->startOfWeek(); // Monday

            for ($dayOffset = 0; $dayOffset < 5; $dayOffset++) {
                $bookingDate = $weekStart->copy()->addDays($dayOffset);

                TimeBooking::updateOrCreate(
                    [
                        'purchase_order_id' => $order->id,
                        'user_id' => $consultant->id,
                        'date' => $bookingDate->toDateString(),
                    ],
                    [
                        'hours' => 8.00, // 8.0h/day = 1.0 Person-Day per ArbZG § 3 standard
                        'description' => $descriptions[$dayOffset],
                        'status' => 'approved',
                    ]
                );
            }
        }

        // Add 1 pending/submitted booking for review (7.5h <= 8.0h daily limit)
        $lastWorkday = Carbon::now()->isWeekend()
            ? Carbon::now()->previous(Carbon::FRIDAY)
            : Carbon::now()->subDay();

        TimeBooking::updateOrCreate(
            [
                'purchase_order_id' => $order->id,
                'user_id' => $consultant->id,
                'date' => $lastWorkday->toDateString(),
            ],
            [
                'hours' => 7.50,
                'description' => 'Implemented OAuth2 authorization and user profile sync.',
                'status' => 'submitted',
            ]
        );
    }
}
