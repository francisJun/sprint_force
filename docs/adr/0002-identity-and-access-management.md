# 0002: Identity and Access Management Strategy

- Status: accepted
- Date: 2026-10-30
- Deciders: Team Sprint Force (HourRadar)

## Context

**HourRadar** handles sensitive corporate financial data (purchase orders, consultant rates, budget burn rates) as well as personal consultant time logs. 

Our application serves two distinct groups of users across corporate boundaries:
1. **Internal Client Staff** (Client Project Leads, Purchasing / Finance Managers): Corporate employees who require Single Sign-On (SSO) integrated with the company's central Identity Provider (IdP) such as Microsoft Entra ID (Azure AD), Okta, or Google Workspace.
2. **External Service Providers** (Consultants, Suppliers): External contractors who often do not possess internal corporate directory accounts and need lightweight, secure, and modern authentication without burdensome VPN prerequisites.

The hackathon juror also requires an instant local login mechanism to evaluate all three roles within 5 minutes without needing an external corporate IdP or paid accounts.

## Decision

We adopt a **hybrid multi-tenant authentication architecture**:

1. **Local Evaluation & Demo Mode (Implemented Now)**:
   - Built on **Laravel Fortify** session-based authentication with bcrypt-hashed credentials and passkey support.
   - Pre-seeded deterministic demo accounts for all three roles (`consultant@example.com`, `projectlead@example.com`, `purchasing@example.com`).
   - Enables immediate offline testing for hackathon jurors.

2. **Enterprise Production Architecture (Next Expansion Stage)**:
   - **Client Internal Users**: SAML 2.0 / OpenID Connect (OIDC) enterprise SSO via Laravel Socialite / Socialite Providers. Internal staff authenticate directly against their corporate directory with enforced Multi-Factor Authentication (MFA).
   - **External Suppliers & Consultants**: Passwordless Magic Links or WebAuthn / Passkeys tied to verified supplier email domains.
   - **Role-Based Access Control (RBAC)**: All permissions are strictly enforced on the server using Laravel Policies (`TimeBookingPolicy`, `PurchaseOrderPolicy`) and Gate definitions, ensuring external consultants can only read/write their own records on assigned orders.

## Alternatives Considered

- **Single Sign-On Only (Pure SAML/OIDC)**:
  - *Pros*: Maximum compliance for the client company.
  - *Cons*: Fails for external freelancers without client domain accounts; impossible for hackathon jurors to run offline.
- **Third-Party Auth Provider (e.g. Auth0, Clerk, Firebase Auth)**:
  - *Pros*: Pre-built login widgets and social connections.
  - *Cons*: Violates hackathon rule #6 (no paid accounts or mandatory external API keys); introduces third-party dependency for sensitive European financial data (GDPR / Schrems II compliance risks).

## Consequences

### Positive
- **Juror Friendly**: Zero friction for evaluation — works offline with SQLite session storage.
- **Enterprise-Ready Path**: Clear architectural bridge to enterprise SAML 2.0 / Azure AD without rewriting authorization logic.
- **Data Privacy Compliance**: Server-side policy checks prevent cross-supplier data leakage.

### Negative / Trade-offs
- Supporting both internal SSO and external contractor logins requires maintaining two login flows in production.

