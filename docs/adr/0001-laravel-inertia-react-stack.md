# 0001 · Technology Stack Selection

- **Status:** accepted
- **Date:** 2026-10-30
- **Deciders:** Team HourRadar

## Context

Enterprise time booking and procurement governance platforms bridge two contrasting domains: strict backend business logic (German statutory labor law compliance, budget accounting, multi-role security) and modern, highly reactive user interfaces (interactive calendar pickers, live burndown charts, real-time runway recalculations).

The engineering stack must satisfy the following technical requirements:

- Multi-role role-based access control (External Consultant, Project Lead, Purchasing/Finance, Super Admin).
- Server-side enforcement of German Working Time Act (ArbZG) regulations and purchase order budget ceilings.
- High developer velocity with unified security, rapid automated testing, and deterministic local onboarding.
- Interactive, responsive frontend without the architectural overhead and API synchronization friction of decoupled single-page applications.
- Embedded streaming AI assistant capable of running both with live enterprise LLM endpoints and an offline local fallback.

## Options Considered

1. **Option A: Decoupled REST/GraphQL API + Standalone SPA (FastAPI/Node.js + React/Next.js)**
   - *Pros:* Complete separation of client and server codebases.
   - *Cons:* Duplicated validation schemas, complex state management (Redux/TanStack Query), CORS and token refresh boilerplate, and slower initial feature velocity.

2. **Option B: Traditional Server-Rendered Monolith (Laravel Blade / Django Templates)**
   - *Pros:* Simple setup, tight backend coupling, built-in CSRF protection.
   - *Cons:* Clunky user experience for interactive features like live calendar bookings, drag-and-drop status changes, and reactive SVG burndown charts without adding disparate JavaScript libraries.

3. **Option C: Modern Monolithic Hybrid (Laravel 13 + Inertia.js + React 19 + Tailwind CSS) [Chosen]**
   - *Pros:* Combines the developer velocity and security of a robust Laravel backend with the component richness and responsiveness of React, eliminating API glue code and state synchronization overhead.

## Decision

We select **Option C: Laravel 13 + Inertia.js + React 19**:

1. **Backend Framework: Laravel 13 (PHP 8.3+)**
   - Provides enterprise-grade routing, dependency injection, Eloquent ORM, database migrations, and robust authentication out of the box.
   - Enforces clean separation between Domain Services (`app/Domain/`), HTTP Controllers, Form Requests/DTOs, and Models.
2. **Frontend Architecture: Inertia.js (React 19) + Vite + Tailwind CSS**
   - Delivers a single-page application feel with classic server-driven routing and controller logic.
   - Eliminates client-side state machine boilerplate while allowing rich component-driven interfaces for interactive dashboards.
3. **Database Tier: SQLite (Local/Edge) with PostgreSQL Migration Path**
   - Embedded SQLite for zero-friction local development, instant test execution, and isolated edge installations.
   - Strict ANSI SQL schema migrations ensure full portability to clustered PostgreSQL in production.
4. **Automated Testing Suite: Pest PHP**
   - Expressive, readable unit and integration tests verifying domain business rules and compliance constraints with 100% test reliability.
5. **API Documentation: Dedoc Scramble**
   - Generates interactive, OpenAPI 3.1-compliant Swagger documentation automatically directly from route definitions and Form Requests without manual PHPDoc upkeep.
6. **Streaming AI Architecture: Laravel AI Controller + Server-Sent Events (SSE)**
   - Streaming SSE endpoint delivers real-time assistant responses.
   - Built-in `AI_MOCK=true` mode provides deterministic, air-gapped evaluation without external network dependencies.

## Consequences

- **What becomes easier:**
  - Full-stack developer productivity: new features require one unified codebase rather than synchronizing disparate backend and frontend repositories.
  - Zero API boilerplate: controllers return Inertia responses with strongly typed props directly into React page components.
  - Testability: Pest unit tests run in milliseconds against in-memory/file-based SQLite without external services.
- **What becomes harder:**
  - Real-time streaming AI requires dedicated SSE / Fetch endpoints rather than standard Inertia page navigation roundtrips.

- **What becomes easier:**
  - Full-stack developer productivity: new features require one unified codebase rather than synchronizing disparate backend and frontend repositories.
  - Zero API boilerplate: controllers return Inertia responses with strongly typed props directly into React page components.
  - Testability: Pest unit tests run in milliseconds against in-memory/file-based SQLite without external services.
- **What becomes harder:**
  - Real-time streaming AI requires dedicated SSE / Fetch endpoints rather than standard Inertia page navigation roundtrips.
