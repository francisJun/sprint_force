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
| **External Consultant** | `consultant@example.com` | `password` | • Book hours against assigned order `4500012345`<br>• Test **Free Budget**: try booking beyond remaining PD to see rejection message (`Booking rejected: only X PD left on order...`)<br>• Test **ArbZG § 3**: book $>10$ hours to see statutory rejection; book between $8$ and $10$ hours to observe compensatory rest notice<br>• Test **ArbZG § 5**: book overlapping or adjacent shifts with $<11$ hours rest to see rest period rejection<br>• Test **ArbZG § 9**: try booking on Sunday or German public holiday<br>• Test **Vacations**: book during an approved vacation block to see leave collision rejection<br>• Chat with the embedded streaming AI assistant |
| **Client Project Lead** | `projectlead@example.com` | `password` | Review active Purchase Orders with the interactive Burndown Chart and Runway traffic light. Approve or reject pending bookings in 1 click and observe the remaining budget and forecast dates recalculate in real-time. |
| **Purchasing / Finance** | `purchasing@example.com` | `password` | Inspect portfolio orders and observe the 4-week procurement lead time re-order alert banner. |

---

## Evidence Map

Where the technical jury can inspect the evidence for each [technical scoring criterion](docs/scoring.md):

| Criterion | Implementation Evidence |
| --- | --- |
| **1 · Persistence and data model** | [database/migrations/](database/migrations/) (discrete per-table migrations `000001`–`000006`, time intervals & statutory attributes in `2026_11_02_000001`), [app/Models/](app/Models/), [docs/domain.md (Mermaid ER Diagram & Data Model)](docs/domain.md) |
| **2 · Business rules and unit tests** | • **Domain Rules in One Dedicated Place**: [app/Domain/TimeTracking/](app/Domain/TimeTracking/)<br>• **Entity Domain Method**: `PurchaseOrder::book(User $consultant, array $attributes)` in [app/Models/PurchaseOrder.php](app/Models/PurchaseOrder.php)<br>• **Order Free Budget Rule**: [OrderFreeBudgetRule.php](app/Domain/TimeTracking/Rules/OrderFreeBudgetRule.php)<br>• **No Overlapping Bookings Rule**: [NoOverlappingBookingsRule.php](app/Domain/TimeTracking/Rules/NoOverlappingBookingsRule.php)<br>• **ArbZG § 3 (10h Max & 8h Notice)**: [ArbzgDailyLimitRule.php](app/Domain/TimeTracking/Rules/ArbzgDailyLimitRule.php)<br>• **ArbZG § 5 (11h Rest Period)**: [ArbzgRestPeriodRule.php](app/Domain/TimeTracking/Rules/ArbzgRestPeriodRule.php)<br>• **ArbZG § 9 (Sundays & German Holidays)**: [ArbzgSundayHolidayRule.php](app/Domain/TimeTracking/Rules/ArbzgSundayHolidayRule.php) & [GermanPublicHolidayService.php](app/Domain/TimeTracking/Services/GermanPublicHolidayService.php)<br>• **Approved Vacation Block Rule**: [NoApprovedVacationRule.php](app/Domain/TimeTracking/Rules/NoApprovedVacationRule.php)<br>• **Domain Orchestration Action**: [BookTimeAction.php](app/Domain/TimeTracking/Actions/BookTimeAction.php)<br>• **Pest Unit Tests (Sentence Naming, Accepted + Rejected + Edge Cases)**: [tests/Unit/Domain/TimeTracking/](tests/Unit/Domain/TimeTracking/) (All passing green with `php artisan test`)<br>• **Statutory & Domain ADR**: [docs/adr/0005-arbzg-and-business-rule-enforcement.md](docs/adr/0005-arbzg-and-business-rule-enforcement.md) |
| **3 · Roles, permissions and privacy** | [docs/roles-and-privacy.md](docs/roles-and-privacy.md), server-side checks in [app/Http/Controllers/TimeBookingController.php](app/Http/Controllers/TimeBookingController.php), multi-role UI routing in [app/Http/Controllers/DashboardController.php](app/Http/Controllers/DashboardController.php) |
| **4 · Architecture and engineering** | • Clean Domain separation (`app/Domain/`)<br>• Required ADRs in [docs/adr/](docs/adr/): [0001 (Stack)](docs/adr/0001-laravel-inertia-react-stack.md), [0002 (Identity)](docs/adr/0002-identity-and-access-management.md), [0003 (Operation)](docs/adr/0003-operation-and-deployment-strategy.md), [0004 (Bilingual i18n)](docs/adr/0004-internationalization-and-localization.md), [0005 (ArbZG & Business Rules)](docs/adr/0005-arbzg-and-business-rule-enforcement.md)<br>• Full English & German bilingual support with [LanguageSwitcher](resources/js/components/LanguageSwitcher.tsx) and [i18n library](resources/js/lib/i18n.ts)<br>• Streaming RAG chatbot with mock switch ([app/Http/Controllers/ChatbotController.php](app/Http/Controllers/ChatbotController.php)) |
| **5 · Runs from README** | Complete step-by-step instructions above; SQLite zero-config persistence. |

---

## Team — Sprint Force

| Name | GitHub Handle |
| --- | --- |
| RADEEYA WUNTIA | [@RADEEYA-WUNTIA](https://github.com/RADEEYA-WUNTIA) |
| SUMAILA MOHAMMED SUADIK | [@msumaila775-rgb](https://github.com/msumaila775-rgb) |
| Fosuhene Samuel | [@da-real-alpha](https://github.com/da-real-alpha) |
| Fusheini Amin | [@fusheiniamin721-dotcom](https://github.com/fusheiniamin721-dotcom) |
