# Roles, permissions and data privacy

> See [guide 2.4](guide.md#24-roles-and-privacy).
> Full points are possible with this concept alone. Implementation is enforced on the server.

## Roles

| Role | Side | Description |
|---|---|---|
| **External Consultant** | Supplier | Delivers project work, books working hours against assigned purchase orders, and records planned vacations. |
| **Project Lead** | Client | Manages the project, monitors order burn rates, inspects runway projections, and approves/rejects submitted timesheets. |
| **Purchasing / Finance** | Client | Manages purchase order budgets, monitors framework agreements, tracks procurement lead times (re-order warnings), and reviews aggregated invoicing data. |

## Role matrix

`✔` = allowed, `–` = not allowed, `Σ` = only aggregated values

| Action or data | External Consultant | Client Project Lead | Purchasing / Finance |
|---|:---:|:---:|:---:|
| Book own working time | ✔ | – | – |
| Record own vacation blocks | ✔ | – | – |
| View own time bookings | ✔ | – | – |
| View single bookings with person names | – (only own) | ✔ (assigned orders) | – (anonymized/aggregated) |
| See remaining budget & runway date | – (only assigned PO total) | ✔ | ✔ |
| Approve / reject time bookings | – | ✔ | – |
| Trigger follow-up order alert | – | ✔ | ✔ |
| Access AI streaming RAG assistant | ✔ (booking & help) | ✔ (budget & help) | ✔ (order & help) |

## Personal data

| Data | Why we store it | Who needs it | How long we keep it |
|---|---|---|---|
| **Daily hours per person** | Proof of performance for invoice verification and ArbZG compliance | Consultant (own), Project Lead (verification) | Statutory retention period (10 years for tax/financial records) |
| **Booking descriptions** | Verification that hours relate to the purchase order scope | Project Lead | Kept with the booking record |
| **Planned vacation dates** | Accurate forward-looking runway forecasting | Project Lead (aggregated availability), Algorithm | Deleted 6 months after project conclusion |
| **Consultant names & email** | Identity, authentication, and assignment to orders | All parties on the project | Duration of supplier contract |

## Conflicts and how we resolve them

1. **Transparency vs. Consultant Privacy (German ArbZG & Pseudonymization)**:
   - *Conflict*: Project Lead wants to know why hours were booked, but tracking minute-by-minute personal schedules creates employer-like surveillance ("Scheinselbstständigkeit" risk).
   - *Resolution*: Bookings require only daily totals (e.g. 7.5 hours) and high-level activity tags rather than timestamped clock-in/clock-out tracking. Purchasing only sees aggregated person-days per order, never individual medical/personal absence details.
2. **Vacation Availability vs. Personal Leave Secrecy**:
   - *Conflict*: The runway algorithm needs to know that a consultant is absent, but the client lead does not need to know personal details.
   - *Resolution*: Absences are recorded simply as "unavailable days" without categorizing sick leave vs. personal vacation in client views.

## How it is enforced

- **Server-Side Enforcement**: All permissions are checked in Laravel Policies (`TimeBookingPolicy`, `PurchaseOrderPolicy`) and Form Request classes before any controller action executes.
- **UI Reflection**: Inertia props pass only the authorized actions to React components (hiding buttons is treated purely as UX, never as security).
- **Scope Isolation**: Eloquent global scopes and query builder filters automatically constrain consultant queries to their own tenant/user ID.
