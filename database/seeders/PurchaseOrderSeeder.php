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
        $consultant1 = User::where('email', 'consultant@example.com')->first();
        $consultant2 = User::where('email', 'consultant2@example.com')->first();
        $consultant3 = User::where('email', 'consultant3@example.com')->first();

        if (! $supplier) {
            return;
        }

        // Order 1: Customer Portal Migration (140 Person-days)
        $order1 = PurchaseOrder::updateOrCreate(
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

        $order1Consultants = array_filter([$consultant1?->id, $consultant2?->id]);
        if (! empty($order1Consultants)) {
            $order1->assignedConsultants()->syncWithoutDetaching($order1Consultants);
        }

        // Order 2: Cloud ERP Integration & Microservices (80 Person-days per guide.md 3.1)
        $order2 = PurchaseOrder::updateOrCreate(
            ['order_number' => '4500098765'],
            [
                'title' => 'Cloud ERP Integration & Microservices',
                'total_person_days' => 80.00,
                'start_date' => Carbon::now()->subMonth()->toDateString(),
                'target_end_date' => Carbon::now()->addMonths(2)->toDateString(),
                'status' => 'active',
                'supplier_id' => $supplier->id,
            ]
        );

        $order2Consultants = array_filter([$consultant1?->id, $consultant3?->id]);
        if (! empty($order2Consultants)) {
            $order2->assignedConsultants()->syncWithoutDetaching($order2Consultants);
        }
    }
}
