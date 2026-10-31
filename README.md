# HourRadar

> **Every hour you buy, in view.**
> Real-time time booking, predictive budget runway forecasting, and automated German ArbZG legal compliance for external project delivery.

Read our complete [Product Vision](docs/product-vision.md) and [Architecture Decision Record (ADR 0001)](docs/adr/0001-laravel-inertia-react-stack.md).

---

## Prerequisites

| Tool | Required Version | Verification Command |
| --- | --- | --- |
| **PHP** | 8.3+ | `php -v` |
| **Composer** | 2.x+ | `composer -v` |
| **Node.js** | 20.x+ | `node -v` |
| **npm** | 10.x+ | `npm -v` |

*(If using [Laravel Herd](https://herd.laravel.com), PHP, Composer, and local domains are pre-configured out-of-the-box).*

---

## Setup

Run these commands in order from a fresh repository clone:

```bash
# 1. Install dependencies
composer install
npm install

# 2. Configure environment
cp .env.example .env
php artisan key:generate

# 3. Migrate and seed demo database (SQLite - zero config required)
php artisan migrate:fresh --seed
```

---

## Run

Start the application servers:

```bash
# Option A: Standard local servers
php artisan serve
npm run dev

# Option B: With Laravel Herd (instant local URL)
# Visit: http://hourradar.test (after running: npm run dev)
```

Open your browser at **[http://localhost:8000](http://localhost:8000)** (or `http://hourradar.test`).

---

## Test

Run all automated unit and feature tests:

```bash
php artisan test
```

---

## Demo Users

The database seed provides one ready-to-test demo user for each key role:

| Role | Sign In Email | Password | What to Try |
| --- | --- | --- | --- |
| **External Consultant** | `consultant@example.com` | `password` | Book hours against assigned order `4500012345`. Test ArbZG § 3 validation by booking $>10$ hours (see rejection). Add a planned vacation block. Chat with the streaming AI assistant. |
| **Client Project Lead** | `projectlead@example.com` | `password` | Review active Purchase Orders with the Runway traffic light. Approve or reject pending bookings in 1 click and observe the remaining budget and forecast dates recalculate in real-time. |
| **Purchasing / Finance** | `purchasing@example.com` | `password` | Inspect portfolio orders and observe the 4-week procurement lead time re-order alert banner. |

---

## Evidence Map

Where the technical jury can inspect the evidence for each [technical scoring criterion](docs/scoring.md):

| Criterion | Implementation Evidence |
| --- | --- |
| **1 · Persistence and data model** | [database/migrations/2026_10_30_000001_create_hourradar_core_tables.php](database/migrations/2026_10_30_000001_create_hourradar_core_tables.php), [app/Models/](app/Models/), [docs/domain.md](docs/domain.md) |
| **2 · Business rules and unit tests** | [app/Domain/TimeTracking/Rules/ArbzgDailyLimitRule.php](app/Domain/TimeTracking/Rules/ArbzgDailyLimitRule.php), [app/Domain/TimeTracking/Rules/ConsultantAssignedToOrderRule.php](app/Domain/TimeTracking/Rules/ConsultantAssignedToOrderRule.php), [app/Domain/Budget/Services/RunwayForecastService.php](app/Domain/Budget/Services/RunwayForecastService.php), [tests/Unit/Domain/](tests/Unit/Domain/) |
| **3 · Roles, permissions and privacy** | [docs/roles-and-privacy.md](docs/roles-and-privacy.md), server-side checks in [app/Http/Controllers/TimeBookingController.php](app/Http/Controllers/TimeBookingController.php), multi-role UI routing in [app/Http/Controllers/DashboardController.php](app/Http/Controllers/DashboardController.php) |
| **4 · Architecture and engineering** | • Clean Domain separation (`app/Domain/`)<br>• Required ADRs in [docs/adr/](docs/adr/): [0001 (Stack)](docs/adr/0001-laravel-inertia-react-stack.md), [0002 (Identity)](docs/adr/0002-identity-and-access-management.md), [0003 (Operation)](docs/adr/0003-operation-and-deployment-strategy.md)<br>• Clean Git commit history<br>• Streaming RAG chatbot with mock switch ([app/Http/Controllers/ChatbotController.php](app/Http/Controllers/ChatbotController.php)) |
| **5 · Runs from README** | Complete step-by-step instructions above; SQLite zero-config persistence. |

---

## Team — Sprint Force

| Name | GitHub Handle |
|---|---|
| [Your Name] | [@github-handle](https://github.com/your-handle) |
