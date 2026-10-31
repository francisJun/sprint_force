# 0003: Operational Deployment and Scaling Strategy

- Status: accepted
- Date: 2026-10-30
- Deciders: Team Sprint Force (HourRadar)

## Context

A large enterprise deploying **HourRadar** must navigate stringent data protection policies (German BDSG, EU GDPR, works council agreements) regarding employee time tracking and procurement financial data. 

The deployment model must support:
- **Instant local evaluation** by the hackathon jury without Docker or external servers.
- **On-premise / Private Cloud deployment** inside the client company's VPC (e.g. AWS Europe, OpenShift, Kubernetes) to keep timesheet data on-premise.
- **Horizontal scalability** during month-end invoice processing and bulk timesheet submissions across thousands of external contractors.

## Decision

We design a **two-tier operational strategy**:

1. **Hackathon & Local Development Tier (Implemented Now)**:
   - **Runtime**: PHP 8.3+ via Laravel Herd or built-in CLI server (`php artisan serve`).
   - **Database**: Embedded **SQLite** (`database/database.sqlite`).
   - **Background Jobs & Cache**: Local database driver (`database` queue and session drivers), requiring no Redis or Memcached instances.
   - **Benefit**: Runs anywhere in < 5 minutes with zero container dependencies.

2. **Enterprise Production & Scaling Tier (Architecture Target)**:
   - **Containerization**: Multi-stage Docker container based on Alpine Linux with PHP-FPM and Nginx, orchestrated via Kubernetes (Helm charts) or AWS ECS.
   - **Database**: Managed **PostgreSQL** (AWS RDS / Azure Database for PostgreSQL) with automated read replicas and encryption at rest (CMEK).
   - **Caching & Real-Time Queues**: Managed Redis cluster (AWS ElastiCache / Redis Enterprise) for session state, rate limiting, and asynchronous AI/invoice matching jobs.
   - **Stateless Application Nodes**: Horizontal Pod Autoscaling (HPA) scaling web nodes based on CPU and request latency.
   - **Zero Data Leakage**: AI processing uses local or client-hosted LLM endpoints (e.g., Azure OpenAI in EU Frankfurt region or self-hosted open-source models via vLLM) so consultant timesheets never leave the EU.

## Alternatives Considered

- **SaaS Multi-Tenant Cloud Only**:
  - *Pros*: Easiest to maintain and update.
  - *Cons*: Many German corporate compliance officers and works councils reject external SaaS hosting of granular employee and contractor worklogs due to surveillance and data transfer risks.
- **Monolithic Single VM on Bare Metal**:
  - *Pros*: Simple setup.
  - *Cons*: Cannot handle peak loads during month-end invoice reconciliation periods; single point of failure.

## Consequences

### Positive
- **Zero-Friction Evaluation**: Jurors run the entire product on their laptops without Docker or cloud accounts.
- **Client Sovereignty**: Allows clients to run HourRadar within their own private cloud or corporate datacenter.
- **Elastic Performance**: Decoupled architecture allows web traffic and heavy background calculations (runway simulations, ArbZG checks) to scale independently.

### Negative / Trade-offs
- Migrating from SQLite to PostgreSQL in production requires maintaining database migration compatibility (avoiding SQLite-specific SQL dialects).

