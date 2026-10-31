# 0001: Technology Stack

- Status: accepted
- Date: 2026-10-30
- Deciders: Team Sprint Force (HourRadar)

## Context

For the Article26 Hackathon 2026, the team needs a productive, robust, and maintainable technology stack to build **HourRadar**, an integrated time booking and budget intelligence platform with:

- Multi-role support (Client Project Lead, External Consultant, Purchasing / Finance).
- Real-time order budget calculations and predictive runway forecasting.
- German Working Time Act (ArbZG) validation rules enforced on the server.
- An embedded streaming AI chatbot (RAG) to assist users with platform usage, order rules, and compliance questions.
- A requirement that the technical jury can easily run and evaluate the product from the README within 5 minutes without needing paid cloud accounts or complex container setups.

The team has strong experience with PHP, Laravel, React, and Laravel Herd on macOS and Windows.

## Decision

We choose the following modern full-stack ecosystem:

1. **Backend & Framework**: **Laravel 13** (PHP 8.3+)
   - Robust service container, Eloquent ORM, database migrations, and built-in authentication.
   - Clean architectural separation between Domain Services, Form Requests / DTOs, and Eloquent Models.
2. **Frontend & UI**: **Inertia.js (React) + Vite + Tailwind CSS**
   - Combines the developer velocity of a monolithic Laravel app with a modern React component UI without client-side state boilerplate or CORS friction.
3. **Database**: **SQLite** (`database/database.sqlite`)
   - Fully zero-configuration: requires no external database server, Docker containers, or service credentials.
   - Survives restarts and supports rapid automated seeding for demo accounts and initial orders.
4. **Test Runner**: **Pest PHP** (`php artisan test`)
   - Expressive, readable syntax for unit and feature testing of business rules (e.g. ArbZG daily limits, budget depletion).
5. **API Documentation**: **Dedoc Scramble** (`dedoc/scramble`)
   - Generates interactive OpenAPI / Swagger UI automatically without tedious manual PHPDoc annotations.
6. **AI Assistant & Streaming**: **Laravel AI SDK / OpenAI / Anthropic PHP with Mock Fallback**
   - Streaming Server-Sent Events (SSE) from a Laravel controller to the React frontend.
   - Uses an `AI_MOCK=true` toggle in `.env.example` by default so the technical jury can test the streaming chatbot completely offline without requiring paid API keys.

## Consequences

### Positive

- **Fast Local Setup**: Works seamlessly with Laravel Herd on both macOS and Windows.
- **Evaluation Simplicity**: The technical jury can run the application with standard `composer install`, `npm install`, and `php artisan serve` with SQLite.
- **Rich Interactive UI**: React + Tailwind provides a responsive, modern interface for both time booking and interactive budget runways.
- **Compliance & Offline AI**: Server-enforced domain rules tested with Pest; AI assistant runs reliably in mock mode or live with an API key.

### Negative / Trade-offs

- The team must ensure SQLite foreign key constraints and date calculations match production-grade behavior.
- Real-time streaming over Inertia requires dedicated streaming endpoints (SSE / `fetch`) rather than standard Inertia page visits.
