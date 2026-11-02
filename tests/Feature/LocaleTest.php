<?php

use App\Http\Middleware\SetLocale;

it('defaults to english when no locale preference is specified', function () {
    $response = $this->get('/');

    $response->assertOk();
    expect(app()->getLocale())->toBe('en');
});

it('allows switching locale to german via post route', function () {
    $response = $this->post('/locale', [
        'locale' => 'de',
    ]);

    $response->assertSessionHas('locale', 'de');
    $response->assertPlainCookie('locale', 'de');
});

it('rejects unsupported locales with validation error', function () {
    $response = $this->post('/locale', [
        'locale' => 'fr',
    ]);

    $response->assertSessionHasErrors('locale');
});

it('respects query parameter lang to switch locale', function () {
    $response = $this->get('/?lang=de');

    $response->assertOk();
    expect(app()->getLocale())->toBe('de');
});

it('respects cookie to set application locale', function () {
    $response = $this->withUnencryptedCookie('locale', 'de')->get('/');

    $response->assertOk();
    expect(app()->getLocale())->toBe('de');
});

