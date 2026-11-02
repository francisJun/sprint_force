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
