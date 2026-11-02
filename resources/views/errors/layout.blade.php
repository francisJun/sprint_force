<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title') - HourRadar</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">

        @vite(['resources/css/app.css'])

        <style>
            :root {
                --canvas: var(--gov-canvas, #F8FAFC);
                --surface: var(--gov-surface, #FFFFFF);
                --surface-hover: var(--gov-surface-hover, #F1F5F9);
                --header: var(--gov-primary, #0D3B66);
                --border: var(--gov-border, #E2E8F0);
                --text-primary: var(--gov-text, #0F172A);
                --text-muted: var(--gov-muted, #64748B);
                --interactive: var(--gov-interactive, #1C6EA4);
                --interactive-hover: var(--gov-interactive-hover, #175884);
                --success: var(--gov-success-text, #2E7D32);
            }
            @media (prefers-color-scheme: dark) {
                :root {
                    --canvas: var(--gov-canvas, #0A0F1D);
                    --surface: var(--gov-surface, #111827);
                    --surface-hover: var(--gov-surface-hover, #1F2937);
                    --header: var(--gov-primary, #1E3A5F);
                    --border: var(--gov-border, #1F2937);
                    --text-primary: var(--gov-text, #F8FAFC);
                    --text-muted: var(--gov-muted, #94A3B8);
                    --interactive: var(--gov-interactive, #38BDF8);
                    --interactive-hover: var(--gov-interactive-hover, #0284C7);
                    --success: var(--gov-success-text, #6EE7B7);
                }
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: var(--canvas);
                color: var(--text-primary);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                line-height: 1.45;
                -webkit-font-smoothing: antialiased;
            }
            header {
                height: 56px;
                background-color: var(--header);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 24px;
                color: #FFFFFF;
            }
            .brand {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-weight: 700;
                font-size: 15px;
                text-decoration: none;
                color: #FFFFFF;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                letter-spacing: -0.01em;
            }
            .brand-badge {
                width: 28px;
                height: 28px;
                border-radius: 4px;
                background-color: var(--interactive);
                color: #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 12px;
            }
            .brand-tag {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: rgba(255, 255, 255, 0.5);
                border-left: 1px solid rgba(255, 255, 255, 0.2);
                padding-left: 10px;
                margin-left: 4px;
            }
            main {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 32px 16px;
            }
            .card {
                max-width: 560px;
                width: 100%;
                text-align: center;
                background-color: var(--surface);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 32px;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            }
            .icon-box {
                width: 56px;
                height: 56px;
                border-radius: 8px;
                background-color: var(--canvas);
                border: 1px solid var(--border);
                color: var(--interactive);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                font-weight: 700;
                font-size: 20px;
                font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .code-pill {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-family: ui-monospace, SFMono-Regular, monospace;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                margin-bottom: 16px;
                border: 1px solid var(--border);
                background-color: var(--surface-hover);
                color: var(--text-primary);
            }
            h1 {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 8px;
                letter-spacing: -0.015em;
                line-height: 32px;
                color: var(--text-primary);
            }
            p.description {
                font-size: 14px;
                color: var(--text-muted);
                margin-bottom: 24px;
                line-height: 20px;
                max-width: 460px;
                margin-left: auto;
                margin-right: auto;
            }
            .telemetry-box {
                border: 1px solid var(--border);
                background-color: var(--canvas);
                border-radius: 8px;
                padding: 12px 16px;
                text-align: left;
                font-family: ui-monospace, SFMono-Regular, monospace;
                font-size: 11px;
                color: var(--text-muted);
                margin-bottom: 24px;
            }
            .telemetry-row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
            }
            .telemetry-row:not(:last-child) {
                border-bottom: 1px solid var(--border);
            }
            .telemetry-val {
                color: var(--text-primary);
                font-weight: 600;
            }
            .actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                height: 40px;
                padding: 0 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .btn-primary {
                background-color: var(--interactive);
                color: #FFFFFF;
                border: none;
            }
            .btn-primary:hover {
                background-color: var(--interactive-hover);
            }
            .btn-secondary {
                background-color: var(--surface);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }
            .btn-secondary:hover {
                background-color: var(--surface-hover);
            }
            footer {
                height: 40px;
                border-top: 1px solid var(--border);
                background-color: var(--surface);
                padding: 0 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 12px;
                font-family: ui-monospace, SFMono-Regular, monospace;
                color: var(--text-muted);
            }
        </style>
    </head>
    <body>
        <header>
            <a href="/" class="brand">
                <span class="brand-badge">HR</span>
                <span>HourRadar</span>
                <span class="brand-tag">Enterprise Governance</span>
            </a>
        </header>

        <main>
            <div class="card">
                <div class="icon-box">@yield('code')</div>
                <div><span class="code-pill">HTTP @yield('code') · EXCEPTION</span></div>
                <h1>@yield('header')</h1>
                <p class="description">@yield('message')</p>

                <div class="telemetry-box">
                    <div class="telemetry-row">
                        <span>ERROR STATUS:</span>
                        <span class="telemetry-val">HTTP_@yield('code')</span>
                    </div>
                    <div class="telemetry-row">
                        <span>STATUTORY ENGINE:</span>
                        <span class="telemetry-val" style="color: var(--success);">ArbZG Compliance Active</span>
                    </div>
                </div>

                <div class="actions">
                    <a href="/dashboard" class="btn btn-primary">Return to Dashboard</a>
                    <a href="/" class="btn btn-secondary">Return Home</a>
                </div>
            </div>
        </main>

        <footer>
            <span>HourRadar Enterprise Governance</span>
            <span>German ArbZG Compliance Engine · {{ date('Y') }}</span>
        </footer>
    </body>
</html>
