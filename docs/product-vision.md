# Product vision

> Completed product vision for HourRadar. Every AI prompt in the [guide](guide.md) uses this file as context.

## Product name

HourRadar

## In one sentence

For **client project leads and external service providers**, who **struggle with double-entry, slow invoice approvals, and sudden budget depletion**, our product **HourRadar** is an **integrated booking and budget intelligence platform** that **bridges consultant timesheets with client order budgets in real time**. Unlike spreadsheets and the old tool, it **validates German working time rules (ArbZG) instantly, predicts the exact budget end date with holiday/vacation runways, and assists users with an embedded streaming RAG chatbot**.

## Who we build for first

Client Project Lead (for budget steering, approvals, and runway forecasting) enabled by the External Consultant (for fast, ArbZG-compliant daily bookings).

## Roles

| Role | Side (client / supplier) | What they want from the product |
| --- | --- | --- |
| External Consultant | Supplier | Quick daily booking on assigned orders, validation feedback (ArbZG rules), and entry of planned vacations. |
| Project Lead | Client | Real-time budget cockpit, runway forecasts, and 1-click approvals for submitted bookings. |
| Purchasing / Finance | Client | Early warning when follow-up orders are needed (4-week procurement lead time) and automated verification of invoice data. |

## The core flow

1. **Order Setup**: Purchasing / Project Lead defines active Purchase Orders (e.g., 140 person-days) with assigned suppliers and external consultants.
2. **Booking & Compliance**: An External Consultant logs in, selects their assigned PO, and books hours with a task description; server-side ArbZG checks validate maximum hours and break limits.
3. **Approval**: The Client Project Lead reviews submitted bookings and approves them in 1 click.
4. **Runway Impact**: Approved bookings update the order's remaining person-days, immediately recalculating the forecasted depletion date taking into account pace, German public holidays, and consultant vacations.
5. **Early Warning**: If budget exhaustion is forecasted within the 4-week procurement lead time, Purchasing receives an early re-order alert.

## What makes us special

- **Predictive Runway Forecasting**: Forecasts the exact calendar depletion date based on velocity, public holidays, and upcoming planned consultant vacations.
- **Automated ArbZG Legal Guardrails**: Real-time compliance feedback enforcing German working time laws (e.g. 8h/10h daily limits, rest periods) to protect both parties.
- **Embedded Streaming RAG Chatbot**: Plain-language AI assistant with streaming text to answer platform usage, order, and compliance questions (with a mock switch for offline/juror evaluation).

## What we leave out on purpose

- Real payment execution, bank transfers, or automated SEPA wire generation (tracking and invoice validation only).
- Direct bidirectional sync or ERP integration with legacy SAP systems.
- Native mobile app store builds (iOS/Android); focus on a responsive, accessible web application.

## Our track

Working code (targeting up to 10 technical points).

## Our stack

- **Backend**: Laravel 13 (PHP 8.3+)
- **Frontend**: Inertia.js with React 19 + Vite + Tailwind CSS
- **Database**: SQLite (zero-config, local file persistence)
- **Testing**: Pest PHP (`php artisan test`)
- **API Docs**: Dedoc Scramble (automated OpenAPI / Swagger)
- **AI / Chatbot**: Laravel AI SDK / Streaming SSE with local mock fallback (`AI_MOCK=true`)
- **ADR**: [docs/adr/0001-laravel-inertia-react-stack.md](adr/0001-laravel-inertia-react-stack.md)
