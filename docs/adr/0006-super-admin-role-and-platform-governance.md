# 0006 · Super Admin Role & Platform Governance Architecture

- **Status:** accepted
- **Date:** 2026-11-02
- **Deciders:** Team HourRadar

## Context

HourRadar was initially modeled with three primary operational roles: External Consultant (supplier), Project Lead (client), and Purchasing / Finance (client). While this satisfied domain workflows for timesheet submission, approvals, and order tracking, real enterprise operations require a platform overseer to manage user lifecycle, assign roles, regulate supplier affiliations, inspect global health telemetry, and administer access control boundaries.

Furthermore, per Hackathon Criterion 3 (*Roles, permissions, personal data*), role access and data privacy must be strictly enforced server-side rather than cosmetically hidden in the UI. We need an administrative governance tier that can oversee the platform while adhering strictly to German labor and privacy statutes (ArbZG, AÜG, and DSGVO) without causing accidental lockout vulnerabilities.

## Options considered

1. **Ad-hoc DB Seeding / Direct Console Manipulation**: Keep only 3 application roles; create and update users strictly via database seeders or `tinker`.
   - *Pros:* No additional code or routes needed.
   - *Cons:* Fails real-world enterprise maintainability; no audit trail or in-app user administration; no interactive permission matrix inspection; not viable for non-technical stakeholders or juries.

2. **Heavyweight Third-Party RBAC Package (e.g. Spatie Permission)**: Install full package with database permission tables, many-to-many relationship pivots, and caching layers.
   - *Pros:* Extremely flexible dynamic role and permission assignment.
   - *Cons:* Adds unnecessary complexity and dependencies for a lean hackathon codebase; can obscure simple policy checks; does not provide out-of-the-box Inertia React governance views or domain-specific safeguards against lockout.

3. **Dedicated Domain Super Admin Tier with Server-Side Middleware & Lockout Safeguards (Chosen)**:
   - Introduce `super_admin` role in `User` model with `isSuperAdmin()` helper.
   - Enforce access via `EnsureSuperAdmin` middleware protecting all `/admin/*` routes.
   - Provide full administrative CRUD (`UserController`) with anti-lockout rules (cannot delete self, cannot delete or demote the last remaining Super Admin).
   - Offer a dedicated Platform Overseer Cockpit (`/dashboard` for Super Admin) and an interactive Roles & Permissions Matrix.
   - *Pros:* Zero external dependency overhead; clear and testable server-side boundary (403 for unauthorized users); built-in anti-lockout guarantees; aligns directly with Criterion 3 requirements.
   - *Cons:* Requires maintaining custom administrative controllers and views.

## Decision

We chose **Option 3: Dedicated Domain Super Admin Tier with Server-Side Middleware & Lockout Safeguards**.

We implement:
- Middleware `App\Http\Middleware\EnsureSuperAdmin` which immediately aborts with HTTP 403 if unauthenticated or not a `super_admin`.
- Model helper `User::isSuperAdmin(): bool`.
- Administrative controller `App\Http\Controllers\Admin\UserController` handling user creation, editing, role promotion/demotion, deletion, and validation of supplier associations for consultants.
- Strict server-side safeguards preventing self-deletion and demotion of the last remaining Super Admin.
- Demo user `admin@example.com` (password: `password`) automatically provisioned across resets.
- Dedicated frontend views: `resources/js/pages/admin/users/index.tsx` (User Directory + RBAC Matrix) and `resources/js/pages/dashboard/super-admin.tsx` (Platform Overseer Cockpit).

## Consequences

- **Positive:**
  - Complete governance: platform administrators can provision users, switch roles, and audit platform KPIs (active orders, booked hours, ArbZG alerts, vendor counts).
  - High resilience: lockout safeguards ensure the system never enters an unadministrable state.
  - Security auditability: automated Pest tests verify that consultants, project leads, and purchasing agents are strictly forbidden (HTTP 403) from administrative endpoints.
- **Negative / Trade-offs:**
  - Additional frontend views and bilingual translation keys (`admin.*`) must be maintained alongside existing role cockpits.

