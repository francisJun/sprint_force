# 0002 · Identity and Access Management Strategy

- **Status:** accepted
- **Date:** 2026-10-30
- **Deciders:** Team HourRadar

## Context

**HourRadar** handles sensitive corporate financial data (purchase orders, itemized budgets, hourly rates) alongside personal contractor worklogs.

The platform operates across corporate organizational boundaries with two fundamentally different user categories:

1. **Client Internal Enterprise Users (Project Leads, Purchasing & Finance Managers, Super Admins):**
   - Corporate employees subject to centralized enterprise identity governance.
   - Requirement: Federated Single Sign-On (SSO) integrated with the client’s existing Identity Provider (IdP) such as Microsoft Entra ID (Azure AD), Okta, Ping Identity, or Google Workspace, with enforced Multi-Factor Authentication (MFA) and automated deprovisioning (SCIM).

2. **External Service Provider Users (Consultants, Vendors, Freelancers):**
   - External staff representing third-party suppliers who do not possess corporate Active Directory or intranet accounts.
   - Requirement: Frictionless, secure onboarding without VPN prerequisites or expensive client seat licensing, while strictly guaranteeing tenant data isolation (suppliers must never see each other's consultants, rates, or bookings).

Additionally, developers, automated CI/CD test pipelines, and staging environments require a deterministic, zero-dependency authentication mode that operates reliably without requiring external cloud IdP connections.

## Options Considered

1. **Option A: Pure Corporate SSO Only (SAML 2.0 / OIDC Only)**
   - *Pros:* Fully complies with internal corporate security standards for client staff.
   - *Cons:* Completely blocks external contractors and freelance consultants who lack corporate domain accounts, or forces the client to provision costly and high-overhead guest Active Directory accounts.

2. **Option B: Proprietary Cloud Auth-as-a-Service (e.g. Auth0, Clerk, Firebase Auth)**
   - *Pros:* Turnkey hosted authentication widgets.
   - *Cons:* Introduces vendor lock-in; sends employee identity and session telemetry to external third-party cloud infrastructure (raising GDPR Art. 28 and Schrems II compliance hurdles for European enterprise procurement); creates recurring per-MAU costs.

3. **Option C: Federated Hybrid Identity Architecture with Strict Server-Side RBAC (Chosen)**
   - *Pros:*
     - Enterprise SSO (SAML 2.0 / OIDC via Laravel Socialite / Socialite Providers) for internal client corporate accounts.
     - Secure credential and passwordless magic link / WebAuthn authentication for external contractor organizations.
     - Deterministic local seed profiles for automated testing and staging environments (`consultant@example.com`, `projectlead@example.com`, `purchasing@example.com`, `admin@example.com`).
     - Strict server-side authorization enforcement via Laravel Policies (`TimeBookingPolicy`, `PurchaseOrderPolicy`) and Gate definitions.
   - *Cons:* Requires maintaining two distinct authentication flows (federated SSO vs. vendor authentication) within the application authentication layer.

## Decision

We adopt **Option C: Federated Hybrid Identity Architecture with Strict Server-Side RBAC**.

### Implementation Strategy

1. **Enterprise Identity Federation (Production Stage):**
   - Internal client users authenticate via SAML 2.0 / OpenID Connect against the enterprise identity provider (Microsoft Entra ID / Okta).
   - Roles and group memberships are mapped on login via standard SAML claims / OIDC tokens to HourRadar roles (`project_lead`, `purchasing`, `super_admin`).

2. **Supplier & Contractor Authentication:**
   - External consultants authenticate via secure session-based credentials or time-limited magic links bound to verified supplier email domains.
   - Passkey / WebAuthn support provides passwordless phishing-resistant access for mobile and remote workers.

3. **Development, Staging & Demonstration Mode:**
   - Built on **Laravel Fortify** session authentication with bcrypt password hashing.
   - Pre-seeded deterministic demo accounts for all core roles enable immediate, zero-friction automated testing and end-to-end evaluation without external IdP dependencies.

4. **Server-Side Authorization & Privacy Enforcement:**
   - Client-side button hiding is explicitly treated as cosmetic; all data access is gated server-side via Laravel Policies.
   - External consultants are scoped strictly to their assigned purchase orders and can only view/modify their own time entries.
   - Internal project leads can only review and approve bookings associated with purchase orders in their assigned projects.

## Consequences

- **What becomes easier:**
  - **Frictionless Vendor Collaboration:** External service providers can log in and submit hours immediately without waiting weeks for corporate guest account provisioning.
  - **Enterprise Security Compliance:** Client staff leverage existing corporate MFA and SSO policies, satisfying corporate IT security and audit requirements.
  - **Test Automation:** Local unit and feature tests run deterministically in CI/CD without network calls to external authentication providers.
- **What becomes harder:**
  - The authentication gateway must support dual login options (Corporate SSO redirect vs. Vendor credentials/magic link).
