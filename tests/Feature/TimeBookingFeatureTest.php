<?php

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->supplier = Supplier::create([
        'name' => 'Adesso Consulting AG',
        'contact_email' => 'contact@adesso.de',
    ]);

    $this->consultant = User::factory()->create([
        'name' => 'Elena Consultant',
        'email' => 'elena.consultant@example.com',
        'role' => 'consultant',
        'supplier_id' => $this->supplier->id,
    ]);

    $this->projectLead = User::factory()->create([
        'name' => 'Marcus ProjectLead',
        'email' => 'marcus.lead@example.com',
        'role' => 'project_lead',
    ]);

    $this->purchasingUser = User::factory()->create([
        'name' => 'Peter Purchasing',
        'email' => 'peter.purchasing@example.com',
        'role' => 'purchasing',
    ]);

    $this->superAdmin = User::factory()->create([
        'name' => 'System SuperAdmin',
        'email' => 'superadmin@example.com',
        'role' => 'super_admin',
    ]);

    $this->order = PurchaseOrder::create([
        'order_number' => '4500012345',
        'title' => 'Cloud Architecture Revamp',
        'total_person_days' => 50.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $this->supplier->id,
    ]);

    $this->order->assignedConsultants()->attach($this->consultant->id);
});

/*
|--------------------------------------------------------------------------
| 1. Time Booking Submission (POST /bookings)
|--------------------------------------------------------------------------
*/

