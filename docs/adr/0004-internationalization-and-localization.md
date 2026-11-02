# 0004 · Internationalization and Localization Strategy (German & English)

- **Status:** accepted
- **Date:** 2026-11-02
- **Deciders:** Team HourRadar

## Context

HourRadar is deployed in an enterprise procurement environment subject to strict German statutory labor law (ArbZG § 3 daily hours ceiling, § 4 mandatory breaks, § 5 11h rest periods, § 9 Sunday work restrictions) and German commercial law (HGB § 377, GoBD). While enterprise stakeholders, procurement officers, and works council representatives require full German terminology (*Personentage*, *Einzelbestellung*, *Budgetreichweite*, *Leistungsnachweis*, *3-Wege-Abgleich*), international external consultants and cross-border project managers operate primarily in English.

We need a lightweight, reactive internationalization strategy that supports both German (`de`) and English (`en`) seamlessly across server-side validation, Inertia page props, client-side UI, and live burndown visual analytics without introducing bulky runtime overhead or breaking state.

## Options considered

1. **Option A: Client-only i18n bundle (e.g., `i18next` / `react-intl`)**
   - *Pros:* Rich ecosystem, battle-tested formatting helpers.
   - *Cons:* Adds unnecessary client package weight, decouples frontend language from backend validation error messages and session persistence, and requires extra hydration steps.

2. **Option B: Backend-only full-page reloads with Laravel JSON files**
   - *Pros:* Native Laravel feature (`resources/lang/*.json`).
   - *Cons:* Forces full page roundtrips on language toggle; destroys client state and interactive SVG chart inspection states; awkward integration with Inertia.js components.

3. **Option C: Unified Hybrid Pipeline (Laravel `SetLocale` Middleware + Unencrypted Cookie + Inertia Shared Props + Typesafe Client Dictionary)**
   - *Pros:*
     - Backend detects locale through priority hierarchy: explicit query parameter (`?lang=`) → unencrypted cookie (`locale`) → session (`session('locale')`) → HTTP `Accept-Language` header → `config('app.locale')`.
     - Inertia `HandleInertiaRequests` shares `locale` and available locales with zero extra API endpoints.
     - Unencrypted cookie permits immediate, zero-flicker client-side reading before hydration.
     - Client `useTranslation()` React hook provides instantaneous translation with graceful fallback to English and `{param}` interpolation.
     - Dedicated `POST /locale` route allows instant switching preserved across sessions.
   - *Cons:* Dictionaries must be maintained for new keys added to the platform.

## Decision

We choose **Option C: Unified Hybrid Pipeline**.

1. **Backend Middleware (`App\Http\Middleware\SetLocale`)**:
   - Intercepts requests, validates against `['en', 'de']`, updates `app()->setLocale($locale)` and session.
   - Sets a 1-year unencrypted cookie `locale` exempted from encryption in `bootstrap/app.php`.
2. **Inertia Bridge (`App\Http\Middleware\HandleInertiaRequests`)**:
   - Shares `locale` and `locales` to all client components.
3. **Frontend Architecture (`resources/js/lib/i18n.ts` & `LanguageSwitcher.tsx`)**:
   - Provides a declarative dictionary with German enterprise procurement terminology.
   - Provides `LanguageSwitcher` in header and landing navigation.
   - Chart and UI components subscribe reactively to language changes.

## Consequences

- **What becomes easier:**
  - Works council and German procurement auditors can review the platform entirely in native German terminology (*Personentage*, *Leistungsnachweise*, *ArbZG*).
  - External international contractors can switch to English with a single click.
  - Language preference persists across page reloads and browser sessions via both cookie and session.
- **What becomes harder:**
  - Future UI additions must register domain keys in both `en` and `de` sections in `i18n.ts`.
