<?php

namespace Tests\Unit\Domain;

use App\Domain\TimeTracking\Rules\ArbzgDailyLimitRule;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ArbzgDailyLimitRuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $consultant;
    protected PurchaseOrder $order;

    protected function setUp(): void
    {
        parent::setUp();

        $supplier = Supplier::create([
            'name' => 'Test Supplier GmbH',
        ]);

        $this->consultant = User::create([
            'name' => 'Consultant Bob',
            'email' => 'bob@example.com',
            'password' => bcrypt('password'),
            'role' => 'consultant',
            'supplier_id' => $supplier->id,
        ]);

        $this->order = PurchaseOrder::create([
            'order_number' => 'PO-TEST-001',
            'title' => 'Portal Test',
            'total_person_days' => 50.0,
            'start_date' => '2026-10-01',
            'target_end_date' => '2026-12-31',
            'status' => 'active',
            'supplier_id' => $supplier->id,
        ]);
    }

    public function test_accepts_booking_within_legal_10_hour_daily_limit(): void
    {
        $rule = new ArbzgDailyLimitRule($this->consultant->id, '2026-10-30');

        $validator = Validator::make(
            ['hours' => 7.5],
            ['hours' => [$rule]]
        );

        $this->assertTrue($validator->passes());
    }

    public function test_accepts_cumulative_bookings_summing_to_exactly_10_hours(): void
    {
        // First booking of 6 hours
        TimeBooking::create([
            'purchase_order_id' => $this->order->id,
            'user_id' => $this->consultant->id,
            'date' => '2026-10-30',
            'hours' => 6.0,
            'description' => 'Morning architecture tasks',
            'status' => 'approved',
        ]);

        // Second booking of 4 hours on the same date (total 10.0)
        $rule = new ArbzgDailyLimitRule($this->consultant->id, '2026-10-30');
        $validator = Validator::make(
            ['hours' => 4.0],
            ['hours' => [$rule]]
        );

        $this->assertTrue($validator->passes());
    }

    public function test_rejects_single_booking_exceeding_10_hours(): void
    {
        $rule = new ArbzgDailyLimitRule($this->consultant->id, '2026-10-30');

        $validator = Validator::make(
            ['hours' => 10.5],
            ['hours' => [$rule]]
        );

        $this->assertFalse($validator->passes());
        $this->assertStringContainsString('ArbZG § 3 violation: Maximum daily working time is 10 hours', $validator->errors()->first('hours'));
    }

    public function test_rejects_cumulative_bookings_exceeding_10_hours(): void
    {
        TimeBooking::create([
            'purchase_order_id' => $this->order->id,
            'user_id' => $this->consultant->id,
            'date' => '2026-10-30',
            'hours' => 8.0,
            'description' => 'Standard day',
            'status' => 'submitted',
        ]);

        // Attempting to add 2.5 hours brings total to 10.5h
        $rule = new ArbzgDailyLimitRule($this->consultant->id, '2026-10-30');
        $validator = Validator::make(
            ['hours' => 2.5],
            ['hours' => [$rule]]
        );

        $this->assertFalse($validator->passes());
        $this->assertStringContainsString('ArbZG § 3 violation', $validator->errors()->first('hours'));
    }

    public function test_ignores_rejected_bookings_in_cumulative_daily_total(): void
    {
        TimeBooking::create([
            'purchase_order_id' => $this->order->id,
            'user_id' => $this->consultant->id,
            'date' => '2026-10-30',
            'hours' => 8.0,
            'description' => 'Rejected erroneous entry',
            'status' => 'rejected',
        ]);

        // Adding 8 hours should be accepted since previous booking was rejected
        $rule = new ArbzgDailyLimitRule($this->consultant->id, '2026-10-30');
        $validator = Validator::make(
            ['hours' => 8.0],
            ['hours' => [$rule]]
        );

        $this->assertTrue($validator->passes());
    }
}