test('consultant can submit a valid time booking on assigned order', function () {
    $this->actingAs($this->consultant);

    $response = $this->post(route('bookings.store'), [
        'purchase_order_id' => $this->order->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '17:00',
        'hours' => 8.0,
        'description' => 'Implemented feature testing and verified test suite',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $this->assertDatabaseHas('time_bookings', [
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'hours' => 8.0,
        'status' => 'submitted',
    ]);
});

test('project lead is forbidden from submitting time bookings', function () {
    $this->actingAs($this->projectLead);

    $response = $this->post(route('bookings.store'), [
        'purchase_order_id' => $this->order->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '17:00',
        'hours' => 8.0,
        'description' => 'Project lead attempting unauthorized booking submission',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('time_bookings', [
        'user_id' => $this->projectLead->id,
    ]);
});

test('purchasing agent is forbidden from submitting time bookings', function () {
    $this->actingAs($this->purchasingUser);

    $response = $this->post(route('bookings.store'), [
        'purchase_order_id' => $this->order->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '17:00',
        'hours' => 8.0,
        'description' => 'Purchasing agent attempting unauthorized booking submission',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('time_bookings', [
        'user_id' => $this->purchasingUser->id,
    ]);
});

test('super admin is forbidden from submitting time bookings as per role matrix', function () {
    $this->actingAs($this->superAdmin);

    $response = $this->post(route('bookings.store'), [
        'purchase_order_id' => $this->order->id,
        'date' => '2026-11-04',
        'start_time' => '09:00',
        'end_time' => '17:00',
        'hours' => 8.0,
        'description' => 'Super admin attempting direct time booking',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('time_bookings', [
        'user_id' => $this->superAdmin->id,
    ]);
});

/*
|--------------------------------------------------------------------------
| 2. Time Booking Approval & Rejection (POST /bookings/{id}/approve, reject)
|--------------------------------------------------------------------------
*/

test('project lead can approve a submitted time booking', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Feature development completed',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->projectLead);

    $response = $this->post(route('bookings.approve', $booking));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('time_bookings', [
        'id' => $booking->id,
        'status' => 'approved',
        'rejection_reason' => null,
    ]);
});

test('project lead can reject a submitted time booking with a reason', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Incomplete tasks without deliverables',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->projectLead);

    $response = $this->post(route('bookings.reject', $booking), [
        'rejection_reason' => 'Proof of work documentation missing for booked hours.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('time_bookings', [
        'id' => $booking->id,
        'status' => 'rejected',
        'rejection_reason' => 'Proof of work documentation missing for booked hours.',
    ]);
});

test('consultant is forbidden from approving time bookings', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Feature development completed',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->consultant);

    $response = $this->post(route('bookings.approve', $booking));

    $response->assertForbidden();
    expect($booking->fresh()->status)->toBe('submitted');
});

test('consultant is forbidden from rejecting time bookings', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Feature development completed',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->consultant);

    $response = $this->post(route('bookings.reject', $booking), [
        'rejection_reason' => 'Consultant attempting self rejection',
    ]);

    $response->assertForbidden();
    expect($booking->fresh()->status)->toBe('submitted');
});

test('purchasing agent is forbidden from approving time bookings', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Feature development completed',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->purchasingUser);

    $response = $this->post(route('bookings.approve', $booking));

    $response->assertForbidden();
    expect($booking->fresh()->status)->toBe('submitted');
});

test('purchasing agent is forbidden from rejecting time bookings', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Feature development completed',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->purchasingUser);

    $response = $this->post(route('bookings.reject', $booking), [
        'rejection_reason' => 'Purchasing attempting rejection',
    ]);

    $response->assertForbidden();
    expect($booking->fresh()->status)->toBe('submitted');
});

test('super admin can approve a submitted time booking as platform overseer', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Critical emergency fix',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->superAdmin);

    $response = $this->post(route('bookings.approve', $booking));

    $response->assertRedirect();
    expect($booking->fresh()->status)->toBe('approved');
});

test('super admin can reject a submitted time booking as platform overseer', function () {
    $booking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Non-compliant booking',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->superAdmin);

    $response = $this->post(route('bookings.reject', $booking), [
        'rejection_reason' => 'Governance policy audit violation.',
    ]);

    $response->assertRedirect();
    expect($booking->fresh()->status)->toBe('rejected');
});

/*
|--------------------------------------------------------------------------
| 3. Role-Based Route Protection (GET /approvals, /purchasing/*, /orders)
|--------------------------------------------------------------------------
*/

test('consultant is forbidden from accessing approvals view', function () {
    $this->actingAs($this->consultant);

    $response = $this->get(route('approvals.index'));

    $response->assertForbidden();
});

test('consultant is forbidden from accessing purchasing orders view', function () {
    $this->actingAs($this->consultant);

    $response = $this->get(route('purchasing.orders'));

    $response->assertForbidden();
});

test('consultant is forbidden from accessing purchasing invoices view', function () {
    $this->actingAs($this->consultant);

    $response = $this->get(route('purchasing.invoices'));

    $response->assertForbidden();
});

test('consultant is forbidden from accessing executive orders overview', function () {
    $this->actingAs($this->consultant);

    $response = $this->get(route('orders.index'));

    $response->assertForbidden();
});

test('purchasing agent is forbidden from accessing approvals view', function () {
    $this->actingAs($this->purchasingUser);

    $response = $this->get(route('approvals.index'));

    $response->assertForbidden();
});

test('project lead can access approvals and orders views', function () {
    $this->actingAs($this->projectLead);

    $this->get(route('approvals.index'))->assertOk();
    $this->get(route('orders.index'))->assertOk();
});

test('purchasing agent can access purchasing orders and invoices views', function () {
    $this->actingAs($this->purchasingUser);

    $this->get(route('purchasing.orders'))->assertOk();
    $this->get(route('purchasing.invoices'))->assertOk();
});

test('unauthenticated visitors are redirected to login when accessing operational routes', function () {
    $this->get(route('approvals.index'))->assertRedirect(route('login'));
    $this->get(route('purchasing.orders'))->assertRedirect(route('login'));
    $this->get(route('purchasing.invoices'))->assertRedirect(route('login'));
    $this->get(route('orders.index'))->assertRedirect(route('login'));
});

/*
|--------------------------------------------------------------------------
| 4. Data Minimization (Purchasing Dashboard)
|--------------------------------------------------------------------------
*/

test('purchasing dashboard applies data minimization by not exposing pending bookings', function () {
    TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Confidential technical implementation details',
        'status' => 'submitted',
    ]);

    $this->actingAs($this->purchasingUser);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('pendingBookings', [])
    );
});

