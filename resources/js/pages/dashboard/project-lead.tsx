import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ChatbotDrawer } from "@/components/hourradar/ChatbotDrawer";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    FileText,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    OrderBurndownChart,
    BurndownPoint,
} from "@/components/hourradar/OrderBurndownChart";
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
    reorder_deadline_date?: string;
    vacation_days_affecting_runway: number;
    consultants_count: number;
    start_date?: string;
    burndown_series?: BurndownPoint[];
}

interface PendingBookingItem {
    id: number;
    consultant_name: string;
    order_number: string;
    order_title: string;
    date: string;
    hours: number;
    description: string;
}

interface Props {
    user: { name: string; role: string };
    orders: PurchaseOrderItem[];
    pendingBookings: PendingBookingItem[];
}

export default function ProjectLeadDashboard({
    user,
    orders,
    pendingBookings,
}: Props) {
    const { t, isGerman } = useTranslation();
    const [selectedOrderForModal, setSelectedOrderForModal] =
        useState<PurchaseOrderItem | null>(null);
    const [rejectingBooking, setRejectingBooking] =
        useState<PendingBookingItem | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = (bookingId: number) => {
        router.post(
            `/bookings/${bookingId}/approve`,
            {},
            { preserveScroll: true },
        );
    };

    const handleReject = () => {
        if (!rejectingBooking || !rejectionReason.trim()) return;
        router.post(
            `/bookings/${rejectingBooking.id}/reject`,
            { rejection_reason: rejectionReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingBooking(null);
                    setRejectionReason("");
                },
            },
        );
    };

    // Portfolio metrics
    const totalAllocated = orders.reduce(
        (sum, o) => sum + o.total_person_days,
        0,
    );
    const totalConsumed = orders.reduce(
        (sum, o) => sum + o.used_person_days,
        0,
    );
    const averageBurnRate = orders.reduce(
        (sum, o) => sum + o.average_weekly_burn_pd,
        0,
    );
    const criticalOrders = orders.filter((o) => o.needs_reorder_alert);

    // Sort orders by urgency for cockpit highlight
    const sortedOrders = [...orders].sort((a, b) => {
        if (a.needs_reorder_alert && !b.needs_reorder_alert) return -1;
        if (!a.needs_reorder_alert && b.needs_reorder_alert) return 1;
        return a.days_until_reorder_deadline - b.days_until_reorder_deadline;
    });

    return (
        <div className="w-full space-y-8 bg-gov-canvas pb-16 font-sans">
            {/* Top Operational Bar */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-semibold text-2xl tracking-tight text-gov-text">
                                {t("lead.cockpitTitle")}
                            </h1>
                            <span className="rounded-sm border border-gov-border bg-gov-surface px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-muted">
                                {t("lead.cockpitSubtitle")}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("lead.thConsultant")}:{" "}
                            <span className="font-medium text-gov-text">
                                {user.name}
                            </span>{" "}
                            · Portfolio:{" "}
                            <span className="font-medium text-gov-text">
                                {orders.length} {t("common.order")}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Advance Procurement Radar Banner */}
            {criticalOrders.length > 0 && (
                <div className="rounded-lg border border-gov-warning-border bg-gov-warning-bg p-4 shadow-xs">
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
                            href="/orders"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gov-warning-text px-3.5 py-1.5 font-medium text-xs text-white hover:opacity-90 transition-opacity"
                        >
                            {t("common.viewDetails")} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* KPI Executive Matrix */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("lead.portfolioBudget")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-text font-mono tabular-nums">
                        {totalAllocated.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gov-muted">
                            {t("common.pd")}
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {isGerman
                            ? `Über ${orders.length} Vereinbarungen`
                            : `Across ${orders.length} agreements`}
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("lead.consumedToDate")}
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
                        {t("common.remaining")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-text font-mono tabular-nums">
                        {(totalAllocated - totalConsumed).toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gov-muted">
                            {t("common.pd")}
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {t("burndown.remainingBudget")}
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {t("lead.pendingApprovalsCount")}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-gov-warning-text font-mono tabular-nums">
                        {pendingBookings.length}{" "}
                        <span className="text-sm font-normal text-gov-muted">
                            {t("common.lineItems")}
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {t("common.pending")}
                    </div>
                </div>
            </div>

            {/* Split Cockpit: Runway Burndown vs Proof-of-Work Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel 1: Order Runway Burndown */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gov-border">
                            <div>
                                <h2 className="font-semibold text-base text-gov-text">
                                    {t("nav.orders")}
                                </h2>
                                <p className="text-xs text-gov-muted mt-0.5">
                                    {t("burndown.title")}
                                </p>
                            </div>
                            <span className="font-mono text-xs text-gov-muted tabular-nums">
                                {orders.length} {t("common.order")}
                            </span>
                        </div>

                        {/* Top Orders List */}
                        <div className="mt-4 space-y-3">
                            {sortedOrders.slice(0, 3).map((o) => {
                                const percentUsed = Math.min(
                                    100,
                                    Math.round(
                                        (o.used_person_days /
                                            o.total_person_days) *
                                            100,
                                    ),
                                );
                                return (
                                    <div
                                        key={o.id}
                                        onClick={() =>
                                            setSelectedOrderForModal(o)
                                        }
                                        className="rounded-lg border border-gov-border bg-gov-canvas p-3.5 space-y-2.5 transition-colors hover:border-gov-accent/60 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-semibold text-gov-text">
                                                        {o.order_number}
                                                    </span>
                                                    <span className="text-xs text-gov-muted truncate max-w-50px">
                                                        {o.title}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gov-muted mt-0.5">
                                                    {o.supplier_name}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span
                                                    className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                                        o.needs_reorder_alert
                                                            ? "border-gov-warning-border bg-gov-warning-bg text-gov-warning-text"
                                                            : "border-gov-success-border bg-gov-success-bg text-gov-success-text"
                                                    }`}
                                                >
                                                    {o.needs_reorder_alert
                                                        ? `${t("burndown.reorderWindow")} (${o.days_until_reorder_deadline}d)`
                                                        : t("common.nominal")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px] font-mono tabular-nums text-gov-muted">
                                                <span>
                                                    {o.used_person_days.toFixed(
                                                        1,
                                                    )}{" "}
                                                    /{" "}
                                                    {o.total_person_days.toFixed(
                                                        1,
                                                    )}{" "}
                                                    {t("common.pd")} ({percentUsed}%)
                                                </span>
                                                <span className="text-gov-interactive hover:underline">
                                                    {t("lead.viewRunwayBurndown")} →
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-sm bg-gov-surface-hover">
                                                <div
                                                    className={`h-full ${
                                                        o.needs_reorder_alert
                                                            ? "bg-gov-warning-text"
                                                            : "bg-gov-interactive"
                                                    }`}
                                                    style={{
                                                        width: `${percentUsed}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-gov-border flex items-center justify-between">
                        <span className="text-xs text-gov-muted font-mono tabular-nums">
                            {t("burndown.weeklyBurn")}: {averageBurnRate.toFixed(1)}{" "}
                            {t("common.pd")}/wk
                        </span>
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gov-border bg-gov-surface px-3 py-1.5 text-xs font-medium text-gov-text hover:bg-gov-surface-hover transition-colors"
                        >
                            {t("lead.ordersTitle")}{" "}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Panel 2: Proof of Work Verification Queue */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gov-border">
                            <div>
                                <h2 className="font-semibold text-base text-gov-text">
                                    {t("lead.pendingTitle")}
                                </h2>
                                <p className="text-xs text-gov-muted mt-0.5">
                                    {t("lead.pendingSubtitle")}
                                </p>
                            </div>
                            <span className="rounded-sm border border-gov-border bg-gov-canvas px-2 py-0.5 text-xs font-mono tabular-nums text-gov-text">
                                {pendingBookings.length} {t("common.pending")}
                            </span>
                        </div>

                        {/* Recent Pending Approvals */}
                        <div className="mt-4 space-y-3">
                            {pendingBookings.length === 0 ? (
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-8 text-center text-xs text-gov-muted">
                                    <CheckCircle2 className="mx-auto h-6 w-6 text-gov-success-text mb-2" />
                                    {t("lead.noPending")}
                                </div>
                            ) : (
                                pendingBookings.slice(0, 3).map((b) => (
                                    <div
                                        key={b.id}
                                        className="rounded-lg border border-gov-border bg-gov-canvas p-3.5 flex items-start justify-between gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-xs text-gov-text">
                                                    {b.consultant_name}
                                                </span>
                                                <span className="font-mono text-[11px] text-gov-muted tabular-nums">
                                                    · {b.date}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-gov-muted">
                                                <span className="font-mono text-gov-text font-medium">
                                                    {b.order_number}
                                                </span>
                                                : {b.description}
                                            </div>
                                            <div className="font-mono text-xs font-medium text-gov-text tabular-nums pt-0.5">
                                                {b.hours.toFixed(1)}h (
                                                {(b.hours / 8).toFixed(2)} {t("common.pd")})
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() =>
                                                    handleApprove(b.id)
                                                }
                                                className="rounded-md bg-gov-interactive px-2.5 py-1 text-xs font-medium text-white hover:bg-gov-interactive-hover transition-colors cursor-pointer"
                                            >
                                                {t("lead.approve")}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setRejectingBooking(b)
                                                }
                                                className="rounded-md border border-gov-border bg-gov-surface px-2.5 py-1 text-xs font-medium text-gov-critical-text hover:bg-gov-critical-bg transition-colors cursor-pointer"
                                            >
                                                {t("lead.reject")}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-gov-border flex items-center justify-between">
                        <span className="text-xs text-gov-muted">
                            {t("lead.deliverableVerified")}
                        </span>
                        <Link
                            href="/approvals"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gov-border bg-gov-surface px-3 py-1.5 text-xs font-medium text-gov-text hover:bg-gov-surface-hover transition-colors"
                        >
                            {t("nav.approvals")} ({pendingBookings.length}){" "}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Order Specification & Burndown Chart Modal */}
            <Dialog
                open={!!selectedOrderForModal}
                onOpenChange={(open) => !open && setSelectedOrderForModal(null)}
            >
                <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader className="pr-12">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gov-interactive" />
                                <DialogTitle className="text-base font-semibold text-gov-text">
                                    {isGerman ? 'Auftragsreichweite & Burndown:' : 'Order Runway & Burndown:'}{' '}
                                    {selectedOrderForModal?.order_number}
                                </DialogTitle>
                            </span>
                            <span
                                className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                    selectedOrderForModal?.needs_reorder_alert
                                        ? "border-gov-warning-border bg-gov-warning-bg text-gov-warning-text"
                                        : "border-gov-success-border bg-gov-success-bg text-gov-success-text"
                                }`}
                            >
                                {selectedOrderForModal?.needs_reorder_alert
                                    ? (isGerman ? "Nachbestellung erforderlich" : "Re-Order Required")
                                    : (isGerman ? "Aktive Reichweite" : "Active Runway")}
                            </span>
                        </div>
                        <DialogDescription className="text-xs text-gov-muted">
                            {selectedOrderForModal?.title} · {isGerman ? 'Dienstleister:' : 'Vendor:'}{' '}
                            {selectedOrderForModal?.supplier_name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrderForModal && (
                        <div className="space-y-4 pt-2">
                            {/* Predictive Burndown Chart */}
                            <OrderBurndownChart
                                totalPersonDays={
                                    selectedOrderForModal.total_person_days
                                }
                                usedPersonDays={
                                    selectedOrderForModal.used_person_days
                                }
                                remainingPersonDays={
                                    selectedOrderForModal.remaining_person_days
                                }
                                weeklyBurnRate={
                                    selectedOrderForModal.average_weekly_burn_pd
                                }
                                forecastedEndDate={
                                    selectedOrderForModal.forecasted_end_date
                                }
                                targetEndDate={
                                    selectedOrderForModal.target_end_date
                                }
                                needsReorderAlert={
                                    selectedOrderForModal.needs_reorder_alert
                                }
                                daysUntilReorder={
                                    selectedOrderForModal.days_until_reorder_deadline
                                }
                                reorderDeadlineDate={
                                    selectedOrderForModal.reorder_deadline_date
                                }
                                series={selectedOrderForModal.burndown_series}
                            />

                            {/* Additional Parameters Matrix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 space-y-1.5 font-mono">
                                    <div className="text-[10px] uppercase font-semibold text-gov-muted">
                                        {isGerman ? 'Lieferrahmen' : 'Delivery Framework'}
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? 'Dienstleistungspartner:' : 'Vendor Partner:'}
                                        </span>
                                        <span className="font-medium">
                                            {
                                                selectedOrderForModal.supplier_name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? 'Vertragsende Ziel:' : 'Target Contract End:'}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {
                                                selectedOrderForModal.target_end_date
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? 'Zugewiesene Berater:' : 'Assigned Consultants:'}
                                        </span>
                                        <span className="font-medium">
                                            {
                                                selectedOrderForModal.consultants_count
                                            }{" "}
                                            {isGerman ? 'Mitarbeiter' : 'Staff'}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 space-y-1.5 font-mono">
                                    <div className="text-[10px] uppercase font-semibold text-gov-muted">
                                        {isGerman ? 'Gesetzliche Abwesenheitsanpassungen' : 'Statutory Absence Adjustments'}
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? 'Urlaubstage-Puffer:' : 'Vacation Days Buffer:'}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {
                                                selectedOrderForModal.vacation_days_affecting_runway
                                            }{" "}
                                            {isGerman ? 'Tage' : 'days'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? 'Prognostizierte Erschöpfung:' : 'Forecasted Exhaustion:'}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {
                                                selectedOrderForModal.forecasted_end_date
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? 'Vorlauffrist-Fenster:' : 'Lead Time Notice Window:'}
                                        </span>
                                        <span className="font-medium text-gov-warning-text tabular-nums">
                                            {isGerman ? '28 Kalendertage' : '28 Calendar Days'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedOrderForModal(null)
                                    }
                                    className="h-8 rounded-lg border border-gov-border bg-gov-surface px-4 text-xs font-medium text-gov-text hover:bg-gov-surface-hover cursor-pointer"
                                >
                                    {isGerman ? 'Spezifikation schließen' : 'Close Specification'}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog
                open={!!rejectingBooking}
                onOpenChange={(open) => !open && setRejectingBooking(null)}
            >
                <DialogContent className="max-w-md bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-gov-text">
                            {isGerman ? 'Leistungsnachweis ablehnen' : 'Reject Timesheet Submission'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {isGerman
                                ? `Strukturiertes Prüf-Feedback für ${rejectingBooking?.consultant_name} angeben.`
                                : `Provide structured audit feedback for ${rejectingBooking?.consultant_name}.`}
                        </DialogDescription>
                    </DialogHeader>

                    {rejectingBooking && (
                        <div className="space-y-4 pt-2">
                            <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 text-xs space-y-1">
                                <div className="text-gov-muted">
                                    Date:{" "}
                                    <span className="font-mono text-gov-text">
                                        {rejectingBooking.date}
                                    </span>{" "}
                                    · Units:{" "}
                                    <span className="font-mono font-medium text-gov-text">
                                        {rejectingBooking.hours}h
                                    </span>
                                </div>
                                <div className="text-gov-muted italic truncate">
                                    "{rejectingBooking.description}"
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gov-text mb-1">
                                    {t("lead.rejectionReason")}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={t("lead.rejectionReason")}
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gov-border bg-gov-surface p-2.5 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-accent focus:outline-none focus:ring-1 focus:ring-gov-accent"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setRejectingBooking(null)}
                                    className="rounded-md border border-gov-border bg-gov-surface px-3 py-1.5 text-xs font-medium text-gov-muted hover:text-gov-text cursor-pointer"
                                >
                                    {t("common.cancel")}
                                </button>
                                <button
                                    disabled={!rejectionReason.trim()}
                                    onClick={handleReject}
                                    className="rounded-md bg-gov-critical-text px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                >
                                    {t("lead.confirmReject")}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Regulatory In-App Assistant Drawer */}
            <ChatbotDrawer />
        </div>
    );
}
