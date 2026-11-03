# HourRadar

> **Every hour you buy, in view.**
> Real-time time booking, predictive budget runway forecasting, and automated German ArbZG legal compliance for external project delivery.

Read our complete [Product Vision](docs/product-vision.md) and [Architecture Decision Record (ADR 0001)](docs/adr/0001-laravel-inertia-react-stack.md).

---

## Prerequisites

Ensure the following tools are installed on your system before beginning:

| Tool | Required Version | Verification Command | Notes |
| --- | --- | --- | --- |
| **Git** | 2.x+ | `git --version` | Required to clone the repository |
| **PHP** | 8.3+ | `php -v` | Requires `sqlite3`, `pdo_sqlite`, `mbstring`, `openssl`, `curl` extensions |
| **Composer** | 2.x+ | `composer -v` | PHP dependency manager |
| **Node.js** | 20.x+ | `node -v` | JavaScript runtime |
| **npm** | 10.x+ | `npm -v` | Node package manager |

> **Note for [Laravel Herd](https://herd.laravel.com) users:** PHP 8.3+, Composer, and local SQLite extensions are already installed and pre-configured out-of-the-box.

---

## Setup

Follow these steps in order:

### Step 1: Clone the Repository & Enter Directory

```bash
git clone https://github.com/francisJun/sprint_force.git
cd sprint_force
```

*(If you already have the repository folder, simply `cd` into the project root directory).*

### Step 2: Install Dependencies

```bash
# Install PHP backend dependencies
composer install

# Install frontend JavaScript dependencies
npm install
```

### Step 3: Configure Environment

```bash
# Copy example environment configuration
cp .env.example .env

# Generate unique application encryption key
php artisan key:generate
```

> **Safe Defaults:** `.env.example` comes pre-configured with safe local defaults: SQLite database, mock AI mode enabled (`AI_MOCK=true`, `AI_PROVIDER=mock`), and local cache/session drivers. No paid third-party API keys or accounts are required.

### Step 4: Initialize SQLite Database & Seed Demo Data

```bash
# Create SQLite database file to avoid interactive terminal prompts
touch database/database.sqlite

# Run all schema migrations and seed demo users, suppliers, orders, and bookings
php artisan migrate:fresh --seed
```

This automatically seeds the 4 role-based demo accounts, vendor partners, active purchase orders, vacation calendars, and initial time bookings. Data survives restarts.

---

## Run

You can run HourRadar using any of the three options below:

### Option A: Standard Local Development (Recommended)

Run the backend and frontend in two separate terminal windows (or tabs):

```bash
# Terminal 1 — Backend API server:
php artisan serve --port=8000

# Terminal 2 — Frontend asset bundler:
npm run dev
```

Open your browser at: **[http://localhost:8000](http://localhost:8000)**

---

### Option B: Production Build (Single Server)

Build production assets once, then serve through Laravel directly:

```bash
# Build bundled frontend assets into public/build/
npm run build

# Start server
php artisan serve --port=8000
```

Open your browser at: **[http://localhost:8000](http://localhost:8000)**

---

### Option C: With Laravel Herd (macOS)

If you use Laravel Herd:

```bash
# Start frontend asset compilation
npm run dev
```

Herd automatically links the directory. Open your browser at: **[http://hourradar.test](http://hourradar.test)** (or `http://sprint-force.test`).

---

## Test

### Automated PHP Test Suite (Pest)

Execute all 119 unit and feature tests covering domain business rules, ArbZG statutory labor laws, role policies, and budget limits:

```bash
php artisan test
```

*Expected result: 119 passed (119 assertions across 23 test files).*

### Frontend Type Safety Check

Verify TypeScript compilation across all React and Inertia components:

```bash
npm run types:check
```

*Expected result: 0 errors reported by `tsc --noEmit`.*

### Repository Status Check

Run the Article26 Hackathon compliance hook to confirm zero remaining template placeholders:

```bash
bash .claude/hooks/status.sh
```

---

## Demo Users

The database seeder creates one test account per role. All accounts share the same password:

| Role | Sign In Email | Password | Dedicated View | Step-by-Step Test Journey |
| --- | --- | --- | --- | --- |
| **Super Admin (Platform Overseer)** | `admin@example.com` | `password` | `/dashboard` & `/admin/users` | 1. Log in and inspect the Overseer Cockpit telemetry (Total Users, Framework Orders, Audited Hours).<br>2. Click **Manage Users** to view `/admin/users`.<br>3. Click **Roles & Permissions Matrix** to open the interactive RBAC permission dialog.<br>4. Try deleting your own account or the sole remaining admin to observe anti-lockout protection.<br>5. Create a new user or reassign roles dynamically. |
| **External Consultant** | `consultant@example.com` | `password` | `/dashboard` | 1. Log in to access the Consultant Time Booking Cockpit.<br>2. Select active purchase order `4500012345` and log hours.<br>3. **Test Budget Ceiling**: Try booking more hours than remaining Person Days (observe domain rejection: `Booking rejected: only X PD left...`).<br>4. **Test ArbZG § 3**: Book $>10$ hours in a single day to see statutory rejection; book between $8$ and $10$ hours to observe compensatory rest notices.<br>5. **Test ArbZG § 5**: Book consecutive shifts with $<11$ hours rest to observe mandatory rest period rejection.<br>6. **Test ArbZG § 9**: Attempt to book work on a Sunday or German statutory holiday.<br>7. **Test Vacation Collision**: Attempt to book during an approved leave block.<br>8. Click the floating chat drawer to test the streaming HourRadar AI Assistant. |
| **Client Project Lead** | `projectlead@example.com` | `password` | `/dashboard` & `/orders` | 1. Log in to view the Project Lead Cockpit.<br>2. Inspect active Purchase Orders with the interactive Burndown Chart and Runway traffic lights.<br>3. Navigate to **Timesheet Approvals** (`/approvals`) to approve or reject submitted bookings in 1 click.<br>4. Observe remaining order budgets and forecast dates recalculate in real-time. |
| **Purchasing / Finance** | `purchasing@example.com` | `password` | `/dashboard` & `/purchasing/orders` | 1. Log in to review the Procurement Portfolio Dashboard.<br>2. Navigate to **Framework Orders** (`/purchasing/orders`) to see the streamlined portfolio summary.<br>3. Filter by **Re-Order Alert** to view orders approaching the statutory 28-day notice horizon.<br>4. Click **Inspect** on any order to open the full Specification & Predictive Burndown Modal.<br>5. View **Invoices** (`/purchasing/invoices`) for settled burn reconciliations. |

---

## Evidence Map

Where the technical jury can inspect the evidence for each [technical scoring criterion](docs/scoring.md):

| Criterion | Implementation Evidence |
| --- | --- |
| **1 · Persistence and data model** *(0–2 pts · Level 2)* | • **Schema & Migrations**: [database/migrations/](database/migrations/) (discrete per-table migrations `000001`–`000006` with foreign keys, timestamps, and interval types)<br>• **Restart Persistence & Seeders**: [database/seeders/](database/seeders/) (idempotent seeders: `UserSeeder`, `SupplierSeeder`, `PurchaseOrderSeeder`, `TimeBookingSeeder`, `VacationBlockSeeder`)<br>• **Persistence Entities**: [app/Models/](app/Models/) (`PurchaseOrder.php`, `TimeBooking.php`, `User.php`, `Supplier.php`, `VacationBlock.php`)<br>• **Domain Entity Model & Mermaid ERD**: [docs/domain.md](docs/domain.md) (comprehensive business glossary, `now` vs `later` entity expansion stages, foreign keys, burn calculation algorithms) |
| **2 · Business rules and unit tests** *(0–3 pts · Level 3)* | • **Dedicated Domain Folder**: [app/Domain/TimeTracking/](app/Domain/TimeTracking/) (rules live in one dedicated place, not scattered in controllers/UI)<br>• **Core Entity Domain Method**: `PurchaseOrder::book(User $consultant, array $attributes)` in [app/Models/PurchaseOrder.php](app/Models/PurchaseOrder.php)<br>• **Rule 1 — Order Free Budget**: [OrderFreeBudgetRule.php](app/Domain/TimeTracking/Rules/OrderFreeBudgetRule.php) (enforces Person Day ceiling with clear error message)<br>• **Rule 2 — Overlapping Times**: [NoOverlappingBookingsRule.php](app/Domain/TimeTracking/Rules/NoOverlappingBookingsRule.php) (rejects double booking same consultant)<br>• **Rule 3 — ArbZG § 3 (Daily Limit)**: [ArbzgDailyLimitRule.php](app/Domain/TimeTracking/Rules/ArbzgDailyLimitRule.php) (rejects $>10$h; notices for $>8$h)<br>• **Rule 4 — ArbZG § 5 (Rest Period)**: [ArbzgRestPeriodRule.php](app/Domain/TimeTracking/Rules/ArbzgRestPeriodRule.php) (enforces statutory 11-hour rest between shifts)<br>• **Rule 5 — ArbZG § 9 (Sundays & German Holidays)**: [ArbzgSundayHolidayRule.php](app/Domain/TimeTracking/Rules/ArbzgSundayHolidayRule.php) & [GermanPublicHolidayService.php](app/Domain/TimeTracking/Services/GermanPublicHolidayService.php)<br>• **Rule 6 — Approved Vacation Conflict**: [NoApprovedVacationRule.php](app/Domain/TimeTracking/Rules/NoApprovedVacationRule.php)<br>• **Domain Action Pipeline**: [BookTimeAction.php](app/Domain/TimeTracking/Actions/BookTimeAction.php)<br>• **Pest Unit Tests (Sentence Naming, Accepted + Rejected + Edge Cases)**: [tests/Unit/Domain/TimeTracking/](tests/Unit/Domain/TimeTracking/) (passes with `php artisan test`)<br>• **Statutory & Domain ADR**: [docs/adr/0005-arbzg-and-business-rule-enforcement.md](docs/adr/0005-arbzg-and-business-rule-enforcement.md) |
| **3 · Roles, permissions and data privacy** *(0–2 pts · Level 2)* | • **Documented Permission Concept & Data Minimization**: [docs/roles-and-privacy.md](docs/roles-and-privacy.md) (covers 4 distinct roles across supplier/client boundaries, role matrix, and personal data minimization)<br>• **Server-Side Authorization Policies**: [TimeBookingPolicy.php](app/Policies/TimeBookingPolicy.php) & [PurchaseOrderPolicy.php](app/Policies/PurchaseOrderPolicy.php)<br>• **Server-Side Controller Enforcement**: `Gate::authorize()` in [TimeBookingController.php](app/Http/Controllers/TimeBookingController.php) (strictly blocks unauthorized booking, approvals, or rejections) and [DashboardController.php](app/Http/Controllers/DashboardController.php) (contractor data minimization for purchasing role)<br>• **Server-Side Route Middleware**: [EnsureSuperAdmin.php](app/Http/Middleware/EnsureSuperAdmin.php), [EnsureRole.php](app/Http/Middleware/EnsureRole.php)<br>• **Platform Administration with Anti-Lockout**: [UserController.php](app/Http/Controllers/Admin/UserController.php)<br>• **Automated Pest Feature Test Coverage**: [tests/Feature/TimeBookingFeatureTest.php](tests/Feature/TimeBookingFeatureTest.php) (30 tests verifying 403s on unauthorized status transitions & roles) and [tests/Feature/Admin/UserManagementTest.php](tests/Feature/Admin/UserManagementTest.php)<br>• **Governance ADR**: [docs/adr/0006-super-admin-role-and-platform-governance.md](docs/adr/0006-super-admin-role-and-platform-governance.md) |
| **4 · Architecture and engineering practice** *(0–2 pts · Level 2)* | • **Block A · Structure**: Layered architecture cleanly separating domain rules (`app/Domain/`), persistence models (`app/Models/`), controllers (`app/Http/Controllers/`), and frontend views (`resources/js/`)<br>• **Block B · Decisions (6 ADRs delivered, 2 mandatory topics covered)**: [docs/adr/](docs/adr/) — [0001 (Stack)](docs/adr/0001-laravel-inertia-react-stack.md), [0002 (Identity — Mandatory)](docs/adr/0002-identity-and-access-management.md), [0003 (Operation/Scaling — Mandatory)](docs/adr/0003-operation-and-deployment-strategy.md), [0004 (Bilingual i18n)](docs/adr/0004-internationalization-and-localization.md), [0005 (ArbZG & Business Rules)](docs/adr/0005-arbzg-and-business-rule-enforcement.md), [0006 (Super Admin Governance)](docs/adr/0006-super-admin-role-and-platform-governance.md)<br>• **Block C · Git History**: Steady history of commits spread across hackathon days (Friday 2026-10-30 to Tuesday 2026-11-03) with clear feature commit messages<br>• **Block F · Mockups**: Role-based mockup documentation in [docs/mockup/README.md](docs/mockup/README.md)<br>• **Additional Engineering Excellence**: Full bilingual English/German UI ([LanguageSwitcher.tsx](resources/js/components/LanguageSwitcher.tsx), [i18n.ts](resources/js/lib/i18n.ts)) and local streaming RAG AI assistant with mock toggle ([ChatbotController.php](app/Http/Controllers/ChatbotController.php)) |
| **5 · Runs from README** *(0–1 pt · Level 1)* | Cold start runs in $<5$ minutes from README commands alone; pre-seeded demo users for all 4 roles; zero-config SQLite persistence; 119 passing tests. |

---

## Team — Sprint Force

| Name | GitHub Handle |
| --- | --- |
| RADEEYA WUNTIA | [@RADEEYA-WUNTIA](https://github.com/RADEEYA-WUNTIA) |
| Francis Amartey Sampah | [@francisJun](https://github.com/francisJun) |
| SUMAILA MOHAMMED SUADIK | [@msumaila775-rgb](https://github.com/msumaila775-rgb) |
| Fosuhene Samuel | [@da-real-alpha](https://github.com/da-real-alpha) |
| Fusheini Amin | [@fusheiniamin721-dotcom](https://github.com/fusheiniamin721-dotcom) |
| Mudirikatu Suale | [@sualemudirikatu-droid](https://github.com/sualemudirikatu-droid) |
