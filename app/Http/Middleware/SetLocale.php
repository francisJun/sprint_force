<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Supported application locales
     */
    public const SUPPORTED_LOCALES = ['en', 'de'];

    /**
     * Handle an incoming request and set the active locale.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('lang')
            ?? $request->cookie('locale')
            ?? session('locale')
            ?? $request->getPreferredLanguage(self::SUPPORTED_LOCALES)
            ?? config('app.locale', 'en');

        if (! in_array($locale, self::SUPPORTED_LOCALES, true)) {
            $locale = 'en';
        }

        app()->setLocale($locale);
        session()->put('locale', $locale);

        $response = $next($request);

        // Synchronize unencrypted locale cookie if missing or mismatched
        $finalLocale = app()->getLocale();
        if ($request->cookie('locale') !== $finalLocale) {
            $response->headers->setCookie(cookie('locale', $finalLocale, 60 * 24 * 365, null, null, false, false));
        }

        return $response;
    }
}

