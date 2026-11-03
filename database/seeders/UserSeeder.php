<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $supplier = Supplier::where('name', 'Acme Consulting GmbH')->first();
        $password = Hash::make('password');

        // Role 0: Super Admin (General Platform Overseer)
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => $password,
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // Role 1: External Consultant (Supplier side)
        User::updateOrCreate(
            ['email' => 'consultant@example.com'],
            [
                'name' => 'Alex Rivera',
                'password' => $password,
                'role' => 'consultant',
                'supplier_id' => $supplier?->id,
                'email_verified_at' => now(),
            ]
        );

        // Role 1b: External Consultant 2 (Supplier side)
        User::updateOrCreate(
            ['email' => 'consultant2@example.com'],
            [
                'name' => 'Elena Rostova',
                'password' => $password,
                'role' => 'consultant',
                'supplier_id' => $supplier?->id,
                'email_verified_at' => now(),
            ]
        );

        // Role 1c: External Consultant 3 (Supplier side)
        User::updateOrCreate(
            ['email' => 'consultant3@example.com'],
            [
                'name' => 'David Chen',
                'password' => $password,
                'role' => 'consultant',
                'supplier_id' => $supplier?->id,
                'email_verified_at' => now(),
            ]
        );

        // Role 2: Client Project Lead
        User::updateOrCreate(
            ['email' => 'projectlead@example.com'],
            [
                'name' => 'Sarah Schmidt',
                'password' => $password,
                'role' => 'project_lead',
                'email_verified_at' => now(),
            ]
        );

        // Role 3: Purchasing / Finance
        User::updateOrCreate(
            ['email' => 'purchasing@example.com'],
            [
                'name' => 'Michael Weber',
                'password' => $password,
                'role' => 'purchasing',
                'email_verified_at' => now(),
            ]
        );
    }
}
