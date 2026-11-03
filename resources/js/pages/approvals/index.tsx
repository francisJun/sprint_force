import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ChatbotDrawer } from "@/components/hourradar/ChatbotDrawer";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { CheckCircle2, FileText, Search, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

interface PendingBookingItem {
    id: number;
    consultant_name: string;
    order_number: string;
    order_title: string;
    date: string;
    hours: number;
    description: string;
}

interface PurchaseOrderItem {
    id: number;
    order_number: string;
    title: string;
}

interface Props {
    user: { name: string; role: string };
    pendingBookings: PendingBookingItem[];
    orders: PurchaseOrderItem[];
}

export default function ApprovalsIndex({
    user,
    pendingBookings,
    orders,
}: Props) {
    const { t, isGerman } = useTranslation();
    const [search, setSearch] = useState("");
    const [selectedBooking, setSelectedBooking] =
        useState<PendingBookingItem | null>(null);
    const [rejectingBooking, setRejectingBooking] =
        useState<PendingBookingItem | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const filteredBookings = pendingBookings.filter((b) => {
        return (
            b.consultant_name.toLowerCase().includes(search.toLowerCase()) ||
            b.order_number.toLowerCase().includes(search.toLowerCase()) ||
            b.order_title.toLowerCase().includes(search.toLowerCase()) ||
            b.description.toLowerCase().includes(search.toLowerCase())
        );
    });

    const bookingPagination = usePagination(filteredBookings, 10);

    const handleApprove = (bookingId: number) => {
        router.post(
            `/bookings/${bookingId}/approve`,
            {},
            { preserveScroll: true },
        );
    };

    const handleRejectConfirm = () => {
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

    return (
        <div className="flex h-full flex-1 flex-col p-4 md:p-6 bg-gov-canvas text-gov-text font-sans">
            <Head title={`${t("nav.approvals")} - HourRadar`} />

            {/* Header */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="font-semibold text-2xl tracking-tight text-gov-text">
                            {t("lead.pendingTitle")}
                        </h1>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("lead.pendingSubtitle")}
                        </p>
                    </div>

                    <span className="rounded-sm border border-gov-border bg-gov-surface px-3 py-1.5 text-xs font-mono font-medium text-gov-text tabular-nums">
                        {pendingBookings.length} {t("common.pending")}
                    </span>
                </div>

                {/* Search Bar */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gov-muted" />
                        <input
                            type="text"
                            placeholder={t("common.search")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full rounded-lg border border-gov-border bg-gov-surface pl-9 pr-3 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-interactive focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Approvals Table */}
            <div className="mt-6 space-y-4">
                <div className="overflow-hidden rounded-lg border border-gov-border bg-gov-surface shadow-xs">
                    {bookingPagination.paginatedItems.length === 0 ? (
                        <div className="p-16 text-center text-xs text-gov-muted space-y-2">
                            <CheckCircle2 className="mx-auto h-8 w-8 text-gov-success-text opacity-70" />
                            <p className="font-medium text-gov-text">
                                {isGerman ? 'Alle Leistungsnachweise abgestimmt' : 'All Timesheet Submissions Reconciled'}
                            </p>
                            <p className="text-gov-muted max-w-sm mx-auto">
                                {isGerman
                                    ? 'Derzeit warten keine Berater-Leistungsnachweise auf Prüfung. Alle Stunden wurden freigegeben.'
                                    : 'No consultant timesheets are currently awaiting review. All hours have been signed off.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gov-border bg-gov-surface-hover text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                                    <tr>
                                        <th className="h-9 px-4">{t("lead.thConsultant")}</th>
                                        <th className="h-9 px-4">{t("consultant.thOrder")}</th>
                                        <th className="h-9 px-4">{t("consultant.thDate")}</th>
                                        <th className="h-9 px-4 text-right">
                                            {t("consultant.thHours")}
                                        </th>
                                        <th className="h-9 px-4 text-right">
                                            {t("consultant.thPd")}
                                        </th>
                                        <th className="h-9 px-4">
                                            {t("consultant.thProof")}
                                        </th>
                                        <th className="h-9 px-4 text-right">
                                            {t("common.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gov-border">
                                    {bookingPagination.paginatedItems.map(
                                        (b) => (
                                            <tr
                                                key={b.id}
                                                className="transition-colors hover:bg-gov-surface-hover"
                                            >
                                                <td className="h-11 px-4 font-medium text-gov-text">
                                                    {b.consultant_name}
                                                </td>
                                                <td className="h-11 px-4 text-gov-text">
                                                    <div className="font-mono tabular-nums">
                                                        {b.order_number}
                                                    </div>
                                                    <div className="text-[10px] text-gov-muted truncate max-w-35">
                                                        {b.order_title}
                                                    </div>
                                                </td>
                                                <td className="h-11 px-4 font-mono tabular-nums text-gov-muted whitespace-nowrap">
                                                    {b.date}
                                                </td>
                                                <td className="h-11 px-4 text-right font-mono font-semibold text-gov-text tabular-nums">
                                                    {b.hours.toFixed(2)}h
                                                </td>
                                                <td className="h-11 px-4 text-right font-mono text-gov-muted tabular-nums">
                                                    {(b.hours / 8).toFixed(2)}{" "}
                                                    PD
                                                </td>
                                                <td
                                                    className="h-11 px-4 max-w-sm text-gov-muted truncate cursor-pointer hover:text-gov-interactive"
                                                    onClick={() =>
                                                        setSelectedBooking(b)
                                                    }
                                                    title="Click to view full deliverable details"
                                                >
                                                    <span className="underline decoration-dotted underline-offset-2">
                                                        {b.description}
                                                    </span>
                                                </td>
                                                <td className="h-11 px-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    b.id,
                                                                )
                                                            }
                                                            className="h-8 rounded-lg bg-gov-interactive px-3.5 text-xs font-medium text-white hover:bg-gov-interactive-hover transition-colors cursor-pointer"
                                                        >
                                                            {t("lead.approve")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRejectingBooking(
                                                                    b,
                                                                );
                                                                setRejectionReason(
                                                                    "",
                                                                );
                                                            }}
                                                            className="h-8 rounded-lg border border-gov-border bg-gov-surface px-3 text-xs font-medium text-gov-critical-text hover:bg-gov-critical-bg transition-colors cursor-pointer"
                                                        >
                                                            {t("lead.reject")}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Pagination
                        currentPage={bookingPagination.currentPage}
                        totalItems={bookingPagination.totalItems}
                        pageSize={bookingPagination.pageSize}
                        onPageChange={bookingPagination.setCurrentPage}
                        onPageSizeChange={bookingPagination.setPageSize}
                        pageSizeOptions={[10, 25, 50]}
                        itemLabel="submissions"
                    />
                </div>
            </div>

            {/* Rejection Modal Dialog */}
            <Dialog
                open={!!rejectingBooking}
                onOpenChange={(open) => !open && setRejectingBooking(null)}
            >
                <DialogContent className="max-w-md bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-gov-critical-text flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            {isGerman ? 'Leistungsnachweis ablehnen' : 'Reject Timesheet Submission'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {isGerman
                                ? 'Geben Sie eine sachliche Begründung für die Rückweisung an den Berater an.'
                                : 'Provide an audit rationale for returning this timesheet to the consultant.'}
                        </DialogDescription>
                    </DialogHeader>

                    {rejectingBooking && (
                        <div className="space-y-4 text-xs">
                            <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 font-mono space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Berater:' : 'Consultant:'}
                                    </span>
                                    <span className="font-semibold text-gov-text">
                                        {rejectingBooking.consultant_name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Erfassungsdatum:' : 'Logged Date:'}
                                    </span>
                                    <span className="font-medium text-gov-text">
                                        {rejectingBooking.date}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Erfasste Dauer:' : 'Claimed Duration:'}
                                    </span>
                                    <span className="font-semibold text-gov-text">
                                        {rejectingBooking.hours.toFixed(2)}h (
                                        {(rejectingBooking.hours / 8).toFixed(
                                            2,
                                        )}{" "}
                                        {t("common.pd")})
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-medium text-xs text-gov-text">
                                    {isGerman ? 'Ablehnungsbegründung (erforderlich)' : 'Rejection Rationale (Required)'}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={isGerman
                                        ? 'Begründung angeben (z. B. Teilleistung unvollständig, Stunden fehlerhaft zugeordnet)...'
                                        : 'Specify reason (e.g. deliverable incomplete, hours incorrectly allocated)...'}
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gov-border bg-gov-surface p-2.5 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-critical-text focus:outline-none"
                                />

                                {/* Quick selection tags */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {[
                                        { en: "Deliverable incomplete", de: "Liefergegenstand unvollständig" },
                                        { en: "Hours misallocated", de: "Stunden fehlerhaft zugeordnet" },
                                        { en: "Requires task details", de: "Erfordert detailliertere Aufgabenbeschreibung" },
                                        { en: "Exceeds milestone scope", de: "Überschreitet Meilensteinumfang" },
                                    ].map((tagObj) => (
                                        <button
                                            key={tagObj.en}
                                            type="button"
                                            onClick={() =>
                                                setRejectionReason(isGerman ? tagObj.de : tagObj.en)
                                            }
                                            className="rounded-xs border border-gov-border bg-gov-canvas px-2 py-0.5 text-[10px] text-gov-muted hover:text-gov-text cursor-pointer"
                                        >
                                            + {isGerman ? tagObj.de : tagObj.en}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gov-border">
                                <button
                                    type="button"
                                    onClick={() => setRejectingBooking(null)}
                                    className="h-8 rounded-lg border border-gov-border bg-gov-surface px-3 text-xs font-medium text-gov-muted hover:text-gov-text cursor-pointer"
                                >
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="button"
                                    disabled={!rejectionReason.trim()}
                                    onClick={handleRejectConfirm}
                                    className="h-8 rounded-lg bg-gov-critical-text px-4 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isGerman ? 'Ablehnung bestätigen' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Timesheet Deliverable Details Modal */}
            <Dialog
                open={!!selectedBooking}
                onOpenChange={(open) => !open && setSelectedBooking(null)}
            >
                <DialogContent className="max-w-md bg-gov-surface border-gov-border text-gov-text">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-gov-text flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gov-interactive" />
                            {isGerman ? 'Leistungsnachweis-Spezifikation' : 'Proof of Work Deliverable Specification'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {isGerman
                                ? 'Eingereichte Dokumentation geprüft gegen vertragliche Abnahmekriterien.'
                                : 'Submitted documentation verified against client acceptance criteria.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-4 text-xs">
                            <div className="rounded-lg border border-gov-border bg-gov-canvas p-3.5 space-y-2 font-mono">
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Berater:' : 'Consultant:'}
                                    </span>
                                    <span className="font-semibold text-gov-text">
                                        {selectedBooking.consultant_name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Bestellposition:' : 'Order Line:'}
                                    </span>
                                    <span className="font-medium text-gov-text">
                                        {selectedBooking.order_number} (
                                        {selectedBooking.order_title})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Erfassungsdatum:' : 'Recorded Date:'}
                                    </span>
                                    <span className="font-medium text-gov-text">
                                        {selectedBooking.date}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gov-muted">
                                        {isGerman ? 'Dauer:' : 'Duration:'}
                                    </span>
                                    <span className="font-semibold text-gov-text">
                                        {selectedBooking.hours.toFixed(2)}h (
                                        {(selectedBooking.hours / 8).toFixed(2)}{" "}
                                        {t("common.pd")})
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gov-muted block">
                                    {isGerman ? 'Tätigkeitsbeschreibung' : 'Deliverable Description'}
                                </span>
                                <div className="rounded-lg border border-gov-border bg-gov-surface p-3 text-xs leading-relaxed text-gov-text">
                                    {selectedBooking.description}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gov-border">
                                <button
                                    type="button"
                                    onClick={() => setSelectedBooking(null)}
                                    className="h-8 rounded-lg border border-gov-border bg-gov-surface px-3.5 text-xs font-medium text-gov-text hover:bg-gov-surface-hover cursor-pointer"
                                >
                                    {t("common.close")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleApprove(selectedBooking.id);
                                        setSelectedBooking(null);
                                    }}
                                    className="h-8 rounded-lg bg-gov-interactive px-4 text-xs font-medium text-white hover:bg-gov-interactive-hover cursor-pointer"
                                >
                                    {isGerman ? 'Leistungsnachweis genehmigen' : 'Approve Proof of Work'}
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
