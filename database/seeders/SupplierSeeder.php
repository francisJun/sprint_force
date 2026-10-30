<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        Supplier::firstOrCreate(
            ['name' => 'Acme Consulting GmbH'],
            ['contact_email' => 'contact@acme-consulting.de']
        );
    }
}

