# 0006 · Super Admin Role & Platform Governance Architecture

- **Status:** accepted
- **Date:** 2026-11-02
- **Deciders:** Team HourRadar

## Context

HourRadar was initially designed with three operational roles: External Consultant (supplier), Project Lead (client), and Purchasing / Finance (client). While this satisfied day-to-day timesheet submission, approvals, and order tracking, real enterprise operations require a dedicated platform administrative tier to oversee user lifecycle, manage tenant and supplier affiliations, inspect global system health telemetry, and govern access boundaries.

Furthermore, enterprise security and audit standards (SOC 2, ISO 27001, DSGVO) mandate that administrative privileges and data access controls must be authoritatively enforced on the server rather than cosmetically managed in the frontend. We require a robust platform governance tier that provides full oversight while guaranteeing anti-lockout resilience (preventing scenarios where an administrator accidentally disables all platform management).

## Options Considered

1. **Option A: Ad-Hoc Direct Database Console Management**
   - Manage administrators and users strictly via database seeders, artisan CLI commands, or direct database queries.
   - *Pros:* Zero additional UI code or web routes required.
   - *Cons:* Lacks auditability, activity logging, and visual oversight; unusable by enterprise operations teams or business administrators.

2. **Option B: Heavyweight Third-Party RBAC Package (e.g. Spatie Laravel Permission)**
   - Install full package with database permission tables, many-to-many relationship pivots, and caching layers.
   - *Pros:* Highly granular dynamic role assignment.
   - *Cons:* Adds unnecessary database joins, package dependencies, and cache invalidation complexity for a focused enterprise role hierarchy; lacks built-in anti-lockout domain guarantees.

3. **Option C: Dedicated Domain Super Admin Tier with Server-Side Middleware & Anti-Lockout Safeguards (Chosen)**
   - *Pros:*
     - Clear, testable server-side boundary: `EnsureSuperAdmin` middleware strictly protects all `/admin/*` routes, returning HTTP 403 to unauthorized users.
     - Built-in anti-lockout guarantees: hardcoded domain rules prevent self-deletion and demotion of the last remaining Super Admin.
     - Dedicated Platform Overseer Cockpit (`/dashboard` for Super Admin) with system-wide telemetry and an interactive Roles & Permissions Matrix.
     - Lightweight: zero external package dependencies or runtime performance penalties.
   - *Cons:* Requires maintaining custom administrative controllers and Inertia views.

## Decision

We adopt **Option C: Dedicated Domain Super Admin Tier with Server-Side Middleware & Anti-Lockout Safeguards**.

### Implementation Architecture

1. **Security Boundary & Middleware:**
   - Middleware `App\Http\Middleware\EnsureSuperAdmin` intercepts all `/admin/*` routes, immediately aborting with HTTP 403 Forbidden for any non-super-admin user.
   - Helper `User::isSuperAdmin(): bool` provides strongly typed authorization checks.

2. **Administrative Controller (`App\Http\Controllers\Admin\UserController`):**
   - Handles full user lifecycle: creation, editing, role changes, deletion, and validation of supplier associations for external consultants.
   - Anti-Lockout Protections: Server-side validation explicitly blocks attempts by an administrator to delete their own account or demote the system's last remaining Super Admin.

3. **Dedicated Governance Interface:**
   - `/admin/users`: Interactive User Directory and visual Roles & Permissions Matrix.
   - `/dashboard`: Platform Overseer Cockpit displaying global metrics (active purchase orders, settled person-days, ArbZG compliance warnings, active supplier count).

4. **Automated Security Verification:**
   - Automated Pest tests verify that consultants, project leads, and purchasing agents are strictly forbidden (HTTP 403) from accessing administrative endpoints.

## Consequences

- **What becomes easier:**
  - **Operational Governance:** System administrators can provision users, reassign roles, and audit system-wide metrics from an intuitive web cockpit.
  - **High Resilience:** Domain anti-lockout rules ensure the system never enters an unadministrable state.
  - **Audit Compliance:** Clear separation of duties and server-side RBAC satisfy corporate IT security and privacy compliance standards.
- **What becomes harder:**
  - New administrative features must be implemented in both backend controllers and Inertia React governance views.
