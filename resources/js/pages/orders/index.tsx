import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChatbotDrawer } from '@/components/hourradar/ChatbotDrawer';
import { Pagination, usePagination } from '@/components/ui/pagination';
import {
    Activity,
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Layers,
    Search,
    Users,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { OrderBurndownChart, BurndownPoint } from '@/components/hourradar/OrderBurndownChart';
import { useTranslation } from '@/lib/i18n';

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
    status_traffic_light: 'green' | 'yellow' | 'red';
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

export default function OrdersIndex({ user, orders }: Props) {
    const { t, isGerman } = useTranslation();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'alert' | 'nominal'>('all');
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderItem | null>(null);

    const filteredOrders = orders.filter((o) => {
        const matchesSearch =
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            o.title.toLowerCase().includes(search.toLowerCase()) ||
            o.supplier_name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'alert'
                ? o.needs_reorder_alert
                : !o.needs_reorder_alert;

        return matchesSearch && matchesStatus;
    });

    const orderPagination = usePagination(filteredOrders, 6);

    return (
        <div className="flex h-full flex-1 flex-col p-4 md:p-6 bg-gov-canvas text-gov-text font-sans">
            <Head title="Order Runway & Depletion Schedule - HourRadar" />

            {/* Header */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="font-semibold text-2xl tracking-tight text-gov-text">
                            {t("nav.orders")}
                        </h1>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("lead.ordersSubtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gov-muted tabular-nums">
                            {orders.length} {t("common.order")}
                        </span>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gov-muted" />
                        <input
                            type="text"
                            placeholder={t("common.search")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full rounded-lg border border-gov-border bg-gov-surface pl-9 pr-3 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-interactive focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
                        <span className="text-[11px] text-gov-muted mr-1">{t("common.status")}:</span>
                        {(['all', 'alert', 'nominal'] as const).map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setStatusFilter(filter)}
                                className={`h-8 rounded-md px-3 text-xs font-medium capitalize transition-colors cursor-pointer ${
                                    statusFilter === filter
                                        ? 'bg-gov-interactive text-white shadow-xs'
                                        : 'border border-gov-border bg-gov-surface text-gov-muted hover:text-gov-text'
                                }`}
                            >
                                {filter === 'all'
                                    ? t("common.all")
                                    : filter === 'alert'
                                      ? t("burndown.reorderWindow")
                                      : t("common.nominal")}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="mt-6 space-y-6">
                {orderPagination.paginatedItems.length === 0 ? (
                    <div className="rounded-lg border border-gov-border bg-gov-surface p-12 text-center text-xs text-gov-muted">
                        {isGerman
                            ? 'Keine Rahmenbestellungen entsprechen den Filterkriterien.'
                            : 'No purchase orders matching the filter criteria.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {orderPagination.paginatedItems.map((order) => {
                            const percentUsed = Math.min(
                                100,
                                Math.round((order.used_person_days / (order.total_person_days || 1)) * 100)
                            );

                            return (
                                <div
                                    key={order.id}
                                    className={`rounded-lg border bg-gov-surface p-6 shadow-xs transition-shadow hover:shadow-md cursor-pointer ${
                                        order.needs_reorder_alert ? 'border-gov-warning-border' : 'border-gov-border'
                                    }`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-mono text-xs text-gov-muted tabular-nums">
                                                {order.order_number}
                                            </span>
                                            <h2 className="mt-1 font-semibold text-base text-gov-text">
                                                {order.title}
                                            </h2>
                                            <p className="mt-0.5 text-xs text-gov-muted">
                                                {isGerman ? 'Dienstleister' : 'Vendor'}: {order.supplier_name} · {order.consultants_count} {isGerman ? 'Berater' : 'Consultants'}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-sm px-2.5 py-0.5 text-[10px] font-semibold uppercase border ${
                                                order.needs_reorder_alert
                                                    ? 'border-gov-warning-border bg-gov-warning-bg text-gov-warning-text'
                                                    : 'border-gov-success-border bg-gov-success-bg text-gov-success-text'
                                            }`}
                                        >
                                            {order.needs_reorder_alert
                                                ? (isGerman ? 'Nachbestell-Warnung' : 'Re-Order Alert')
                                                : (isGerman ? 'Normale Reichweite' : 'Nominal Runway')}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-5 space-y-2">
                                        <div className="flex items-center justify-between font-mono text-xs text-gov-muted tabular-nums">
                                            <span>
                                                {isGerman ? 'Verbraucht:' : 'Consumed:'} <strong className="text-gov-text font-semibold">{order.used_person_days.toFixed(2)} {t("common.pd")}</strong> ({percentUsed}%)
                                            </span>
                                            <span>
                                                {isGerman ? 'Budget:' : 'Budget:'} <strong className="text-gov-text font-semibold">{order.total_person_days.toFixed(2)} {t("common.pd")}</strong>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gov-canvas">
                                            <div
                                                className={`h-full transition-all duration-500 rounded-full ${
                                                    percentUsed >= 85
                                                        ? 'bg-gov-critical-text'
                                                        : percentUsed >= 65
                                                        ? 'bg-gov-warning-text'
                                                        : 'bg-gov-interactive'
                                                }`}
                                                style={{ width: `${percentUsed}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-gov-border bg-gov-canvas p-3.5 text-xs font-mono">
                                        <div>
                                            <span className="text-[10px] text-gov-muted uppercase block">
                                                {isGerman ? 'Restkontingent' : 'Remaining Capital'}
                                            </span>
                                            <span className="font-semibold text-gov-text tabular-nums text-sm">
                                                {order.remaining_person_days.toFixed(2)} {t("common.pd")}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gov-muted uppercase block">
                                                {isGerman ? 'Wöchentliche Brennrate' : 'Weekly Burn Velocity'}
                                            </span>
                                            <span className="font-semibold text-gov-text tabular-nums text-sm">
                                                {order.average_weekly_burn_pd.toFixed(1)} {isGerman ? 'PT/Woche' : 'PD/wk'}
                                            </span>
                                        </div>
                                        <div className="border-t border-gov-border pt-2">
                                            <span className="text-[10px] text-gov-muted uppercase block">
                                                {isGerman ? 'Prognostizierte Erschöpfung' : 'Forecasted Exhaustion'}
                                            </span>
                                            <span className="font-semibold text-gov-text tabular-nums">
                                                {order.forecasted_end_date}
                                            </span>
                                        </div>
                                        <div className="border-t border-gov-border pt-2">
                                            <span className="text-[10px] text-gov-muted uppercase block">
                                                {isGerman ? 'Vertragsende Ziel' : 'Target Contract End'}
                                            </span>
                                            <span className="font-semibold text-gov-text tabular-nums">
                                                {order.target_end_date}
                                            </span>
                                        </div>
                                    </div>

                                    {order.vacation_days_affecting_runway > 0 && (
                                        <p className="mt-3 text-[11px] text-gov-muted font-medium">
                                            {isGerman
                                                ? `Enthält ${order.vacation_days_affecting_runway} Berater-Abwesenheitstage, die das Reichweitenende nach hinten verschieben.`
                                                : `Includes ${order.vacation_days_affecting_runway} consultant absence days adjusting exhaustion forward.`}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="rounded-lg border border-gov-border overflow-hidden">
                    <Pagination
                        currentPage={orderPagination.currentPage}
                        totalItems={orderPagination.totalItems}
                        pageSize={orderPagination.pageSize}
                        onPageChange={orderPagination.setCurrentPage}
                        onPageSizeChange={orderPagination.setPageSize}
                        pageSizeOptions={[6, 12, 24]}
                        itemLabel="orders"
                    />
                </div>
            </div>

            {/* Order Detail Modal with Burndown Trajectory */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader className="pr-12">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gov-interactive" />
                                <DialogTitle className="text-base font-semibold text-gov-text">
                                    {isGerman ? 'Auftragsreichweite & Burndown:' : 'Order Specification & Runway:'} {selectedOrder?.order_number}
                                </DialogTitle>
                            </span>
                            <span
                                className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                    selectedOrder?.needs_reorder_alert
                                        ? 'border-gov-warning-border bg-gov-warning-bg text-gov-warning-text'
                                        : 'border-gov-success-border bg-gov-success-bg text-gov-success-text'
                                }`}
                            >
                                {selectedOrder?.needs_reorder_alert
                                    ? (isGerman ? 'Nachbestellung erforderlich' : 'Re-Order Required')
                                    : (isGerman ? 'Aktive Reichweite' : 'Active Runway')}
                            </span>
                        </div>
                        <DialogDescription className="text-xs text-gov-muted">
                            {selectedOrder?.title} · {isGerman ? 'Dienstleister:' : 'Vendor:'} {selectedOrder?.supplier_name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4 pt-2">
                            {/* Predictive Burndown Chart */}
                            <OrderBurndownChart
                                totalPersonDays={selectedOrder.total_person_days}
                                usedPersonDays={selectedOrder.used_person_days}
                                remainingPersonDays={selectedOrder.remaining_person_days}
                                weeklyBurnRate={selectedOrder.average_weekly_burn_pd}
                                forecastedEndDate={selectedOrder.forecasted_end_date}
                                targetEndDate={selectedOrder.target_end_date}
                                needsReorderAlert={selectedOrder.needs_reorder_alert}
                                daysUntilReorder={selectedOrder.days_until_reorder_deadline}
                                reorderDeadlineDate={selectedOrder.reorder_deadline_date}
                                series={selectedOrder.burndown_series}
                            />

                            {/* Additional Parameters Matrix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 space-y-1.5 font-mono">
                                    <div className="text-[10px] uppercase font-semibold text-gov-muted">
                                        {isGerman ? 'Lieferrahmen' : 'Delivery Framework'}
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">{isGerman ? 'Dienstleistungspartner:' : 'Vendor Partner:'}</span>
                                        <span className="font-medium">{selectedOrder.supplier_name}</span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">{isGerman ? 'Vertragsende Ziel:' : 'Target Contract End:'}</span>
                                        <span className="font-semibold tabular-nums">{selectedOrder.target_end_date}</span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">{isGerman ? 'Zugewiesene Berater:' : 'Assigned Consultants:'}</span>
                                        <span className="font-medium">{selectedOrder.consultants_count} {isGerman ? 'Mitarbeiter' : 'Staff'}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 space-y-1.5 font-mono">
                                    <div className="text-[10px] uppercase font-semibold text-gov-muted">
                                        {isGerman ? 'Gesetzliche Abwesenheitsanpassungen' : 'Statutory Absence Adjustments'}
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">{isGerman ? 'Urlaubstage-Puffer:' : 'Vacation Days Buffer:'}</span>
                                        <span className="font-semibold tabular-nums">{selectedOrder.vacation_days_affecting_runway} {isGerman ? 'Tage' : 'days'}</span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">{isGerman ? 'Prognostizierte Erschöpfung:' : 'Forecasted Exhaustion:'}</span>
                                        <span className="font-semibold tabular-nums">{selectedOrder.forecasted_end_date}</span>
                                    </div>
                                    <div className="flex justify-between text-gov-text">
                                        <span className="text-gov-muted">{isGerman ? 'Vorlauffrist-Fenster:' : 'Lead Time Notice Window:'}</span>
                                        <span className="font-medium text-gov-warning-text tabular-nums">{isGerman ? '28 Kalendertage' : '28 Calendar Days'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrder(null)}
                                    className="h-8 rounded-lg border border-gov-border bg-gov-surface px-4 text-xs font-medium text-gov-text hover:bg-gov-surface-hover cursor-pointer"
                                >
                                    {isGerman ? 'Spezifikation schließen' : 'Close Specification'}
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

