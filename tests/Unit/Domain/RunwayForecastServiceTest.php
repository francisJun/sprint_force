<?php

namespace Tests\Unit\Domain;

use App\Domain\Budget\Services\RunwayForecastService;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;
use App\Models\VacationBlock;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RunwayForecastServiceTest extends TestCase
{
    use RefreshDatabase;

    protected RunwayForecastService $service;
    protected PurchaseOrder $order;
    protected User $consultant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new RunwayForecastService;

        $supplier = Supplier::create(['name' => 'Runway Supplier']);
        $this->consultant = User::create([
            'name' => 'Charlie Consultant',
            'email' => 'charlie@example.com',
            'password' => bcrypt('password'),
            'role' => 'consultant',
            'supplier_id' => $supplier->id,
        ]);

        // Order with 10 person-days remaining, target end date in 30 days
        $this->order = PurchaseOrder::create([
            'order_number' => 'PO-RUNWAY-01',
            'title' => 'Runway Test Project',
            'total_person_days' => 10.0,
            'start_date' => '2026-10-01',
            'target_end_date' => '2026-11-30',
            'status' => 'active',
            'supplier_id' => $supplier->id,
        ]);
        $this->order->assignedConsultants()->attach($this->consultant->id);
    }

    public function test_forecasts_runway_date_skipping_weekends(): void
    {
        // 10 person days at 1.0 PD/day = 10 working days = 2 calendar weeks (14 days)
        $asOfDate = Carbon::parse('2026-11-02'); // Monday

        $result = $this->service->calculate($this->order, $asOfDate);

        $this->assertEquals(10.0, $result['total_person_days']);
        $this->assertEquals(10.0, $result['remaining_person_days']);
        $this->assertEquals(0, $result['vacation_days_affecting_runway']);
        // 10 working days starting Mon Nov 2 -> Mon Nov 16
        $this->assertEquals('2026-11-16', $result['forecasted_end_date']);
    }

    public function test_vacation_pushes_forecasted_runway_end_date_forward(): void
    {
        $asOfDate = Carbon::parse('2026-11-02'); // Monday

        // Add 1 week of vacation (Nov 9 - Nov 13, 5 working days)
        VacationBlock::create([
            'user_id' => $this->consultant->id,
            'start_date' => '2026-11-09',
            'end_date' => '2026-11-13',
            'status' => 'planned',
        ]);

        $result = $this->service->calculate($this->order, $asOfDate);

        // Vacation of 5 working days pushes completion by 1 week (from Nov 16 to Nov 23)
        $this->assertEquals(5, $result['vacation_days_affecting_runway']);
        $this->assertEquals('2026-11-23', $result['forecasted_end_date']);
    }

    public function test_triggers_reorder_alert_when_runway_exhausts_before_target_end(): void
    {
        // Target end date is far in future (2027-01-31)
        // With only 10 PD remaining at 1 PD/day, budget will exhaust in mid-November
        $this->order->update(['target_end_date' => '2027-01-31']);
        $asOfDate = Carbon::parse('2026-11-02');

        $result = $this->service->calculate($this->order, $asOfDate);

        $this->assertTrue($result['needs_reorder_alert']);
        $this->assertEquals('red', $result['status_traffic_light']);
    }

    public function test_generates_burndown_series_with_ideal_actual_and_projected_trajectories(): void
    {
        $asOfDate = Carbon::parse('2026-11-02');

        $result = $this->service->calculate($this->order, $asOfDate);

        $this->assertArrayHasKey('burndown_series', $result);
        $this->assertNotEmpty($result['burndown_series']);

        $firstPoint = $result['burndown_series'][0];
        $this->assertArrayHasKey('date', $firstPoint);
        $this->assertArrayHasKey('label', $firstPoint);
        $this->assertArrayHasKey('ideal_pd', $firstPoint);
        $this->assertArrayHasKey('actual_pd', $firstPoint);
        $this->assertArrayHasKey('projected_pd', $firstPoint);
        $this->assertArrayHasKey('is_today', $firstPoint);
        $this->assertArrayHasKey('is_reorder_window', $firstPoint);
    }
}

