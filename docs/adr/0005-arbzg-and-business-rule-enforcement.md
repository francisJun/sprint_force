# 0005 · Statutory ArbZG and Business Rule Domain Enforcement

- **Status:** accepted
- **Date:** 2026-11-02
- **Deciders:** Team HourRadar

## Context

In external consulting delivery, companies face severe legal, financial, and compliance liabilities under German statutory labor law—specifically the German Working Time Act (*Arbeitszeitgesetz*, ArbZG)—as well as contractually binding purchase order budget limits. Violations of ArbZG can result in regulatory fines of up to €30,000 per infraction (ArbZG § 22) and create severe co-employment liability risks under the German Temporary Employment Act (*Arbeitnehmerüberlassungsgesetz*, AÜG).

To ensure rock-solid compliance, business rules must satisfy three architectural principles:
1. **Domain-Driven Encapsulation**: Rules must reside in dedicated domain rule classes within the domain boundary (`app/Domain/`), not scattered across UI components, blade templates, or HTTP transport controllers.
2. **Server-Side Enforcement**: All validation must execute authoritatively on the server, returning unambiguous, human-readable domain feedback.
3. **Comprehensive Automated Verification**: Every business rule must have dedicated automated unit tests verifying accepted, rejected, and boundary edge conditions.

The core statutory and operational constraints include:
- **Order Free Budget**: Bookings cannot exceed the remaining free person-days ($PD = \text{hours} / 8.0$) of a purchase order.
- **Interval Collision**: A single consultant cannot be double-booked across overlapping time windows on the same calendar day.
- **ArbZG § 3 (Daily Ceiling & 8h Notice)**: Absolute statutory prohibition of working more than 10.0 hours per calendar day; statutory notice and tracking of compensatory rest required within 6 months when exceeding 8.0 hours.
- **ArbZG § 5 (Rest Period)**: Mandatory uninterrupted rest period of at least 11.0 consecutive hours between shifts across consecutive working days.
- **ArbZG § 9 (Sundays & German Public Holidays)**: Statutory prohibition of work on Sundays and German federal/state statutory public holidays, unless granted special statutory authorization (ArbZG § 14/§ 15).
- **Approved Vacation Blocks**: Prohibition of booking work during approved consultant vacation periods.

## Options Considered

1. **Option A: Client-Side UI Validation Only (HTML/JavaScript)**
   - *Pros:* Immediate in-browser visual feedback.
   - *Cons:* Fundamentally insecure; easily bypassed via direct REST API requests, browser developer tools, or automated batch imports; provides zero audit-grade compliance protection.

2. **Option B: Procedural Controller Validation**
   - *Pros:* Quick to write inside `TimeBookingController`.
   - *Cons:* Bleeds domain logic into the HTTP transport layer; impossible to re-use across batch imports, queue workers, CLI commands, or external ERP integrations; degrades testability.

3. **Option C: Isolated Domain Rule Objects Encapsulated on the Entity (Chosen)**
   - *Pros:*
     - Clean Domain-Driven Design (DDD): rule logic is isolated into single-purpose rule classes within `app/Domain/TimeTracking/Rules/`.
     - Orchestrated by `TimeBookingValidator` and encapsulated directly on the domain model via `PurchaseOrder::book(User $consultant, array $attributes)`.
     - Reusable across web controllers, background queue workers, and batch import pipelines.
     - 100% testable in complete isolation via Pest PHP unit tests.
   - *Cons:* Requires defining dedicated rule classes and domain exception handling.

## Decision

We adopt **Option C: Isolated Domain Rule Objects Encapsulated on the Entity**.

### Domain Rule Architecture

1. **Dedicated Domain Rules (`app/Domain/TimeTracking/Rules/`)**:
   - `OrderFreeBudgetRule`: Validates that requested hours $\le \text{remaining } PD \times 8.0$. Message: `"Booking rejected: only {remaining} PD left on order {order_number}"`.
   - `NoOverlappingBookingsRule`: Performs interval intersection checks $[\max(S_1, S_2) < \min(E_1, E_2))$; contiguous shifts $(E_1 = S_2)$ are cleanly allowed.
   - `ArbzgDailyLimitRule`: Rejects bookings $> 10.0$ h; flags bookings between $8.0$ h and $10.0$ h with `requires_compensatory_rest = true` and statutory notice.
   - `ArbzgRestPeriodRule`: Computes elapsed rest minutes from previous day's shift end to current shift start (and current shift end to next day's shift start), requiring $\ge 11.0$ hours.
   - `ArbzgSundayHolidayRule`: Uses `GermanPublicHolidayService` to identify federal and state statutory holidays; permits bypass only when `special_authorization = true`.
   - `NoApprovedVacationRule`: Rejects bookings falling within an approved `VacationBlock`.
2. **Standardized Domain Exception**:
   - `BookingValidationException` carries domain error messages, rule identifiers, and target form fields for precise user feedback.
3. **Database Schema Support**:
   - `time_bookings` persists `start_time`, `end_time`, `requires_compensatory_rest`, `special_authorization`, and `statutory_notes`.
4. **Comprehensive Pest Unit Testing**:
   - Every rule is validated with Pest unit tests (`tests/Unit/Domain/TimeTracking/`) with explicit sentence naming, covering accepted, rejected, and boundary edge cases.

## Consequences

- **What becomes easier:**
  - **Audit Readiness:** Project leads, compliance officers, and works councils have mathematical certainty that no unvalidated or illegal bookings enter the database.
  - **Maintainability:** New statutory or company-specific procurement rules can be added as single-purpose rule classes implementing the domain validator interface.
  - **Instant Verification:** Engineering teams can verify all domain rules instantly via `php artisan test`.
- **What becomes harder:**
  - Changes to statutory rules require updating domain validator classes and corresponding unit test fixtures.
