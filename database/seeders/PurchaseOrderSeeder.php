<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $supplier = Supplier::where('name', 'Acme Consulting GmbH')->first();
        $consultant = User::where('email', 'consultant@example.com')->first();

        if (! $supplier) {
            return;
        }

        // Matching the challenge example: 140 Person-days
        $order = PurchaseOrder::firstOrCreate(
            ['order_number' => '4500012345'],
            [
                'title' => 'Customer Portal Migration',
                'total_person_days' => 140.00,
                'start_date' => Carbon::now()->subMonths(3)->toDateString(),
                'target_end_date' => Carbon::now()->addMonths(3)->toDateString(),
                'status' => 'active',
                'supplier_id' => $supplier->id,
            ]
        );

        if ($consultant && ! $order->assignedConsultants()->where('users.id', $consultant->id)->exists()) {
            $order->assignedConsultants()->attach($consultant->id);
        }
    }
}

