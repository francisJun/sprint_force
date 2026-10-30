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

        // Avoid duplicate seeding
        if (TimeBooking::where('purchase_order_id', $order->id)->exists()) {
            return;
        }

        // Seed 10 weeks of approved historical bookings (40h each = 5 PD/week, total 50 PD = 400h)
        for ($i = 10; $i >= 1; $i--) {
            TimeBooking::create([
                'purchase_order_id' => $order->id,
                'user_id' => $consultant->id,
                'date' => Carbon::now()->subWeeks($i)->startOfWeek()->toDateString(),
                'hours' => 40.00,
                'description' => 'Sprint execution, data migration pipelines and testing.',
                'status' => 'approved',
            ]);
        }

        // Add 1 pending/submitted booking for review
        TimeBooking::create([
            'purchase_order_id' => $order->id,
            'user_id' => $consultant->id,
            'date' => Carbon::now()->subDays(1)->toDateString(),
            'hours' => 7.50,
            'description' => 'Implemented OAuth2 authorization and user profile sync.',
            'status' => 'submitted',
        ]);
    }
}

