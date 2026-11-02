<?php

use App\Models\Supplier;
use App\Models\User;

beforeEach(function () {
    $this->supplier = Supplier::create([
        'name' => 'Adesso SE',
        'contact_email' => 'contact@adesso.de',
    ]);

    $this->superAdmin = User::factory()->create([
        'name' => 'Global Super Admin',
        'email' => 'superadmin@example.com',
        'role' => 'super_admin',
    ]);

    $this->projectLead = User::factory()->create([
        'name' => 'Project Lead',
        'email' => 'lead@example.com',
        'role' => 'project_lead',
    ]);

    $this->purchasingUser = User::factory()->create([
        'name' => 'Purchasing Manager',
        'email' => 'purchasing_user@example.com',
        'role' => 'purchasing',
    ]);

    $this->consultantUser = User::factory()->create([
        'name' => 'Dev Consultant',
        'email' => 'consultant_user@example.com',
        'role' => 'consultant',
        'supplier_id' => $this->supplier->id,
    ]);
});

test('unauthenticated visitors cannot access admin user management', function () {
    $response = $this->get(route('admin.users.index'));
    $response->assertRedirect(route('login'));
});

test('consultants are forbidden from accessing admin user management', function () {
    $this->actingAs($this->consultantUser);

    $response = $this->get(route('admin.users.index'));
    $response->assertForbidden();
});

test('project leads are forbidden from accessing admin user management', function () {
    $this->actingAs($this->projectLead);

    $response = $this->get(route('admin.users.index'));
    $response->assertForbidden();
});

test('purchasing agents are forbidden from accessing admin user management', function () {
    $this->actingAs($this->purchasingUser);

    $response = $this->get(route('admin.users.index'));
    $response->assertForbidden();
});

test('super admin can view user management page with stats and matrix', function () {
    $this->actingAs($this->superAdmin);

    $response = $this->get(route('admin.users.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data')
        ->has('stats')
        ->has('permissionsMatrix')
        ->where('stats.total_users', 4)
    );
});

test('super admin can create a project lead user', function () {
    $this->actingAs($this->superAdmin);

    $response = $this->post(route('admin.users.store'), [
        'name' => 'New Lead',
        'email' => 'newlead@example.com',
        'password' => 'secretPassword123',
        'role' => 'project_lead',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'newlead@example.com',
        'role' => 'project_lead',
    ]);
});

test('super admin can create a consultant requiring supplier affiliation', function () {
    $this->actingAs($this->superAdmin);

    // Missing supplier should fail validation
    $failedResponse = $this->post(route('admin.users.store'), [
        'name' => 'Contractor Without Supplier',
        'email' => 'contractor@example.com',
        'password' => 'secretPassword123',
        'role' => 'consultant',
    ]);
    $failedResponse->assertSessionHasErrors('supplier_id');

    // With supplier should succeed
    $successResponse = $this->post(route('admin.users.store'), [
        'name' => 'Valid Contractor',
        'email' => 'contractor@example.com',
        'password' => 'secretPassword123',
        'role' => 'consultant',
        'supplier_id' => $this->supplier->id,
    ]);
    $successResponse->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'contractor@example.com',
        'role' => 'consultant',
        'supplier_id' => $this->supplier->id,
    ]);
});

test('super admin can update a user details and role', function () {
    $this->actingAs($this->superAdmin);

    $targetUser = User::factory()->create([
        'name' => 'Initial Name',
        'email' => 'initial@example.com',
        'role' => 'project_lead',
    ]);

    $response = $this->put(route('admin.users.update', $targetUser), [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'role' => 'purchasing',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $targetUser->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'role' => 'purchasing',
    ]);
});

test('cannot demote the last super admin on the platform', function () {
    $this->actingAs($this->superAdmin);

    // Only 1 super admin exists
    $response = $this->put(route('admin.users.update', $this->superAdmin), [
        'name' => $this->superAdmin->name,
        'email' => $this->superAdmin->email,
        'role' => 'project_lead',
    ]);

    $response->assertSessionHasErrors('role');
    $this->assertEquals('super_admin', $this->superAdmin->fresh()->role);
});

test('cannot delete self as super admin', function () {
    $this->actingAs($this->superAdmin);

    $response = $this->delete(route('admin.users.destroy', $this->superAdmin));

    $response->assertSessionHasErrors('error');
    $this->assertDatabaseHas('users', ['id' => $this->superAdmin->id]);
});

test('cannot delete the last super admin even if requested', function () {
    $this->actingAs($this->superAdmin);

    // Attempting to delete sole super admin
    $response = $this->delete(route('admin.users.destroy', $this->superAdmin));
    $response->assertSessionHasErrors('error');
});

test('super admin can delete another non-admin user', function () {
    $this->actingAs($this->superAdmin);

    $targetUser = User::factory()->create([
        'name' => 'User To Remove',
        'email' => 'remove@example.com',
        'role' => 'project_lead',
    ]);

    $response = $this->delete(route('admin.users.destroy', $targetUser));

    $response->assertRedirect();
    $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
});

test('super admin accesses platform overseer dashboard with overseer stats', function () {
    $this->actingAs($this->superAdmin);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats.total_users')
        ->has('stats.role_counts.super_admin')
        ->has('recentUsers')
    );
});

