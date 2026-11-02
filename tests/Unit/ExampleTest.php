<?php

test('tests run against an in-memory database and never touch the real database', function () {
    expect(config('database.default'))->toBe('sqlite');
    expect(config('database.connections.sqlite.database'))->toBe(':memory:');
    expect(app()->environment())->toBe('testing');
});
