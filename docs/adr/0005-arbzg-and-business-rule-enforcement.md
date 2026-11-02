# 5. Statutory ArbZG and Business Rule Domain Enforcement

Date: 2026-11-02

## Status

Accepted

## Context

In external consulting delivery, companies must comply with stringent statutory regulations—specifically the German Working Time Act (*Arbeitszeitgesetz*, ArbZG)—as well as contractually binding purchase order budget limits. 

The hackathon technical scoring specifically mandates under **Criterion 2 (Business rules and unit tests · 0–3 points)**:
1. Rules must live in one dedicated place in the domain (e.g. `Order.book(hours)` / domain services), not scattered across UI components or HTTP controllers.
2. Rules must be strictly enforced on the server and return understandable, human-readable error messages.
3. Every rule must be covered by automated unit tests covering accepted, rejected, and edge cases.

The statutory and operational requirements include:
- **Order Free Budget**: Booking cannot exceed the remaining free person-days ($PD = \text{hours} / 8.0$) of a purchase order.
- **Interval Collision**: A single consultant cannot be double-booked across overlapping time windows on the same calendar day.
- **ArbZG § 3 (Daily Ceiling & 8h Notice)**: Absolute statutory prohibition of working more than 10.0 hours per calendar day; statutory notice and tracking of compensatory rest required within 6 months when exceeding 8.0 hours.
- **ArbZG § 5 (Rest Period)**: Mandatory uninterrupted rest period of at least 11.0 consecutive hours between shifts across consecutive working days.
- **ArbZG § 9 (Sundays & German Public Holidays)**: Prohibition of work on Sundays and German federal/state statutory public holidays, unless granted special statutory authorization (ArbZG § 14/§ 15).
- **Approved Vacation Blocks**: Prohibition of booking work during approved consultant vacation periods.

## Decision

We isolate business validation into dedicated Domain Rule classes within `app/Domain/TimeTracking/Rules/`, orchestrated by `TimeBookingValidator` and encapsulated directly on the entity via `PurchaseOrder::book(User $consultant, array $attributes)`:

1. **Dedicated Domain Rules**:
   - `OrderFreeBudgetRule`: Validates that requested hours $\le \text{remaining } PD \times 8.0$. Message: `"Booking rejected: only {remaining} PD left on order {order_number}"`.
   - `NoOverlappingBookingsRule`: Performs interval intersection checks $[\max(S_1, S_2) < \min(E_1, E_2))$; contiguous shifts $(E_1 = S_2)$ are cleanly allowed.
   - `ArbzgDailyLimitRule`: Rejects bookings $> 10.0$ h; flags bookings between $8.0$ h and $10.0$ h with `requires_compensatory_rest = true` and statutory notice.
   - `ArbzgRestPeriodRule`: Computes elapsed rest minutes from previous day's shift end to current shift start (and current shift end to next day's shift start), requiring $\ge 11.0$ hours.
   - `ArbzgSundayHolidayRule`: Uses `GermanPublicHolidayService` to identify federal and state statutory holidays; permits bypass only when `special_authorization = true`.
   - `NoApprovedVacationRule`: Rejects bookings falling within an approved `VacationBlock`.
2. **Standardized Domain Exception**:
   - `BookingValidationException` carries domain message, rule identifier, and target form field.
3. **Database Schema Support**:
   - `time_bookings` persists `start_time`, `end_time`, `requires_compensatory_rest`, `special_authorization`, and `statutory_notes`.
4. **Pest Unit Tests with Sentence Names**:
   - All rules are tested with Pest (`tests/Unit/Domain/TimeTracking/`) with explicit sentence naming, covering accepted, rejected, and boundary edge cases.

## Alternatives Considered

1. **Client-side UI validation only (HTML/JavaScript)**:
   - *Pros*: Immediate in-browser feedback.
   - *Cons*: Fails Hackathon Criterion 2 Level 1 (rules must not live only in the UI); easily bypassed via direct API requests.
2. **Controller-based procedural validation**:
   - *Pros*: Quick to write in `TimeBookingController`.
   - *Cons*: Bleeds domain logic into HTTP transport layer, prevents re-use in batch imports, CLI commands, or API integrations, and fails Criterion 2 Level 2.

## Consequences

- **Juror Verification**: Jurors and developers can verify all domain rules with a single command: `php artisan test`.
- **Compliance & Transparency**: Project leads and purchasing gain full visibility into statutory compliance and budget depletion without risking legal non-compliance.
- **Maintainability**: New statutory or company-specific rules can be added as single-purpose rule classes implementing the domain validator contract.

