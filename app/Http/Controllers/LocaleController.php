<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Switch application language.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:'.implode(',', SetLocale::SUPPORTED_LOCALES)],
        ]);

        $locale = $validated['locale'];
        session()->put('locale', $locale);
        app()->setLocale($locale);

        return back()->withCookie(
            cookie('locale', $locale, 60 * 24 * 365, null, null, false, false)
        );
    }
}

