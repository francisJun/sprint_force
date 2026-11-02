<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title') - HourRadar</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        @vite(['resources/css/app.css'])
    </head>
    <body class="flex min-h-screen flex-col items-center justify-center bg-gov-canvas px-4 text-center text-gov-text font-sans antialiased">
        <p class="text-sm font-mono font-semibold text-gov-interactive">@yield('code')</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-gov-text sm:text-4xl">@yield('header')</h1>
        <p class="mt-3 max-w-md text-sm text-gov-muted">@yield('message')</p>
        <div class="mt-6 flex items-center gap-3">
            <a
                href="/dashboard"
                class="inline-flex h-9 items-center justify-center rounded-md bg-gov-interactive px-4 text-sm font-medium text-white hover:bg-gov-interactive-hover transition-colors"
            >
                Back to dashboard
            </a>
            <a
                href="/"
                class="inline-flex h-9 items-center justify-center rounded-md border border-gov-border bg-gov-surface px-4 text-sm font-medium text-gov-text hover:bg-gov-surface-hover transition-colors"
            >
                Home
            </a>
        </div>
    </body>
</html>
