import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChatbotDrawer } from '@/components/hourradar/ChatbotDrawer';
import { Pagination, usePagination } from '@/components/ui/pagination';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileCheck2,
    FileText,
    Layers,
    Scale,
    Search,
    Shield,
    Users,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

interface InvoiceItem {
    id: string;
    reference: string;
    vendor: string;
    order_number: string;
    order_title: string;
    claimed_pd: number;
    approved_pd: number;
    variance: string;
    status: 'Matched & Cleared' | 'Pending Audit' | 'Variance Discrepancy';
    date: string;
    line_items: Array<{
        consultant: string;
        period: string;
        approved_hours: number;
        person_days: number;
    }>;
}

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
    vacation_days_affecting_runway: number;
    consultants_count: number;
}

interface Props {
    user: { name: string; role: string };
    orders: PurchaseOrderItem[];
}

export default function PurchasingInvoicesIndex({ user, orders }: Props) {
    const { t, isGerman } = useTranslation();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'discrepancy'>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

    // Initial audited invoices
    const allInvoices: InvoiceItem[] = [
        {
            id: '1',
            reference: 'INV-2026-09-712',
            vendor: 'Acme Consulting GmbH',
            order_number: 'PO-4500012345',
            order_title: 'Core Platform Migration & Cloud Resiliency',
            claimed_pd: 20.0,
            approved_pd: 20.0,
            variance: '0.00%',
            status: 'Matched & Cleared',
            date: '2026-09-30',
            line_items: [
                {
                    consultant: 'Dev Consultant',
                    period: 'Sept 01 - Sept 15, 2026',
                    approved_hours: 80.0,
                    person_days: 10.0,
                },
                {
                    consultant: 'Dev Consultant',
                    period: 'Sept 16 - Sept 30, 2026',
                    approved_hours: 80.0,
                    person_days: 10.0,
                },
            ],
        },
        {
            id: '2',
            reference: 'INV-2026-10-881',
            vendor: 'Acme Consulting GmbH',
            order_number: 'PO-4500012345',
            order_title: 'Core Platform Migration & Cloud Resiliency',
            claimed_pd: 30.0,
            approved_pd: 30.0,
            variance: '0.00%',
            status: 'Matched & Cleared',
            date: '2026-10-31',
            line_items: [
                {
                    consultant: 'Dev Consultant',
                    period: 'Oct 01 - Oct 15, 2026',
                    approved_hours: 80.0,
                    person_days: 10.0,
                },
                {
                    consultant: 'Dev Consultant',
                    period: 'Oct 16 - Oct 31, 2026',
                    approved_hours: 160.0,
                    person_days: 20.0,
                },
            ],
        },
        {
            id: '3',
            reference: 'INV-2026-10-904',
            vendor: 'Global Dev Solutions SE',
            order_number: 'PO-4500012346',
            order_title: 'Enterprise API Gateway & IAM Integration',
            claimed_pd: 15.0,
            approved_pd: 15.0,
            variance: '0.00%',
            status: 'Matched & Cleared',
            date: '2026-10-31',
            line_items: [
                {
                    consultant: 'External Senior Engineer',
                    period: 'Oct 01 - Oct 31, 2026',
                    approved_hours: 120.0,
                    person_days: 15.0,
                },
            ],
        },
    ];

    const filteredInvoices = allInvoices.filter((inv) => {
        const matchesSearch =
            inv.reference.toLowerCase().includes(search.toLowerCase()) ||
            inv.vendor.toLowerCase().includes(search.toLowerCase()) ||
            inv.order_number.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'matched'
                ? inv.status === 'Matched & Cleared'
                : inv.status !== 'Matched & Cleared';

        return matchesSearch && matchesStatus;
    });

    const invoicePagination = usePagination(filteredInvoices, 5);

    const totalClaimed = allInvoices.reduce((sum, inv) => sum + inv.claimed_pd, 0);
    const totalApproved = allInvoices.reduce((sum, inv) => sum + inv.approved_pd, 0);

    return (
        <div className="flex h-full flex-1 flex-col p-3 sm:p-4 md:p-6 bg-gov-canvas text-gov-text font-sans">
            <Head title={`${t("nav.purchasingInvoices")} - HourRadar`} />

            {/* Header */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-semibold text-xl sm:text-2xl tracking-tight text-gov-text">
                                {t("purchasing.invoicesTableTitle")}
                            </h1>
                            <span className="rounded-sm border border-gov-border bg-gov-surface px-2 py-0.5 font-semibold text-[10px] uppercase text-gov-muted">
                                {t("purchasing.threeWayMatch")}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("purchasing.invoicesTableSubtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-2.5 py-1 text-xs font-semibold text-gov-success-text">
                            {t("purchasing.fullyMatched")}
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
                                invoicePagination.setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-gov-border bg-gov-surface pl-9 pr-3 py-1.5 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-accent focus:outline-none focus:ring-1 focus:ring-gov-accent"
                        />
                    </div>

                    <div className="flex flex-wrap w-full sm:w-auto items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                invoicePagination.setCurrentPage(1);
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                statusFilter === 'all'
                                    ? 'bg-gov-surface-hover text-gov-text border border-gov-border'
                                    : 'text-gov-muted hover:text-gov-text'
                            }`}
                        >
                            All ({allInvoices.length})
                        </button>
                        <button
                            onClick={() => {
                                setStatusFilter('matched');
                                invoicePagination.setCurrentPage(1);
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                statusFilter === 'matched'
                                    ? 'bg-gov-success-bg text-gov-success-text border border-gov-success-border'
                                    : 'text-gov-muted hover:text-gov-text'
                            }`}
                        >
                            {isGerman ? 'Abgeglichen & Freigegeben' : 'Matched & Cleared'} ({allInvoices.filter((i) => i.status === 'Matched & Cleared').length})
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Overview Strip */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {isGerman ? 'Gesamtes Rechnungsvolumen' : 'Total Invoiced Volume'}
                    </span>
                    <div className="mt-2 text-xl sm:text-2xl font-semibold text-gov-text font-mono tabular-nums">
                        {totalClaimed.toFixed(2)}{' '}
                        <span className="text-sm font-normal text-gov-muted">{t("common.pd")}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {isGerman
                            ? `Eingereicht über ${allInvoices.length} Rechnungen`
                            : `Submitted across ${allInvoices.length} invoices`}
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {isGerman ? 'Vom Auftraggeber geprüft & freigegeben' : 'Client Verified & Approved'}
                    </span>
                    <div className="mt-2 text-xl sm:text-2xl font-semibold text-gov-text font-mono tabular-nums">
                        {totalApproved.toFixed(2)}{' '}
                        <span className="text-sm font-normal text-gov-muted">{t("common.pd")}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {isGerman
                            ? 'Leistungsnachweise durch Projektleitung freigegeben'
                            : 'Timesheets signed off by Project Directors'}
                    </div>
                </div>

                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                        {isGerman ? 'Abweichungsquote' : 'Variance Discrepancy Rate'}
                    </span>
                    <div className="mt-2 text-xl sm:text-2xl font-semibold text-gov-success-text font-mono tabular-nums">
                        0.00%
                    </div>
                    <div className="mt-1 text-[11px] text-gov-muted">
                        {isGerman
                            ? 'Keine ungeprüften Abrechnungspositionen festgestellt'
                            : 'Zero unverified billing lines detected'}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-gov-border bg-gov-surface shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-gov-border bg-gov-surface-hover text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                            <tr>
                                <th className="h-9 px-3 sm:px-4 whitespace-nowrap">{isGerman ? 'Rechnungs-Referenz' : 'Invoice Reference'}</th>
                                <th className="h-9 px-3 sm:px-4 whitespace-nowrap">{isGerman ? 'Dienstleister' : 'Vendor'}</th>
                                <th className="h-9 px-3 sm:px-4 whitespace-nowrap">{isGerman ? 'Bestellung (PO)' : 'Purchase Order'}</th>
                                <th className="h-9 px-3 sm:px-4 whitespace-nowrap">{isGerman ? 'Rechnungsdatum' : 'Invoice Date'}</th>
                                <th className="h-9 px-3 sm:px-4 text-right whitespace-nowrap">{isGerman ? 'Berechnete PT' : 'Claimed PD'}</th>
                                <th className="h-9 px-3 sm:px-4 text-right whitespace-nowrap">{isGerman ? 'Freigegebene PT' : 'Approved Timesheets'}</th>
                                <th className="h-9 px-3 sm:px-4 text-right whitespace-nowrap">{isGerman ? 'Abweichung' : 'Variance'}</th>
                                <th className="h-9 px-3 sm:px-4 text-right whitespace-nowrap">{isGerman ? 'Abrechnungsstatus' : 'Settlement State'}</th>
                                <th className="h-9 px-3 sm:px-4 text-center whitespace-nowrap">{isGerman ? 'Prüfaktionen' : 'Audit Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gov-border">
                            {invoicePagination.paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="h-24 text-center text-gov-muted text-xs">
                                        {isGerman
                                            ? 'Keine Rechnungen entsprechen den Such- oder Filterkriterien.'
                                            : 'No invoices match the search or filter criteria.'}
                                    </td>
                                </tr>
                            ) : (
                                invoicePagination.paginatedItems.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        className="transition-colors hover:bg-gov-surface-hover cursor-pointer"
                                        onClick={() => setSelectedInvoice(inv)}
                                    >
                                        <td className="h-11 px-3 sm:px-4 font-mono font-medium text-gov-text tabular-nums whitespace-nowrap">
                                            {inv.reference}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 text-gov-text whitespace-nowrap">
                                            {inv.vendor}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 font-mono text-gov-muted whitespace-nowrap">
                                            {inv.order_number}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 font-mono text-gov-muted tabular-nums whitespace-nowrap">
                                            {inv.date}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 text-right font-mono text-gov-text tabular-nums font-medium whitespace-nowrap">
                                            {inv.claimed_pd.toFixed(2)} {t("common.pd")}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 text-right font-mono text-gov-text tabular-nums font-medium whitespace-nowrap">
                                            {inv.approved_pd.toFixed(2)} {t("common.pd")}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 text-right font-mono text-gov-success-text tabular-nums font-medium whitespace-nowrap">
                                            {inv.variance}
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 text-right whitespace-nowrap">
                                            <span className="rounded-sm border border-gov-success-border bg-gov-success-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-gov-success-text">
                                                {isGerman ? 'Abgeglichen & Freigegeben' : inv.status}
                                            </span>
                                        </td>
                                        <td className="h-11 px-3 sm:px-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInvoice(inv);
                                                }}
                                                className="rounded-md border border-gov-border bg-gov-surface px-2 py-1 text-[11px] font-medium text-gov-text hover:bg-gov-surface-hover cursor-pointer"
                                            >
                                                {isGerman ? '3-Wege-Abgleich prüfen' : 'Inspect 3-Way Match'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={invoicePagination.currentPage}
                    totalItems={invoicePagination.totalItems}
                    pageSize={invoicePagination.pageSize}
                    onPageChange={invoicePagination.setCurrentPage}
                    onPageSizeChange={invoicePagination.setPageSize}
                    pageSizeOptions={[5, 10, 25]}
                    itemLabel="invoices"
                />
            </div>

            {/* 3-Way Match Audit Verification Modal */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent className="p-4 sm:p-6 max-w-xl bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader className="pr-8 sm:pr-12">
                        <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-gov-accent" />
                            <DialogTitle className="text-base font-semibold text-gov-text">
                                {isGerman ? '3-Wege-Rechnungsabgleich:' : '3-Way Match Reconciliation:'} {selectedInvoice?.reference}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-gov-muted">
                            {isGerman
                                ? 'Prüfung von Bestellobligation (PO) vs. freigegebenen Leistungsnachweisen vs. Lieferantenabrechnung.'
                                : 'Verifying Purchase Order commitment vs. Client-Approved Timesheets vs. Vendor Billing.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-4 pt-2">
                            {/* Verification Status Banner */}
                            <div className="rounded-lg border border-gov-success-border bg-gov-success-bg p-3.5">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 text-gov-success-text shrink-0" />
                                    <div>
                                        <div className="text-xs font-semibold text-gov-success-text uppercase tracking-wider">
                                            {isGerman ? '3-Wege-Abgleich vollständig abgestimmt' : '3-Way Match Fully Reconciled'}
                                        </div>
                                        <p className="text-xs text-gov-success-text mt-0.5">
                                            {isGerman
                                                ? `Keine Abweichung festgestellt. Alle ${selectedInvoice.claimed_pd.toFixed(2)} berechneten Personentage stimmen exakt mit den freigegebenen Leistungsnachweisen überein.`
                                                : `Zero variance detected. All ${selectedInvoice.claimed_pd.toFixed(2)} invoiced person-days match signed proof-of-work records.`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 3 Pillars of the Match */}
                            <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2 text-xs">
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3">
                                    <span className="text-[10px] font-semibold uppercase text-gov-muted block">
                                        {isGerman ? '1. Bestellobligation' : '1. PO Commitment'}
                                    </span>
                                    <span className="mt-1 font-mono font-medium text-gov-text block">{selectedInvoice.order_number}</span>
                                    <span className="text-[10px] text-gov-muted truncate block">{selectedInvoice.order_title}</span>
                                </div>
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3">
                                    <span className="text-[10px] font-semibold uppercase text-gov-muted block">
                                        {isGerman ? '2. Berechnete Einheiten' : '2. Invoiced Units'}
                                    </span>
                                    <span className="mt-1 font-mono font-medium text-gov-text block">{selectedInvoice.claimed_pd.toFixed(2)} {t("common.pd")}</span>
                                    <span className="text-[10px] text-gov-muted block">
                                        {isGerman ? 'Rechnungsforderung' : 'Billing Claim'}
                                    </span>
                                </div>
                                <div className="rounded-lg border border-gov-border bg-gov-canvas p-3">
                                    <span className="text-[10px] font-semibold uppercase text-gov-muted block">
                                        {isGerman ? '3. Freigegebene Nachweise' : '3. Approved Timesheets'}
                                    </span>
                                    <span className="mt-1 font-mono font-medium text-gov-text block">{selectedInvoice.approved_pd.toFixed(2)} {t("common.pd")}</span>
                                    <span className="text-[10px] text-gov-success-text block font-medium">
                                        {isGerman ? 'Abweichung:' : 'Variance:'} {selectedInvoice.variance}
                                    </span>
                                </div>
                            </div>

                            {/* Line Items Breakdown */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-gov-text uppercase tracking-wider">
                                    {isGerman ? 'Abgestimmte Leistungsnachweis-Zeilen' : 'Reconciled Proof-of-Work Lines'}
                                </span>
                                <div className="rounded-lg border border-gov-border bg-gov-canvas divide-y divide-gov-border">
                                    {selectedInvoice.line_items.map((line, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 text-xs">
                                            <div>
                                                <div className="font-medium text-gov-text">{line.consultant}</div>
                                                <div className="text-[11px] text-gov-muted">{line.period}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-medium text-gov-text tabular-nums">
                                                    {line.person_days.toFixed(2)} {t("common.pd")}
                                                </div>
                                                <div className="text-[11px] text-gov-muted font-mono tabular-nums">
                                                    {line.approved_hours.toFixed(1)} {isGerman ? 'Std.' : 'hrs'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="font-mono text-[11px] text-gov-muted tabular-nums">
                                    {isGerman ? 'Geprüft am:' : 'Audited on:'} {selectedInvoice.date}
                                </span>
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="rounded-md border border-gov-border bg-gov-surface px-4 py-2 text-xs font-medium text-gov-text hover:bg-gov-surface-hover cursor-pointer"
                                >
                                    {isGerman ? 'Prüfung schließen' : 'Close Verification'}
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

