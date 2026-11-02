<?php

namespace Tests\Unit\Domain;

use App\Domain\TimeTracking\Rules\ConsultantAssignedToOrderRule;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ConsultantAssignedToOrderRuleTest extends TestCase
{
    use RefreshDatabase;

    protected PurchaseOrder $assignedOrder;
    protected PurchaseOrder $unassignedOrder;
    protected PurchaseOrder $closedOrder;

    protected function setUp(): void
    {
        parent::setUp();

        $supplier = Supplier::create(['name' => 'Supplier AG']);

        $this->consultant = User::create([
            'name' => 'Alice Dev',
            'email' => 'alice@example.com',
            'password' => bcrypt('password'),
            'role' => 'consultant',
            'supplier_id' => $supplier->id,
        ]);

        $this->assignedOrder = PurchaseOrder::create([
            'order_number' => 'PO-ASSIGNED-01',
            'title' => 'Assigned Project',
            'total_person_days' => 100.0,
            'start_date' => '2026-10-01',
            'target_end_date' => '2026-12-31',
            'status' => 'active',
            'supplier_id' => $supplier->id,
        ]);
        $this->assignedOrder->assignedConsultants()->attach($this->consultant->id);

        $this->unassignedOrder = PurchaseOrder::create([
            'order_number' => 'PO-UNASSIGNED-02',
            'title' => 'Other Project',
            'total_person_days' => 80.0,
            'start_date' => '2026-10-01',
            'target_end_date' => '2026-12-31',
            'status' => 'active',
            'supplier_id' => $supplier->id,
        ]);

        $this->closedOrder = PurchaseOrder::create([
            'order_number' => 'PO-CLOSED-03',
            'title' => 'Legacy Closed Order',
            'total_person_days' => 50.0,
            'start_date' => '2026-01-01',
            'target_end_date' => '2026-06-30',
            'status' => 'closed',
            'supplier_id' => $supplier->id,
        ]);
        $this->closedOrder->assignedConsultants()->attach($this->consultant->id);
    }

    public function test_accepts_booking_on_active_assigned_order(): void
    {
        $rule = new ConsultantAssignedToOrderRule($this->consultant->id);

        $validator = Validator::make(
            ['purchase_order_id' => $this->assignedOrder->id],
            ['purchase_order_id' => [$rule]]
        );

        $this->assertTrue($validator->passes());
    }

    public function test_rejects_booking_on_unassigned_order(): void
    {
        $rule = new ConsultantAssignedToOrderRule($this->consultant->id);

        $validator = Validator::make(
            ['purchase_order_id' => $this->unassignedOrder->id],
            ['purchase_order_id' => [$rule]]
        );

        $this->assertFalse($validator->passes());
        $this->assertStringContainsString('You are not assigned to purchase order', $validator->errors()->first('purchase_order_id'));
    }

    public function test_rejects_booking_on_closed_order(): void
    {
        $rule = new ConsultantAssignedToOrderRule($this->consultant->id);

        $validator = Validator::make(
            ['purchase_order_id' => $this->closedOrder->id],
            ['purchase_order_id' => [$rule]]
        );

        $this->assertFalse($validator->passes());
        $this->assertStringContainsString('is closed. Bookings are only accepted for active orders.', $validator->errors()->first('purchase_order_id'));
    }
}