/*
|--------------------------------------------------------------------------
| 5. Negative Validation & Assignment Boundary Tests
|--------------------------------------------------------------------------
*/

test('consultant booking submission fails validation when hours or description are invalid', function () {
    $this->actingAs($this->consultant);

    $response = $this->post(route('bookings.store'), [
        'purchase_order_id' => $this->order->id,
        'date' => '2026-11-04',
        'hours' => -1.0,
        'description' => 'Fix',
    ]);

    $response->assertSessionHasErrors(['hours', 'description']);
    $this->assertDatabaseMissing('time_bookings', [
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
    ]);
});

test('consultant booking submission on unassigned order fails assignment validation', function () {
    $unassignedOrder = PurchaseOrder::create([
        'order_number' => '4500099991',
        'title' => 'Unassigned Project Alpha',
        'total_person_days' => 20.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $this->supplier->id,
    ]);

    $this->actingAs($this->consultant);

    $response = $this->post(route('bookings.store'), [
        'purchase_order_id' => $unassignedOrder->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Attempting time booking on unassigned order',
    ]);

    if ($response->status() === 403) {
        $response->assertForbidden();
    } else {
        $response->assertSessionHasErrors(['purchase_order_id']);
    }

    $this->assertDatabaseMissing('time_bookings', [
        'purchase_order_id' => $unassignedOrder->id,
        'user_id' => $this->consultant->id,
    ]);
});

/*
|--------------------------------------------------------------------------
| 6. Lifecycle State Protection (Non-Submitted Denials)
|--------------------------------------------------------------------------
*/

test('project lead is forbidden from approving a time booking that is not in submitted state', function () {
    $approvedBooking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Already approved feature task',
        'status' => 'approved',
    ]);

    $this->actingAs($this->projectLead);

    $response = $this->post(route('bookings.approve', $approvedBooking));

    expect(in_array($response->status(), [302, 403], true))->toBeTrue();
    if ($response->status() === 403) {
        $response->assertForbidden();
    } else {
        $response->assertSessionHasErrors(['booking']);
    }
    expect($approvedBooking->fresh()->status)->toBe('approved');
});

test('project lead is forbidden from rejecting a time booking that is not in submitted state', function () {
    $approvedBooking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Already approved feature task',
        'status' => 'approved',
    ]);

    $this->actingAs($this->projectLead);

    $response = $this->post(route('bookings.reject', $approvedBooking), [
        'rejection_reason' => 'Attempting post-approval rejection',
    ]);

    expect(in_array($response->status(), [302, 403], true))->toBeTrue();
    if ($response->status() === 403) {
        $response->assertForbidden();
    } else {
        $response->assertSessionHasErrors(['booking']);
    }
    expect($approvedBooking->fresh()->status)->toBe('approved');
});

test('super admin is forbidden from approving a time booking that is not in submitted state', function () {
    $rejectedBooking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Already rejected booking',
        'status' => 'rejected',
        'rejection_reason' => 'Initial rejection reason',
    ]);

    $this->actingAs($this->superAdmin);

    $response = $this->post(route('bookings.approve', $rejectedBooking));

    expect(in_array($response->status(), [302, 403], true))->toBeTrue();
    if ($response->status() === 403) {
        $response->assertForbidden();
    } else {
        $response->assertSessionHasErrors(['booking']);
    }
    expect($rejectedBooking->fresh()->status)->toBe('rejected');
});

test('super admin is forbidden from rejecting a time booking that is not in submitted state', function () {
    $approvedBooking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Already approved feature task',
        'status' => 'approved',
    ]);

    $this->actingAs($this->superAdmin);

    $response = $this->post(route('bookings.reject', $approvedBooking), [
        'rejection_reason' => 'Attempting post-approval rejection by super admin',
    ]);

    expect(in_array($response->status(), [302, 403], true))->toBeTrue();
    if ($response->status() === 403) {
        $response->assertForbidden();
    } else {
        $response->assertSessionHasErrors(['booking']);
    }
    expect($approvedBooking->fresh()->status)->toBe('approved');
});

