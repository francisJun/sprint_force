import { Head, Link, usePage } from "@inertiajs/react";
import AppLogoIcon from "@/components/app-logo-icon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    FileCheck2,
    Layers,
    Scale,
    Shield,
    Users,
} from "lucide-react";
import { dashboard, login } from "@/routes";

export default function Welcome() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gov-canvas text-gov-text font-sans scroll-smooth selection:bg-gov-interactive selection:text-white">
            <Head title={`HourRadar - ${t("common.tagline")}`} />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 border-b border-gov-border bg-gov-surface/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
                    >
                        <div className="flex size-8 items-center justify-center rounded-md bg-gov-primary text-white shadow-xs">
                            <AppLogoIcon className="size-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-gov-primary dark:text-gov-text">
                            HourRadar
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-gov-muted md:flex">
                        <a
                            href="#kpi-strip"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.governanceMetrics")}
                        </a>
                        <a
                            href="#two-sides"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.bilateralDelivery")}
                        </a>
                        <a
                            href="#capabilities"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.runwayEngine")}
                        </a>
                        <a
                            href="#audit-telemetry"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.orderTelemetry")}
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="segmented" />

                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-gov-interactive px-4 text-sm font-medium text-white transition-colors hover:bg-gov-interactive-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-interactive cursor-pointer"
                            >
                                {t("common.openWorkspace")}
                                <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-gov-interactive px-4 text-sm font-medium text-white transition-colors hover:bg-gov-interactive-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-interactive cursor-pointer"
                            >
                                {t("common.signIn")}
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section className="relative border-b border-gov-border bg-gov-surface px-6 py-20 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-5xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-sm border border-gov-border bg-gov-surface-hover px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gov-muted">
                            <Scale className="h-3.5 w-3.5 text-gov-interactive" />
                            {t("landing.heroBadge")}
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gov-text sm:text-5xl sm:leading-tight">
                            {t("landing.heroTitle")}
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-base text-gov-muted sm:text-lg">
                            {t("landing.heroDescription")}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-gov-interactive px-6 text-sm font-medium text-white transition-colors hover:bg-gov-interactive-hover cursor-pointer"
                                >
                                    {t("landing.openDashboard")}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-gov-interactive px-6 text-sm font-medium text-white transition-colors hover:bg-gov-interactive-hover cursor-pointer"
                                >
                                    {t("landing.signInCTA")}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            )}
                            <a
                                href="#audit-telemetry"
                                className="inline-flex h-11 items-center justify-center rounded-lg border border-gov-border bg-gov-surface px-6 text-sm font-medium text-gov-text transition-colors hover:bg-gov-surface-hover cursor-pointer"
                            >
                                {t("landing.inspectAudit")}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Core Operational KPI Strip */}
                <section
                    id="kpi-strip"
                    className="scroll-mt-20 border-b border-gov-border bg-gov-canvas py-12"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Metric 1 */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gov-muted">
                                        {t("landing.kpiPoAllocation")}
                                    </span>
                                    <Layers className="h-4 w-4 text-gov-muted" />
                                </div>
                                <div className="mt-3 text-3xl font-semibold tracking-tight text-gov-text tabular-nums">
                                    140.00{" "}
                                    <span className="text-sm font-normal text-gov-muted">
                                        {t("common.pd")}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gov-muted">
                                        PO-4500012345
                                    </span>
                                    <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-1.5 py-0.5 font-semibold text-[10px] uppercase text-gov-success-text">
                                        {t("common.active")}
                                    </span>
                                </div>
                            </div>

                            {/* Metric 2 */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gov-muted">
                                        {t("landing.kpiApprovedConsumption")}
                                    </span>
                                    <Clock className="h-4 w-4 text-gov-muted" />
                                </div>
                                <div className="mt-3 text-3xl font-semibold tracking-tight text-gov-text tabular-nums">
                                    84.00{" "}
                                    <span className="text-sm font-normal text-gov-muted">
                                        {t("common.pd")}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gov-muted">
                                        Burn velocity: 6.0 {t("common.pd")}/wk
                                    </span>
                                    <span className="font-medium text-gov-text tabular-nums">
                                        60.0% {t("common.burn")}
                                    </span>
                                </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gov-muted">
                                        {t("landing.kpiArbzgRate")}
                                    </span>
                                    <Shield className="h-4 w-4 text-gov-muted" />
                                </div>
                                <div className="mt-3 text-3xl font-semibold tracking-tight text-gov-text tabular-nums">
                                    100.0%
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gov-muted">
                                        § 3 Daily 10h Ceiling
                                    </span>
                                    <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-1.5 py-0.5 font-semibold text-[10px] uppercase text-gov-success-text">
                                        {t("common.verified")}
                                    </span>
                                </div>
                            </div>

                            {/* Metric 4 */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gov-muted">
                                        {t("landing.kpiLeadTime")}
                                    </span>
                                    <AlertTriangle className="h-4 w-4 text-gov-muted" />
                                </div>
                                <div className="mt-3 text-3xl font-semibold tracking-tight text-gov-text tabular-nums">
                                    28{" "}
                                    <span className="text-sm font-normal text-gov-muted">
                                        {t("common.days")}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gov-muted">
                                        {t("landing.kpiLeadDesc")}
                                    </span>
                                    <span className="rounded-sm border border-gov-warning-border bg-gov-warning-bg px-1.5 py-0.5 font-semibold text-[10px] uppercase text-gov-warning-text">
                                        {t("landing.kpiLeadBadge")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bilateral Delivery: Two Sides of the Same Hour */}
                <section
                    id="two-sides"
                    className="scroll-mt-20 border-b border-gov-border bg-gov-surface py-16 lg:py-20"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gov-interactive">
                                {t("landing.twoSidesBadge")}
                            </span>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gov-text sm:text-3xl">
                                {t("landing.twoSidesTitle")}
                            </h2>
                            <p className="mt-3 text-sm text-gov-muted sm:text-base">
                                {t("landing.twoSidesDescription")}
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Service Provider Column */}
                            <div className="rounded-lg border border-gov-border bg-gov-canvas p-6 shadow-xs">
                                <div className="flex items-center gap-2.5 border-b border-gov-border pb-4">
                                    <Users className="h-5 w-5 text-gov-primary dark:text-gov-interactive" />
                                    <div>
                                        <h3 className="font-semibold text-base text-gov-text">
                                            {t("landing.spTitle")}
                                        </h3>
                                        <p className="text-xs text-gov-muted">
                                            {t("landing.spSubtitle")}
                                        </p>
                                    </div>
                                </div>

                                <ul className="mt-6 space-y-4 text-xs">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-interactive mt-0.5" />
                                        <div>
                                            <strong className="font-medium text-gov-text">
                                                {t("landing.spFeature1Title")}
                                            </strong>
                                            <p className="mt-0.5 text-gov-muted">
                                                {t("landing.spFeature1Desc")}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-interactive mt-0.5" />
                                        <div>
                                            <strong className="font-medium text-gov-text">
                                                {t("landing.spFeature2Title")}
                                            </strong>
                                            <p className="mt-0.5 text-gov-muted">
                                                {t("landing.spFeature2Desc")}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-interactive mt-0.5" />
                                        <div>
                                            <strong className="font-medium text-gov-text">
                                                {t("landing.spFeature3Title")}
                                            </strong>
                                            <p className="mt-0.5 text-gov-muted">
                                                {t("landing.spFeature3Desc")}
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Client Company Column */}
                            <div className="rounded-lg border border-gov-border bg-gov-canvas p-6 shadow-xs">
                                <div className="flex items-center gap-2.5 border-b border-gov-border pb-4">
                                    <Shield className="h-5 w-5 text-gov-primary dark:text-gov-interactive" />
                                    <div>
                                        <h3 className="font-semibold text-base text-gov-text">
                                            {t("landing.clientTitle")}
                                        </h3>
                                        <p className="text-xs text-gov-muted">
                                            {t("landing.clientSubtitle")}
                                        </p>
                                    </div>
                                </div>

                                <ul className="mt-6 space-y-4 text-xs">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-interactive mt-0.5" />
                                        <div>
                                            <strong className="font-medium text-gov-text">
                                                {t("landing.clientFeature1Title")}
                                            </strong>
                                            <p className="mt-0.5 text-gov-muted">
                                                {t("landing.clientFeature1Desc")}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-interactive mt-0.5" />
                                        <div>
                                            <strong className="font-medium text-gov-text">
                                                {t("landing.clientFeature2Title")}
                                            </strong>
                                            <p className="mt-0.5 text-gov-muted">
                                                {t("landing.clientFeature2Desc")}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-interactive mt-0.5" />
                                        <div>
                                            <strong className="font-medium text-gov-text">
                                                {t("landing.clientFeature3Title")}
                                            </strong>
                                            <p className="mt-0.5 text-gov-muted">
                                                {t("landing.clientFeature3Desc")}
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Capabilities - Asymmetrical Bento Grid */}
                <section
                    id="capabilities"
                    className="scroll-mt-20 border-b border-gov-border bg-gov-canvas py-16 lg:py-20"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gov-interactive">
                                {t("landing.capBadge")}
                            </span>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gov-text sm:text-3xl">
                                {t("landing.capTitle")}
                            </h2>
                            <p className="mt-3 text-sm text-gov-muted sm:text-base">
                                {t("landing.capDescription")}
                            </p>
                        </div>

                        {/* Bento Grid */}
                        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Card 1: Large Span (2 Cols) */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-6 shadow-xs md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gov-interactive" />
                                    <h3 className="font-semibold text-lg text-gov-text">
                                        Predictive Runway Calculation Engine
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    Standard linear division fails in corporate
                                    project reality. HourRadar models budget
                                    exhaustion through day-by-day forward
                                    iteration, skipping weekends, nationwide
                                    German public holidays, and consultant
                                    absence periods.
                                </p>

                                <div className="mt-6 rounded-lg border border-gov-border bg-gov-canvas p-4 text-xs font-mono">
                                    <div className="flex items-center justify-between border-b border-gov-border pb-2">
                                        <span className="text-gov-muted">
                                            RUNWAY PROJECTION ALGORITHM
                                        </span>
                                        <span className="rounded-sm border border-gov-border bg-gov-surface px-1.5 py-0.5 text-[10px] text-gov-text">
                                            ACTIVE ITERATOR
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-1.5 text-gov-text">
                                        <div className="flex justify-between">
                                            <span>
                                                Baseline Pace Projection:
                                            </span>
                                            <span className="font-semibold">
                                                Week 50 (Dec 11)
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-gov-muted">
                                            <span>
                                                + Consultant Absence Adjustment
                                                (5 working days):
                                            </span>
                                            <span>+7 Calendar Days</span>
                                        </div>
                                        <div className="flex justify-between text-gov-muted">
                                            <span>
                                                + Public Holiday Masking:
                                            </span>
                                            <span>Skipped</span>
                                        </div>
                                        <div className="flex justify-between border-t border-gov-border pt-2 text-gov-primary dark:text-gov-interactive">
                                            <span className="font-semibold">
                                                Final Projected Depletion Date:
                                            </span>
                                            <span className="font-semibold">
                                                Week 51 (Dec 18, 2026)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: ArbZG Compliance */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-gov-interactive" />
                                    <h3 className="font-semibold text-base text-gov-text">
                                        ArbZG § 3 Legal Guardrails
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    Strict statutory enforcement. Bookings
                                    exceeding the mandatory 10-hour daily
                                    ceiling are rejected at domain level with
                                    clear legal error feedback.
                                </p>
                                <div className="mt-6 rounded-lg border border-gov-critical-border bg-gov-critical-bg p-3 text-[11px] text-gov-critical-text font-mono">
                                    ArbZG § 3 Violation: Maximum daily working
                                    time is 10 hours. Entry rejected.
                                </div>
                            </div>

                            {/* Card 3: 4-Week Re-Order Radar */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-gov-warning-text" />
                                    <h3 className="font-semibold text-base text-gov-text">
                                        4-Week Procurement Radar
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    Enterprise purchasing needs 4 weeks lead
                                    time. Automated alerts surface in the
                                    management cockpit when runway drops below
                                    the procurement horizon.
                                </p>
                                <div className="mt-6 rounded-lg border border-gov-warning-border bg-gov-warning-bg p-3 text-[11px] text-gov-warning-text font-mono">
                                    Re-Order Deadline: Week 47. Follow-up order
                                    must be placed immediately.
                                </div>
                            </div>

                            {/* Card 4: Wide Span (2 Cols) */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-6 shadow-xs md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <FileCheck2 className="h-5 w-5 text-gov-interactive" />
                                    <h3 className="font-semibold text-base text-gov-text">
                                        Proof of Work Audit & Invoice Settlement
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    Project leads inspect submitted timesheet
                                    entries with granular task proof-of-work
                                    before approving. Verified hours flow
                                    directly into invoice reconciliation tables,
                                    eliminating manual discrepancies between
                                    timesheets and vendor billings.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                                    <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-2 py-1 text-gov-muted">
                                        1-Click Proof Approval
                                    </span>
                                    <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-2 py-1 text-gov-muted">
                                        Statutory 10-Year Tax Audit Retention
                                    </span>
                                    <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-2 py-1 text-gov-muted">
                                        Scheinselbstständigkeit Safeguards
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Operational Telemetry Audit Section */}
                <section
                    id="audit-telemetry"
                    className="scroll-mt-20 border-b border-gov-border bg-gov-surface py-16 lg:py-20"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-gov-interactive">
                                    Live Order Telemetry
                                </span>
                                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gov-text sm:text-3xl">
                                    Purchase Order Governance Schedule
                                </h2>
                                <p className="mt-2 text-xs text-gov-muted">
                                    Real-time status across active corporate
                                    orders, allocations, burn pace, and re-order
                                    thresholds.
                                </p>
                            </div>
                            <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-3 py-1 font-mono text-xs text-gov-muted">
                                AUDIT STAMP:{" "}
                                {new Date().toISOString().split("T")[0]}
                            </span>
                        </div>

                        {/* High-Density Data Table */}
                        <div className="mt-8 overflow-hidden rounded-lg border border-gov-border bg-gov-surface shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-gov-border bg-gov-surface-hover text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                                        <tr>
                                            <th className="h-9 px-4">
                                                Order ID
                                            </th>
                                            <th className="h-9 px-4">
                                                Project / Line Title
                                            </th>
                                            <th className="h-9 px-4">
                                                Service Provider
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                Budget (PD)
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                Approved (PD)
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                Burn Pace
                                            </th>
                                            <th className="h-9 px-4">
                                                Projected Depletion
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gov-border">
                                        <tr className="transition-colors hover:bg-gov-surface-hover">
                                            <td className="h-11 px-4 font-mono font-medium text-gov-text">
                                                PO-4500012345
                                            </td>
                                            <td className="h-11 px-4 font-medium text-gov-text">
                                                Customer Portal Migration
                                            </td>
                                            <td className="h-11 px-4 text-gov-muted">
                                                Acme Consulting GmbH
                                            </td>
                                            <td className="h-11 px-4 text-right font-mono font-medium text-gov-text tabular-nums">
                                                140.00
                                            </td>
                                            <td className="h-11 px-4 text-right font-mono font-medium text-gov-text tabular-nums">
                                                84.00
                                            </td>
                                            <td className="h-11 px-4 text-right font-mono text-gov-muted tabular-nums">
                                                6.0 PD/wk
                                            </td>
                                            <td className="h-11 px-4 font-mono text-gov-text tabular-nums">
                                                2026-12-18 (W51)
                                            </td>
                                            <td className="h-11 px-4 text-right">
                                                <span className="rounded-sm border border-gov-warning-border bg-gov-warning-bg px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-warning-text">
                                                    Re-Order Action (W47)
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="transition-colors hover:bg-gov-surface-hover">
                                            <td className="h-11 px-4 font-mono font-medium text-gov-text">
                                                PO-4500012890
                                            </td>
                                            <td className="h-11 px-4 font-medium text-gov-text">
                                                Legacy ERP Data Bridge
                                            </td>
                                            <td className="h-11 px-4 text-gov-muted">
                                                Systec Solutions AG
                                            </td>
                                            <td className="h-11 px-4 text-right font-mono font-medium text-gov-text tabular-nums">
                                                90.00
                                            </td>
                                            <td className="h-11 px-4 text-right font-mono font-medium text-gov-text tabular-nums">
                                                22.50
                                            </td>
                                            <td className="h-11 px-4 text-right font-mono text-gov-muted tabular-nums">
                                                4.5 PD/wk
                                            </td>
                                            <td className="h-11 px-4 font-mono text-gov-text tabular-nums">
                                                2027-03-05 (W09)
                                            </td>
                                            <td className="h-11 px-4 text-right">
                                                <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-success-text">
                                                    Runway Nominal
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Enterprise Institutional Footer */}
            <footer className="border-t border-gov-border bg-gov-canvas py-12 text-xs text-gov-muted">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="space-y-3">
                            <span className="font-semibold text-sm tracking-tight text-gov-text">
                                HourRadar
                            </span>
                            <p className="text-xs text-gov-muted leading-relaxed">
                                Enterprise time governance and predictive budget
                                runway platform for statutory professional
                                services procurement.
                            </p>
                        </div>
                        <div>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-gov-text">
                                Compliance & Legal
                            </span>
                            <ul className="mt-3 space-y-2">
                                <li>German ArbZG § 3 Compliance</li>
                                <li>Sunday & Holiday Rest Rules (§ 9)</li>
                                <li>Statutory Tax Audit Retention</li>
                                <li>Scheinselbstständigkeit Safeguards</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-gov-text">
                                Platform Architecture
                            </span>
                            <ul className="mt-3 space-y-2">
                                <li>Predictive Runway Engine</li>
                                <li>Bilateral Service Delivery</li>
                                <li>Purchase Order Burndown</li>
                                <li>Procurement Re-Order Radar</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-gov-text">
                                Data Sovereignty
                            </span>
                            <ul className="mt-3 space-y-2">
                                <li>EU GDPR Compliant Architecture</li>
                                <li>On-Premise / Private Cloud Deployable</li>
                                <li>Zero Public LLM Data Ingestion</li>
                                <li>Role-Based Access Enforcement</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gov-border pt-6 text-[11px] text-gov-muted sm:flex-row">
                        <div>
                            {t("landing.footerCopy")}
                        </div>
                        <div className="flex gap-6">
                            <span>Bilateral Governance</span>
                            <span>Statutory Protection</span>
                            <span>Audit Readiness</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
