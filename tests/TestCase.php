<?php

namespace Tests;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    public User $consultant;
    public PurchaseOrder $order;
    public mixed $rule = null;

    protected function setUp(): void
    {
        parent::setUp();

        // Safety guarantee: Ensure tests NEVER run against the actual physical database
        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
        ]);
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
