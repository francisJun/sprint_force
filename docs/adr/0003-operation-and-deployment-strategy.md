# 0003 · Operational Deployment and Scaling Strategy

- **Status:** accepted
- **Date:** 2026-10-30
- **Deciders:** Team HourRadar

## Context

A large enterprise deploying **HourRadar** manages multi-million-euro project budgets across dozens of external IT service providers. The operational architecture must satisfy two non-negotiable enterprise constraints:

1. **German Statutory & Data Sovereignty Mandates (DSGVO, BDSG, BetrVG):**
   - Detailed consultant time bookings, daily work descriptions, and hourly rates constitute sensitive personal and financial data.
   - German corporate works councils (*Betriebsräte*) and compliance officers strictly prohibit external, unvetted multi-tenant cloud storage of individual worklogs to prevent covert employee surveillance and cross-border data leakage.
   - Many clients require deployment entirely within their own corporate perimeter (private VPC or on-premise container cluster).

2. **Elastic Scaling & Peak Load Management:**
   - The platform must scale smoothly from dozens to tens of thousands of bookings per month.
   - Workload is spiky: time bookings surge at the end of each working day (16:30–18:00), while month-end invoice reconciliation triggers batch processing across hundreds of order lines.
   - Calculating calendar-aware burndown runways (factoring in 16 German federal holiday calendars, consultant vacation schedules, and velocity) is computationally intensive and must not degrade interactive API response times.

## Options Considered

1. **Option A: Public Multi-Tenant Cloud SaaS Only (e.g. US-hosted multi-tenant AWS/GCP)**
   - *Pros:* Easiest continuous delivery and lowest initial operational overhead.
   - *Cons:* Strictly rejected by enterprise procurement and works councils due to Schrems II compliance risks, GDPR Art. 28 data processor transfer restrictions, and corporate data sovereignty policies.

2. **Option B: Monolithic Single-Server Appliance on Bare Metal**
   - *Pros:* Simple deployment with minimal infrastructure dependencies.
   - *Cons:* Single point of failure; cannot scale horizontally during month-end batch reconciliation peaks; synchronous runway recalculations block web request workers.

3. **Option C: Sovereign Hybrid Architecture — Containerized Private VPC / On-Premise Deployment with Asynchronous Queue Decoupling (Chosen)**
   - *Pros:*
     - Client company retains 100% data sovereignty by running HourRadar inside their private cloud VPC (e.g. AWS Europe Frankfurt, Azure Germany, OpenShift/Kubernetes) or on-premise datacenter.
     - Stateless web tier scales horizontally behind standard load balancers (Nginx / Traefik / AWS ALB).
     - Heavy burndown simulations, ArbZG compliance audits, and invoice 3-way matching are decoupled into asynchronous background queues (Redis + Laravel Horizon).
     - Supports lightweight embedded SQLite for standalone departmental edge nodes and development, with seamless migration to managed PostgreSQL for clustered enterprise production.
     - AI assistant operates with zero data leakage: queries stay within EU sovereign boundaries using local/on-premise LLMs or client-hosted private endpoints (with offline rule-based fallback).
   - *Cons:* Requires managing container orchestration and queue infrastructure in production environments.

## Decision

We adopt **Option C: Sovereign Hybrid Architecture with Asynchronous Queue Decoupling**.

### Architectural Blueprint

1. **Stateless Application Tier:**
   - Multi-stage containerized PHP 8.3+ / Laravel 13 runtime running behind PHP-FPM and Nginx.
   - Scaled horizontally via Kubernetes Horizontal Pod Autoscaling (HPA) based on CPU utilization and request queuing latency.
   - Zero local state on application pods; all sessions, caches, and uploaded proof-of-work documents reside in distributed infrastructure.

2. **Persistence & Data Tier:**
   - **Enterprise Production:** Managed **PostgreSQL** (e.g. AWS RDS / Azure Database for PostgreSQL) deployed in a multi-AZ configuration with read replicas dedicated to analytics and reporting queries.
   - **Edge & Standalone Deployment:** Embedded **SQLite** with WAL (Write-Ahead Logging) mode enabled, providing zero-infrastructure persistence for branch offices, isolated test environments, and air-gapped evaluation.
   - Clean database schema migrations adhere strictly to ANSI SQL to guarantee seamless compatibility between SQLite and PostgreSQL.

3. **Asynchronous Background Processing & Queues:**
   - Distributed **Redis** cluster handles session caching, rate limiting, and queue dispatch.
   - Asynchronous worker pools managed by Laravel Horizon process heavy tasks out of the request lifecycle:
     - Real-time order runway recalculations upon booking approval.
     - Holiday calendar updates across the 16 German federal states.
     - 3-way invoice reconciliation batch matching.
   - Ensures user-facing booking API latencies remain strictly **< 50 ms**.

4. **Sovereign AI Integration:**
   - AI assistant queries are routed through client-controlled sovereign endpoints located in the EU (e.g. Azure OpenAI Germany West Central or self-hosted vLLM instances).
   - A configurable offline mock driver (`AI_MOCK=true`) allows full platform operation in air-gapped or restricted environments with zero outbound network calls.

## Consequences

- **What becomes easier:**
  - **Compliance Approval:** Satisfies works council (*Betriebsrat*) and GDPR requirements out of the box because no operational data leaves the client's sovereign network.
  - **High Performance:** Web requests never block on complex predictive runway calculations; background workers absorb month-end load spikes without UI latency spikes.
  - **Deployment Flexibility:** Clients can deploy HourRadar as a fully managed private instance or containerized on-premise appliance.
- **What becomes harder:**
  - Production deployments require maintaining container registries, Helm charts, and Redis cluster operations alongside the relational database.
