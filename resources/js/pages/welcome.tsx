import { Head, Link, usePage } from "@inertiajs/react";
import AppLogoIcon from "@/components/app-logo-icon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import {
    AlertTriangle,
    ArrowRight,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileCheck2,
    Info,
    KeyRound,
    Layers,
    Scale,
    Server,
    Shield,
    Users,
    Zap,
} from "lucide-react";
import { dashboard, login } from "@/routes";

export default function Welcome() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gov-canvas text-gov-text font-sans scroll-smooth selection:bg-gov-interactive selection:text-white">
            <Head title={`HourRadar - ${t("common.tagline")}`} />

            {/* Top Navigation - Streamlined to 4 core links */}
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
                            href="#capabilities"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.capabilities")}
                        </a>
                        <a
                            href="#pricing"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.pricing")}
                        </a>
                        <a
                            href="#security"
                            className="transition-colors hover:text-gov-text"
                        >
                            {t("nav.security")}
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

                        <p className="mx-auto mt-5 max-w-3xl text-base text-gov-muted sm:text-lg leading-relaxed">
                            {t("landing.heroDescription")}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-gov-interactive px-6 text-sm font-medium text-white transition-colors hover:bg-gov-interactive-hover cursor-pointer shadow-xs"
                                >
                                    {t("landing.openDashboard")}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-gov-interactive px-6 text-sm font-medium text-white transition-colors hover:bg-gov-interactive-hover cursor-pointer shadow-xs"
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

                        {/* Enterprise Trust Guardrails */}
                        <div className="mt-12 grid grid-cols-2 gap-3 text-left sm:grid-cols-4 pt-8 border-t border-gov-border/60">
                            <div className="flex items-center gap-2 text-xs text-gov-muted">
                                <Scale className="h-4 w-4 text-gov-interactive shrink-0" />
                                <span>{t("landing.heroTrustArbzg")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gov-muted">
                                <Shield className="h-4 w-4 text-gov-interactive shrink-0" />
                                <span>{t("landing.heroTrustBetriebsrat")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gov-muted">
                                <Server className="h-4 w-4 text-gov-interactive shrink-0" />
                                <span>{t("landing.heroTrustVpc")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gov-muted">
                                <Zap className="h-4 w-4 text-gov-interactive shrink-0" />
                                <span>{t("landing.heroTrustUnlimited")}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Operational KPI & ROI Strip */}
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

                            {/* Metric 2: Quantified Time Savings */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gov-muted">
                                        {t("landing.kpiSavingsTitle")}
                                    </span>
                                    <Clock className="h-4 w-4 text-gov-muted" />
                                </div>
                                <div className="mt-3 text-3xl font-semibold tracking-tight text-gov-text tabular-nums">
                                    35{" "}
                                    <span className="text-sm font-normal text-gov-muted">
                                        {t("landing.kpiSavingsValue")}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gov-muted">
                                        {t("landing.kpiSavingsSub")}
                                    </span>
                                    <span className="font-medium text-gov-text tabular-nums">
                                        {t("landing.kpiSavingsBadge")}
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
                                        {t("landing.kpiArbzgSub")}
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
                                        {t("landing.bentoRunwayTitle")}
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.bentoRunwayDesc")}
                                </p>

                                <div className="mt-6 rounded-lg border border-gov-border bg-gov-canvas p-4 text-xs font-mono">
                                    <div className="flex items-center justify-between border-b border-gov-border pb-2">
                                        <span className="text-gov-muted uppercase">
                                            {t("landing.bentoAlgoHeader")}
                                        </span>
                                        <span className="rounded-sm border border-gov-border bg-gov-surface px-1.5 py-0.5 text-[10px] text-gov-text">
                                            {t("landing.bentoAlgoStatus")}
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-1.5 text-gov-text">
                                        <div className="flex justify-between">
                                            <span>{t("landing.bentoPaceLabel")}</span>
                                            <span className="font-semibold">
                                                {t("landing.bentoPaceValue")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-gov-muted">
                                            <span>
                                                {t("landing.bentoAbsenceLabel")}
                                            </span>
                                            <span>{t("landing.bentoAbsenceValue")}</span>
                                        </div>
                                        <div className="flex justify-between text-gov-muted">
                                            <span>{t("landing.bentoHolidayLabel")}</span>
                                            <span>{t("landing.bentoHolidayValue")}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-gov-border pt-2 text-gov-primary dark:text-gov-interactive">
                                            <span className="font-semibold">
                                                {t("landing.bentoFinalDateLabel")}
                                            </span>
                                            <span className="font-semibold">
                                                {t("landing.bentoFinalDateValue")}
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
                                        {t("landing.bentoArbzgTitle")}
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.bentoArbzgDesc")}
                                </p>
                                <div className="mt-6 rounded-lg border border-gov-critical-border bg-gov-critical-bg p-3 text-[11px] text-gov-critical-text font-mono">
                                    {t("landing.bentoArbzgAlert")}
                                </div>
                            </div>

                            {/* Card 3: 4-Week Re-Order Radar */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-gov-warning-text" />
                                    <h3 className="font-semibold text-base text-gov-text">
                                        {t("landing.bentoRadarTitle")}
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.bentoRadarDesc")}
                                </p>
                                <div className="mt-6 rounded-lg border border-gov-warning-border bg-gov-warning-bg p-3 text-[11px] text-gov-warning-text font-mono">
                                    {t("landing.bentoRadarAlert")}
                                </div>
                            </div>

                            {/* Card 4: Wide Span (2 Cols) */}
                            <div className="rounded-lg border border-gov-border bg-gov-surface p-6 shadow-xs md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <FileCheck2 className="h-5 w-5 text-gov-interactive" />
                                    <h3 className="font-semibold text-base text-gov-text">
                                        {t("landing.bentoAuditTitle")}
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.bentoAuditDesc")}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                                    <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-2 py-1 text-gov-muted">
                                        {t("landing.bentoBadge1")}
                                    </span>
                                    <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-2 py-1 text-gov-muted">
                                        {t("landing.bentoBadge2")}
                                    </span>
                                    <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-2 py-1 text-gov-muted">
                                        {t("landing.bentoBadge3")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enterprise Delivery & Order-Based Pricing Section */}
                <section
                    id="pricing"
                    className="scroll-mt-20 border-b border-gov-border bg-gov-surface py-16 lg:py-20"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gov-interactive">
                                {t("landing.pricingBadge")}
                            </span>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gov-text sm:text-3xl">
                                {t("landing.pricingTitle")}
                            </h2>
                            <p className="mt-3 text-sm text-gov-muted sm:text-base leading-relaxed">
                                {t("landing.pricingSubtitle")}
                            </p>
                        </div>

                        {/* Pricing Cards Grid */}
                        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Tier 1: Starter */}
                            <div className="flex flex-col justify-between rounded-xl border border-gov-border bg-gov-canvas p-6 shadow-xs transition-shadow hover:shadow-md">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-base text-gov-text">
                                            {t("landing.planStarterTitle")}
                                        </h3>
                                        <span className="rounded-sm border border-gov-border bg-gov-surface px-2 py-0.5 text-[10px] font-medium text-gov-muted">
                                            {t("landing.planStarterBadge")}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gov-muted">
                                        {t("landing.planStarterDesc")}
                                    </p>

                                    <div className="mt-6 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold tracking-tight text-gov-text">
                                            {t("landing.planStarterPrice")}
                                        </span>
                                        <span className="text-xs text-gov-muted">
                                            / {t("landing.planStarterPeriod")}
                                        </span>
                                    </div>

                                    <div className="mt-2 text-[11px] font-medium text-gov-interactive">
                                        {t("landing.planStarterSub")}
                                    </div>

                                    <ul className="mt-6 space-y-3 text-xs text-gov-muted border-t border-gov-border pt-6">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planStarterFeat1")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planStarterFeat2")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planStarterFeat3")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planStarterFeat4")}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-4">
                                    <Link
                                        href={login()}
                                        className="inline-flex w-full h-10 items-center justify-center rounded-lg border border-gov-border bg-gov-surface text-xs font-semibold text-gov-text transition-colors hover:bg-gov-surface-hover"
                                    >
                                        {t("landing.planStarterCta")}
                                    </Link>
                                </div>
                            </div>

                            {/* Tier 2: Department (Highlighted) */}
                            <div className="relative flex flex-col justify-between rounded-xl border-2 border-gov-interactive bg-gov-surface p-6 shadow-md">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gov-interactive px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
                                    {t("landing.planDeptBadge")}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-base text-gov-text">
                                            {t("landing.planDeptTitle")}
                                        </h3>
                                        <span className="rounded-sm border border-gov-interactive/30 bg-gov-interactive/10 px-2 py-0.5 text-[10px] font-medium text-gov-interactive">
                                            Full Governance
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gov-muted">
                                        {t("landing.planDeptDesc")}
                                    </p>

                                    <div className="mt-6 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold tracking-tight text-gov-text">
                                            {t("landing.planDeptPrice")}
                                        </span>
                                        <span className="text-xs text-gov-muted">
                                            / {t("landing.planDeptPeriod")}
                                        </span>
                                    </div>

                                    <div className="mt-2 text-[11px] font-semibold text-gov-interactive">
                                        {t("landing.planDeptSub")}
                                    </div>

                                    <ul className="mt-6 space-y-3 text-xs text-gov-text border-t border-gov-border pt-6">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <strong className="font-medium">{t("landing.planDeptFeat1")}</strong>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planDeptFeat2")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planDeptFeat3")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planDeptFeat4")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planDeptFeat5")}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-4">
                                    <Link
                                        href={login()}
                                        className="inline-flex w-full h-10 items-center justify-center rounded-lg bg-gov-interactive text-xs font-semibold text-white transition-colors hover:bg-gov-interactive-hover shadow-xs"
                                    >
                                        {t("landing.planDeptCta")}
                                    </Link>
                                </div>
                            </div>

                            {/* Tier 3: Enterprise Sovereign */}
                            <div className="flex flex-col justify-between rounded-xl border border-gov-border bg-gov-canvas p-6 shadow-xs transition-shadow hover:shadow-md">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-base text-gov-text">
                                            {t("landing.planEntTitle")}
                                        </h3>
                                        <span className="rounded-sm border border-gov-border bg-gov-surface px-2 py-0.5 text-[10px] font-medium text-gov-muted">
                                            {t("landing.planEntBadge")}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gov-muted">
                                        {t("landing.planEntDesc")}
                                    </p>

                                    <div className="mt-6 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold tracking-tight text-gov-text">
                                            {t("landing.planEntPrice")}
                                        </span>
                                        <span className="text-xs text-gov-muted">
                                            / {t("landing.planEntPeriod")}
                                        </span>
                                    </div>

                                    <div className="mt-2 text-[11px] font-medium text-gov-muted">
                                        {t("landing.planEntSub")}
                                    </div>

                                    <ul className="mt-6 space-y-3 text-xs text-gov-muted border-t border-gov-border pt-6">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planEntFeat1")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planEntFeat2")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planEntFeat3")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planEntFeat4")}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-gov-interactive shrink-0" />
                                            <span>{t("landing.planEntFeat5")}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-4">
                                    <Link
                                        href={login()}
                                        className="inline-flex w-full h-10 items-center justify-center rounded-lg border border-gov-border bg-gov-surface text-xs font-semibold text-gov-text transition-colors hover:bg-gov-surface-hover"
                                    >
                                        {t("landing.planEntCta")}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Order-Based Philosophy Callout Banner */}
                        <div className="mt-12 rounded-xl border border-gov-border bg-gov-surface p-6 shadow-xs">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gov-interactive/10 text-gov-interactive">
                                    <Info className="size-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gov-text">
                                        {t("landing.pricingWhyTitle")}
                                    </h4>
                                    <p className="mt-1 text-xs text-gov-muted leading-relaxed">
                                        {t("landing.pricingWhyText")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enterprise Security, Deployment & Data Sovereignty Section */}
                <section
                    id="security"
                    className="scroll-mt-20 border-b border-gov-border bg-gov-canvas py-16 lg:py-20"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gov-interactive">
                                {t("landing.securityBadge")}
                            </span>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gov-text sm:text-3xl">
                                {t("landing.securityTitle")}
                            </h2>
                            <p className="mt-3 text-sm text-gov-muted sm:text-base leading-relaxed">
                                {t("landing.securitySubtitle")}
                            </p>
                        </div>

                        {/* 4 Pillars Grid */}
                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Pillar 1 */}
                            <div className="rounded-xl border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-gov-surface-hover text-gov-interactive">
                                    <Building2 className="size-5" />
                                </div>
                                <h3 className="mt-4 font-semibold text-base text-gov-text">
                                    {t("landing.secWorksCouncilTitle")}
                                </h3>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.secWorksCouncilDesc")}
                                </p>
                            </div>

                            {/* Pillar 2 */}
                            <div className="rounded-xl border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-gov-surface-hover text-gov-interactive">
                                    <Server className="size-5" />
                                </div>
                                <h3 className="mt-4 font-semibold text-base text-gov-text">
                                    {t("landing.secSovereignTitle")}
                                </h3>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.secSovereignDesc")}
                                </p>
                            </div>

                            {/* Pillar 3 */}
                            <div className="rounded-xl border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-gov-surface-hover text-gov-interactive">
                                    <KeyRound className="size-5" />
                                </div>
                                <h3 className="mt-4 font-semibold text-base text-gov-text">
                                    {t("landing.secSsoTitle")}
                                </h3>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.secSsoDesc")}
                                </p>
                            </div>

                            {/* Pillar 4 */}
                            <div className="rounded-xl border border-gov-border bg-gov-surface p-6 shadow-xs">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-gov-surface-hover text-gov-interactive">
                                    <Zap className="size-5" />
                                </div>
                                <h3 className="mt-4 font-semibold text-base text-gov-text">
                                    {t("landing.secQueueTitle")}
                                </h3>
                                <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                                    {t("landing.secQueueDesc")}
                                </p>
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
                                    {t("landing.telemetryBadge")}
                                </span>
                                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gov-text sm:text-3xl">
                                    {t("landing.telemetryTitle")}
                                </h2>
                                <p className="mt-2 text-xs text-gov-muted">
                                    {t("landing.telemetrySubtitle")}
                                </p>
                            </div>
                            <span className="rounded-sm border border-gov-border bg-gov-surface-hover px-3 py-1 font-mono text-xs text-gov-muted">
                                {t("landing.telemetryAuditStamp")}{" "}
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
                                                {t("landing.telemetryThOrderId")}
                                            </th>
                                            <th className="h-9 px-4">
                                                {t("landing.telemetryThProject")}
                                            </th>
                                            <th className="h-9 px-4">
                                                {t("landing.telemetryThProvider")}
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                {t("landing.telemetryThBudget")}
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                {t("landing.telemetryThApproved")}
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                {t("landing.telemetryThBurnPace")}
                                            </th>
                                            <th className="h-9 px-4">
                                                {t("landing.telemetryThProjected")}
                                            </th>
                                            <th className="h-9 px-4 text-right">
                                                {t("landing.telemetryThStatus")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gov-border">
                                        <tr className="transition-colors hover:bg-gov-surface-hover">
                                            <td className="h-11 px-4 font-mono font-medium text-gov-text">
                                                PO-4500012345
                                            </td>
                                            <td className="h-11 px-4 font-medium text-gov-text">
                                                {t("landing.telemetryProject1")}
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
                                                6.0 {t("common.pd")}/wk
                                            </td>
                                            <td className="h-11 px-4 font-mono text-gov-text tabular-nums">
                                                2026-12-18 (W51)
                                            </td>
                                            <td className="h-11 px-4 text-right">
                                                <span className="rounded-sm border border-gov-warning-border bg-gov-warning-bg px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-warning-text">
                                                    {t("landing.telemetryStatusReorder")}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="transition-colors hover:bg-gov-surface-hover">
                                            <td className="h-11 px-4 font-mono font-medium text-gov-text">
                                                PO-4500012890
                                            </td>
                                            <td className="h-11 px-4 font-medium text-gov-text">
                                                {t("landing.telemetryProject2")}
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
                                                4.5 {t("common.pd")}/wk
                                            </td>
                                            <td className="h-11 px-4 font-mono text-gov-text tabular-nums">
                                                2027-03-05 (W09)
                                            </td>
                                            <td className="h-11 px-4 text-right">
                                                <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-success-text">
                                                    {t("landing.telemetryStatusNominal")}
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
                                {t("landing.footerDesc")}
                            </p>
                        </div>
                        <div>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-gov-text">
                                {t("landing.footerColCompliance")}
                            </span>
                            <ul className="mt-3 space-y-2">
                                <li>{t("landing.footerCompliance1")}</li>
                                <li>{t("landing.footerCompliance2")}</li>
                                <li>{t("landing.footerCompliance3")}</li>
                                <li>{t("landing.footerCompliance4")}</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-gov-text">
                                {t("landing.footerColArchitecture")}
                            </span>
                            <ul className="mt-3 space-y-2">
                                <li>{t("landing.footerArch1")}</li>
                                <li>{t("landing.footerArch2")}</li>
                                <li>{t("landing.footerArch3")}</li>
                                <li>{t("landing.footerArch4")}</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-gov-text">
                                {t("landing.footerColSovereignty")}
                            </span>
                            <ul className="mt-3 space-y-2">
                                <li>{t("landing.footerSov1")}</li>
                                <li>{t("landing.footerSov2")}</li>
                                <li>{t("landing.footerSov3")}</li>
                                <li>{t("landing.footerSov4")}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gov-border pt-6 text-[11px] text-gov-muted sm:flex-row">
                        <div>
                            {t("landing.footerCopy")}
                        </div>
                        <div className="flex gap-6">
                            <span>{t("landing.footerTag1")}</span>
                            <span>{t("landing.footerTag2")}</span>
                            <span>{t("landing.footerTag3")}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
