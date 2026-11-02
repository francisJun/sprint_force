import { Link } from "@inertiajs/react";
import { ChatbotDrawer } from "@/components/hourradar/ChatbotDrawer";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface PurchaseOrderItem {
    id: number;
    order_number: string;
    title: string;
    supplier_name: string;
    total_person_days: number;
    used_person_days: number;
    remaining_person_days: number;
    average_weekly_burn_pd: number;
    forecasted_end_date: string;
    target_end_date: string;
    status_traffic_light: "green" | "yellow" | "red";
    needs_reorder_alert: boolean;
    days_until_reorder_deadline: number;
    vacation_days_affecting_runway: number;
    consultants_count: number;
}

interface Props {
    user: { name: string; role: string };
    orders: PurchaseOrderItem[];
}

export default function PurchasingDashboard({ user, orders }: Props) {
    const { t } = useTranslation();
    const totalAllocated = orders.reduce(
        (sum, o) => sum + o.total_person_days,
        0,
    );
    const totalConsumed = orders.reduce(
        (sum, o) => sum + o.used_person_days,
        0,
    );
    const criticalOrders = orders.filter((o) => o.needs_reorder_alert);

    // Recent audited invoices for overview
    const recentInvoices = [
        {
            id: "1",
            reference: "INV-2026-09-712",
            vendor: "Acme Consulting GmbH",
            order_number: "PO-4500012345",
            claimed_pd: 20.0,
            approved_pd: 20.0,
            variance: "0.00%",
            status: "Matched & Cleared",
        },
        {
            id: "2",
            reference: "INV-2026-10-881",
            vendor: "Acme Consulting GmbH",
            order_number: "PO-4500012345",
            claimed_pd: 30.0,
            approved_pd: 30.0,
            variance: "0.00%",
            status: "Matched & Cleared",
        },
    ];

    return (
        <div className="w-full space-y-8 bg-gov-canvas pb-16 font-sans">
            {/* Top Workspace Bar */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-semibold text-2xl tracking-tight text-gov-text">
                                {t("purchasing.title")}
                            </h1>
                            <span className="rounded-sm border border-gov-border bg-gov-surface px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-muted">
                                {t("purchasing.cockpitBadge")}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("common.consultant")}:{" "}
                            <span className="font-medium text-gov-text">
                                {user.name}
                            </span>{" "}
                            · {t("purchasing.oversight")}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="rounded-sm border border-gov-border bg-gov-surface px-3 py-1 font-mono text-xs text-gov-muted tabular-nums">
                            {t("common.telemetry")}: {new Date().toISOString().split("T")[0]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Critical 4-Week Re-Order Radar Callout */}
            {criticalOrders.length > 0 && (
                <div className="rounded-lg border border-gov-warning-border bg-gov-warning-bg p-5 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-gov-warning-text mt-0.5" />
                            <div>
                                <h2 className="font-semibold text-xs text-gov-warning-text uppercase tracking-wider">
                                    {t("purchasing.criticalAlertTitle")}
                                </h2>
                                <p className="mt-1 text-xs text-gov-warning-text leading-relaxed">
                                    {t("purchasing.criticalAlertMessage")}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/purchasing/orders"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gov-warning-text px-4 py-2 font-medium text-xs text-white hover:opacity-90 transition-opacity"
                        >
                            {t("common.viewDetails")} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Financial & Contract Allocation Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("purchasing.metricCommitment")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-text font-mono tabular-nums">
                        {totalAllocated.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gov-muted">
                            {t("common.pd")}
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        Across {orders.length} agreements
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("purchasing.metricVerifiedSpend")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-text font-mono tabular-nums">
                        {totalConsumed.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gov-muted">
                            {t("common.pd")}
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {totalAllocated > 0
                            ? ((totalConsumed / totalAllocated) * 100).toFixed(
                                  1,
                              )
                            : 0}
                        % {t("common.spent")}
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("purchasing.metricReorderLead")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-warning-text font-mono tabular-nums">
                        {criticalOrders.length}{" "}
                        <span className="text-sm font-normal text-gov-muted">
                            {t("common.order")}
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {t("burndown.reorderWindow")} (28d)
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("purchasing.matchStatus")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-success-text font-mono tabular-nums">
                        0.00%
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {t("purchasing.fullyMatched")}
                    </div>
                </div>
            </div>

            {/* Split Cockpit: Purchase Orders Overview vs Invoice Matching */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel 1: Active Purchase Orders */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gov-border">
                            <div>
                                <h2 className="font-semibold text-base text-gov-text">
                                    {t("purchasing.poTableTitle")}
                                </h2>
                                <p className="text-xs text-gov-muted mt-0.5">
                                    {t("purchasing.poTableSubtitle")}
                                </p>
                            </div>
                            <span className="font-mono text-xs text-gov-muted tabular-nums">
                                {orders.length} {t("common.order")}
                            </span>
                        </div>

                        {/* Top Orders List */}
                        <div className="mt-4 space-y-3">
                            {orders.slice(0, 3).map((o) => (
                                <div
                                    key={o.id}
                                    className="rounded-lg border border-gov-border bg-gov-canvas p-3.5 space-y-2"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-mono text-xs font-semibold text-gov-text">
                                                {o.order_number}
                                            </div>
                                            <div className="text-xs text-gov-muted font-medium truncate max-w-50">
                                                {o.title}
                                            </div>
                                            <div className="text-[11px] text-gov-muted">
                                                Vendor: {o.supplier_name}
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                                o.needs_reorder_alert
                                                    ? "border-gov-warning-border bg-gov-warning-bg text-gov-warning-text"
                                                    : "border-gov-success-border bg-gov-success-bg text-gov-success-text"
                                            }`}
                                        >
                                            {o.needs_reorder_alert
                                                ? t("burndown.reorderWindow")
                                                : t("common.nominal")}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums border-t border-gov-border pt-2 text-gov-muted">
                                        <div>
                                            {t("common.total")}:{" "}
                                            <span className="text-gov-text font-medium">
                                                {o.total_person_days.toFixed(1)}{" "}
                                                {t("common.pd")}
                                            </span>
                                        </div>
                                        <div>
                                            {t("common.spent")}:{" "}
                                            <span className="text-gov-text font-medium">
                                                {o.used_person_days.toFixed(1)}{" "}
                                                {t("common.pd")}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            {t("burndown.targetEnd")}:{" "}
                                            <span className="text-gov-text font-medium">
                                                {o.forecasted_end_date}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-gov-border flex items-center justify-between">
                        <span className="text-xs text-gov-muted">
                            {t("purchasing.frameworkPOs")}
                        </span>
                        <Link
                            href="/purchasing/orders"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gov-border bg-gov-surface px-3 py-1.5 text-xs font-medium text-gov-text hover:bg-gov-surface-hover transition-colors"
                        >
                            {t("purchasing.poTableTitle")}{" "}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Panel 2: Vendor Invoice Matching Ledger */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gov-border">
                            <div>
                                <h2 className="font-semibold text-base text-gov-text">
                                    {t("purchasing.invoicesTableTitle")}
                                </h2>
                                <p className="text-xs text-gov-muted mt-0.5">
                                    {t("purchasing.invoicesTableSubtitle")}
                                </p>
                            </div>
                            <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-2 py-0.5 text-xs font-semibold text-gov-success-text">
                                100% {t("common.verified")}
                            </span>
                        </div>

                        {/* Recent Invoices Preview */}
                        <div className="mt-4 space-y-3">
                            {recentInvoices.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="rounded-lg border border-gov-border bg-gov-canvas p-3.5 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-mono text-xs font-semibold text-gov-text">
                                                {inv.reference}
                                            </div>
                                            <div className="text-xs text-gov-muted">
                                                {inv.vendor} ·{" "}
                                                {inv.order_number}
                                            </div>
                                        </div>
                                        <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-gov-success-text">
                                            {inv.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums border-t border-gov-border pt-2 text-gov-muted">
                                        <div>
                                            {t("purchasing.thClaimed")}:{" "}
                                            <span className="text-gov-text font-medium">
                                                {inv.claimed_pd.toFixed(1)} {t("common.pd")}
                                            </span>
                                        </div>
                                        <div>
                                            {t("purchasing.thVerified")}:{" "}
                                            <span className="text-gov-text font-medium">
                                                {inv.approved_pd.toFixed(1)} {t("common.pd")}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            {t("purchasing.thVariance")}:{" "}
                                            <span className="text-gov-success-text font-medium">
                                                {inv.variance}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-gov-border flex items-center justify-between">
                        <span className="text-xs text-gov-muted">
                            {t("purchasing.threeWayMatch")}
                        </span>
                        <Link
                            href="/purchasing/invoices"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gov-border bg-gov-surface px-3 py-1.5 text-xs font-medium text-gov-text hover:bg-gov-surface-hover transition-colors"
                        >
                            {t("nav.purchasingInvoices")}{" "}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Regulatory Advisor Drawer */}
            <ChatbotDrawer />
        </div>
    );
}
