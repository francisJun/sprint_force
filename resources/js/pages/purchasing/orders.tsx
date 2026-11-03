import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { ChatbotDrawer } from "@/components/hourradar/ChatbotDrawer";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { AlertTriangle, FileText, Search } from "lucide-react";
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

interface Props {
    user: { name: string; role: string };
    orders: PurchaseOrderItem[];
}

export default function PurchasingOrdersIndex({ user, orders }: Props) {
    const { t, isGerman } = useTranslation();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "alert" | "nominal"
    >("all");
    const [selectedOrder, setSelectedOrder] =
        useState<PurchaseOrderItem | null>(null);

    const filteredOrders = orders.filter((o) => {
        const matchesSearch =
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            o.title.toLowerCase().includes(search.toLowerCase()) ||
            o.supplier_name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all"
                ? true
                : statusFilter === "alert"
                  ? o.needs_reorder_alert
                  : !o.needs_reorder_alert;

        return matchesSearch && matchesStatus;
    });

    const orderPagination = usePagination(filteredOrders, 8);

    const totalAllocated = orders.reduce(
        (sum, o) => sum + o.total_person_days,
        0,
    );
    const totalConsumed = orders.reduce(
        (sum, o) => sum + o.used_person_days,
        0,
    );
    const criticalOrders = orders.filter((o) => o.needs_reorder_alert);

    return (
        <div className="flex h-full flex-1 flex-col p-3 sm:p-4 md:p-6 bg-gov-canvas text-gov-text font-sans">
            <Head title={`${t("nav.purchasingOrders")} - HourRadar`} />

            {/* Header */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-semibold text-xl sm:text-2xl tracking-tight text-gov-text">
                                {t("purchasing.poTableTitle")}
                            </h1>
                            <span className="rounded-sm border border-gov-border bg-gov-surface px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-muted">
                                {t("purchasing.cockpitBadge")}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("purchasing.poTableSubtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-sm border border-gov-border bg-gov-surface px-3 py-1 font-mono text-xs text-gov-muted tabular-nums">
                            {orders.length} {t("common.order")}
                        </span>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gov-muted" />
                        <input
                            type="text"
                            placeholder={t("common.search")}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                orderPagination.setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-gov-border bg-gov-surface pl-9 pr-3 py-1.5 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-accent focus:outline-none focus:ring-1 focus:ring-gov-accent"
                        />
                    </div>

                    <div className="flex flex-wrap w-full sm:w-auto items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={() => {
                                setStatusFilter("all");
                                orderPagination.setCurrentPage(1);
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                statusFilter === "all"
                                    ? "bg-gov-surface-hover text-gov-text border border-gov-border"
                                    : "text-gov-muted hover:text-gov-text"
                            }`}
                        >
                            All ({orders.length})
                        </button>
                        <button
                            onClick={() => {
                                setStatusFilter("alert");
                                orderPagination.setCurrentPage(1);
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                statusFilter === "alert"
                                    ? "bg-gov-warning-bg text-gov-warning-text border border-gov-warning-border"
                                    : "text-gov-muted hover:text-gov-text"
                            }`}
                        >
                            Re-Order Alert ({criticalOrders.length})
                        </button>
                        <button
                            onClick={() => {
                                setStatusFilter("nominal");
                                orderPagination.setCurrentPage(1);
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                statusFilter === "nominal"
                                    ? "bg-gov-success-bg text-gov-success-text border border-gov-success-border"
                                    : "text-gov-muted hover:text-gov-text"
                            }`}
                        >
                            Nominal ({orders.length - criticalOrders.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Critical Alert Banner if filtered orders have alerts */}
            {statusFilter !== "nominal" && criticalOrders.length > 0 && (
                <div className="mt-5 rounded-lg border border-gov-warning-border bg-gov-warning-bg p-4 shadow-xs">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-gov-warning-text mt-0.5" />
                        <div>
                            <h2 className="font-semibold text-xs text-gov-warning-text uppercase tracking-wider">
                                Procurement Lead Time Horizon Triggered
                            </h2>
                            <p className="mt-1 text-xs text-gov-warning-text leading-relaxed">
                                {criticalOrders.length} framework order(s)
                                require renewal within the statutory 28-day
                                notice period to avoid project suspension.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-gov-border bg-gov-surface shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-gov-border bg-gov-surface-hover text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                            <tr>
                                <th className="h-9 px-3 sm:px-4 whitespace-nowrap">{isGerman ? "Bestellcode" : "Order Code"}</th>
                                <th className="h-9 px-3 sm:px-4">{isGerman ? "Projekt & Dienstleister" : "Project & Vendor"}</th>
                                <th className="h-9 px-3 sm:px-4 text-right whitespace-nowrap">
                                    {isGerman ? "Budget (PT)" : "Budget (PD)"}
                                </th>
                                <th className="h-9 px-3 sm:px-4 text-right whitespace-nowrap">
                                    {isGerman ? "Brennrate" : "Burn Rate"}
                                </th>
                                <th className="h-9 px-3 sm:px-4 whitespace-nowrap">{isGerman ? "Prognose Ende" : "Forecast End"}</th>
                                <th className="h-9 px-3 sm:px-4 text-center whitespace-nowrap">
                                    {isGerman ? "Status" : "Status"}
                                </th>
                                <th className="h-9 px-3 sm:px-4 text-center whitespace-nowrap">
                                    {isGerman ? "Aktion" : "Action"}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gov-border">
                            {orderPagination.paginatedItems.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="h-24 text-center text-gov-muted text-xs"
                                    >
                                        {isGerman
                                            ? "Keine Rahmenbestellungen entsprechen den Such- oder Filterkriterien."
                                            : "No purchase orders match the search or filter criteria."}
                                    </td>
                                </tr>
                            ) : (
                                orderPagination.paginatedItems.map((o) => (
                                    <tr
                                        key={o.id}
                                        className="transition-colors hover:bg-gov-surface-hover cursor-pointer"
                                        onClick={() => setSelectedOrder(o)}
                                    >
                                        <td className="h-12 px-3 sm:px-4 font-mono font-medium text-gov-text tabular-nums whitespace-nowrap">
                                            {o.order_number}
                                        </td>
                                        <td className="h-12 px-3 sm:px-4">
                                            <div className="font-medium text-gov-text">
                                                {o.title}
                                            </div>
                                            <div className="text-[11px] text-gov-muted">
                                                {o.supplier_name}
                                            </div>
                                        </td>
                                        <td className="h-12 px-3 sm:px-4 text-right tabular-nums whitespace-nowrap">
                                            <div className="font-mono font-medium text-gov-text">
                                                {o.used_person_days.toFixed(1)} / {o.total_person_days.toFixed(1)} {t("common.pd")}
                                            </div>
                                            <div className="text-[11px] text-gov-muted font-mono">
                                                {o.remaining_person_days.toFixed(1)} {isGerman ? "PT verfügbar" : "PD available"}
                                            </div>
                                        </td>
                                        <td className="h-12 px-3 sm:px-4 text-right font-mono text-gov-muted tabular-nums whitespace-nowrap">
                                            {o.average_weekly_burn_pd.toFixed(2)} {isGerman ? "PT/Woche" : "PD/wk"}
                                        </td>
                                        <td className="h-12 px-3 sm:px-4 font-mono text-gov-text tabular-nums whitespace-nowrap">
                                            {o.forecasted_end_date}
                                        </td>
                                        <td className="h-12 px-3 sm:px-4 text-center whitespace-nowrap">
                                            <span
                                                className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                                    o.needs_reorder_alert
                                                        ? "border-gov-warning-border bg-gov-warning-bg text-gov-warning-text"
                                                        : "border-gov-success-border bg-gov-success-bg text-gov-success-text"
                                                }`}
                                            >
                                                {o.needs_reorder_alert
                                                    ? `${isGerman ? "Nachbestellung" : "Re-Order"} (${o.days_until_reorder_deadline}d)`
                                                    : (isGerman ? "Reichweite nominal" : "Runway Nominal")}
                                            </span>
                                        </td>
                                        <td className="h-12 px-3 sm:px-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(o);
                                                }}
                                                className="rounded-md border border-gov-border bg-gov-surface px-2.5 py-1 text-[11px] font-medium text-gov-text hover:bg-gov-surface-hover hover:border-gov-interactive hover:text-gov-interactive transition-colors cursor-pointer"
                                            >
                                                {isGerman ? "Prüfen" : "Inspect"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={orderPagination.currentPage}
                    totalItems={orderPagination.totalItems}
                    pageSize={orderPagination.pageSize}
                    onPageChange={orderPagination.setCurrentPage}
                    onPageSizeChange={orderPagination.setPageSize}
                    pageSizeOptions={[8, 15, 25]}
                    itemLabel="purchase orders"
                />
            </div>

            {/* Purchase Order Specification Modal */}
            <Dialog
                open={!!selectedOrder}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
            >
                <DialogContent className="p-4 sm:p-6 sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader className="pr-8 sm:pr-12">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gov-accent" />
                                <DialogTitle className="text-base font-semibold text-gov-text">
                                    {isGerman ? "Rahmenspezifikation & Burndown:" : "Framework Specification & Burndown:"}{" "}
                                    {selectedOrder?.order_number}
                                </DialogTitle>
                            </div>
                            <span
                                className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                    selectedOrder?.needs_reorder_alert
                                        ? "border-gov-warning-border bg-gov-warning-bg text-gov-warning-text"
                                        : "border-gov-success-border bg-gov-success-bg text-gov-success-text"
                                }`}
                            >
                                {selectedOrder?.needs_reorder_alert
                                    ? (isGerman ? "Nachbestellung erforderlich" : "Re-Order Required")
                                    : (isGerman ? "Aktive Reichweite" : "Active Runway")}
                            </span>
                        </div>
                        <DialogDescription className="text-xs text-gov-muted">
                            {selectedOrder?.title} · {isGerman ? "Dienstleistungspartner:" : "Vendor Partner:"}{" "}
                            {selectedOrder?.supplier_name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4 pt-2">
                            {/* Predictive Burndown Chart */}
                            <OrderBurndownChart
                                totalPersonDays={
                                    selectedOrder.total_person_days
                                }
                                usedPersonDays={selectedOrder.used_person_days}
                                remainingPersonDays={
                                    selectedOrder.remaining_person_days
                                }
                                weeklyBurnRate={
                                    selectedOrder.average_weekly_burn_pd
                                }
                                forecastedEndDate={
                                    selectedOrder.forecasted_end_date
                                }
                                targetEndDate={selectedOrder.target_end_date}
                                needsReorderAlert={
                                    selectedOrder.needs_reorder_alert
                                }
                                daysUntilReorder={
                                    selectedOrder.days_until_reorder_deadline
                                }
                                reorderDeadlineDate={
                                    selectedOrder.reorder_deadline_date
                                }
                                series={selectedOrder.burndown_series}
                            />

                            {/* Key Parameters Matrix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 space-y-1.5 font-mono">
                                    <div className="text-[10px] uppercase font-semibold text-gov-muted">
                                        {isGerman ? "Vertragsparameter" : "Contract Parameters"}
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? "Dienstleister:" : "Supplier / Vendor:"}
                                        </span>
                                        <span className="font-medium">
                                            {selectedOrder.supplier_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? "Vertragsende Ziel:" : "Target Completion:"}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {selectedOrder.target_end_date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? "Zugewiesene Berater:" : "Assigned Consultants:"}
                                        </span>
                                        <span className="font-medium">
                                            {selectedOrder.consultants_count}{" "}
                                            {isGerman ? "Mitarbeiter" : "Staff"}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 space-y-1.5 font-mono">
                                    <div className="text-[10px] uppercase font-semibold text-gov-muted">
                                        {isGerman ? "Beschaffungstelemetrie" : "Procurement Telemetry"}
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? "Prognostizierte Erschöpfung:" : "Forecasted Exhaustion:"}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {selectedOrder.forecasted_end_date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? "Abwesenheitspuffer:" : "Absence Buffer:"}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {
                                                selectedOrder.vacation_days_affecting_runway
                                            }{" "}
                                            {isGerman ? "Tage" : "days"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">
                                            {isGerman ? "Vorlauffrist-Fenster:" : "Statutory Lead Time:"}
                                        </span>
                                        <span className="font-medium text-gov-warning-text tabular-nums">
                                            {isGerman ? "28 Kalendertage" : "28 Calendar Days"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-md border border-gov-border bg-gov-surface px-4 py-2 text-xs font-medium text-gov-text hover:bg-gov-surface-hover cursor-pointer"
                                >
                                    {isGerman ? "Prüfung schließen" : "Close Inspection"}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ChatbotDrawer />
        </div>
    );
}