/*
|--------------------------------------------------------------------------
| 7. Direct Policy Gate Evaluations (TimeBookingPolicy & PurchaseOrderPolicy)
|--------------------------------------------------------------------------
*/

test('time booking policy create gate strictly allows only consultants', function () {
    expect(Gate::forUser($this->consultant)->allows('create', TimeBooking::class))->toBeTrue();
    expect(Gate::forUser($this->projectLead)->allows('create', TimeBooking::class))->toBeFalse();
    expect(Gate::forUser($this->purchasingUser)->allows('create', TimeBooking::class))->toBeFalse();
    expect(Gate::forUser($this->superAdmin)->allows('create', TimeBooking::class))->toBeFalse();
});

test('purchase order policy denies consultant from booking time on unassigned or closed orders', function () {
    $unassignedOrder = PurchaseOrder::create([
        'order_number' => '4500099992',
        'title' => 'Unassigned Project Beta',
        'total_person_days' => 20.0,
        'start_date' => '2026-10-01',
        'target_end_date' => '2026-12-31',
        'status' => 'active',
        'supplier_id' => $this->supplier->id,
    ]);

    $closedOrder = PurchaseOrder::create([
        'order_number' => '4500088881',
        'title' => 'Closed Project Gamma',
        'total_person_days' => 20.0,
        'start_date' => '2026-01-01',
        'target_end_date' => '2026-06-30',
        'status' => 'closed',
        'supplier_id' => $this->supplier->id,
    ]);
    $closedOrder->assignedConsultants()->attach($this->consultant->id);

    // Consultant can book on assigned active order
    expect(Gate::forUser($this->consultant)->allows('bookTime', $this->order))->toBeTrue();

    // Consultant cannot book on unassigned active order
    expect(Gate::forUser($this->consultant)->allows('bookTime', $unassignedOrder))->toBeFalse();
    expect(Gate::forUser($this->consultant)->denies('bookTime', $unassignedOrder))->toBeTrue();

    // Consultant cannot book on closed order even if assigned
    expect(Gate::forUser($this->consultant)->allows('bookTime', $closedOrder))->toBeFalse();
    expect(Gate::forUser($this->consultant)->denies('bookTime', $closedOrder))->toBeTrue();

    // Non-consultants cannot book time on orders
    expect(Gate::forUser($this->projectLead)->allows('bookTime', $this->order))->toBeFalse();
    expect(Gate::forUser($this->purchasingUser)->allows('bookTime', $this->order))->toBeFalse();
    expect(Gate::forUser($this->superAdmin)->allows('bookTime', $this->order))->toBeFalse();
});

test('time booking policy approve and reject gates require authorized role', function () {
    $submittedBooking = TimeBooking::create([
        'purchase_order_id' => $this->order->id,
        'user_id' => $this->consultant->id,
        'date' => '2026-11-04',
        'hours' => 8.0,
        'description' => 'Submitted work item',
        'status' => 'submitted',
    ]);

    expect(Gate::forUser($this->projectLead)->allows('approve', $submittedBooking))->toBeTrue();
    expect(Gate::forUser($this->superAdmin)->allows('approve', $submittedBooking))->toBeTrue();
    expect(Gate::forUser($this->consultant)->allows('approve', $submittedBooking))->toBeFalse();
    expect(Gate::forUser($this->purchasingUser)->allows('approve', $submittedBooking))->toBeFalse();

    expect(Gate::forUser($this->projectLead)->allows('reject', $submittedBooking))->toBeTrue();
    expect(Gate::forUser($this->superAdmin)->allows('reject', $submittedBooking))->toBeTrue();
    expect(Gate::forUser($this->consultant)->allows('reject', $submittedBooking))->toBeFalse();
    expect(Gate::forUser($this->purchasingUser)->allows('reject', $submittedBooking))->toBeFalse();
});

