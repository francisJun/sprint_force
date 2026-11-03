import React from "react";
import { useForm } from "@inertiajs/react";
import { ChatbotDrawer } from "@/components/hourradar/ChatbotDrawer";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { useTranslation } from "@/lib/i18n";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Layers,
    Plus,
    Scale,
    Shield,
} from "lucide-react";

interface AssignedOrder {
    id: number;
    order_number: string;
    title: string;
    total_person_days: number;
    remaining_person_days: number;
    supplier_name: string;
}

interface TimeBookingItem {
    id: number;
    date: string;
    hours: number;
    description: string;
    status: "submitted" | "approved" | "rejected";
    rejection_reason?: string;
    order_number: string;
    order_title: string;
}

interface VacationItem {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
}

interface Props {
    user: { name: string; role: string };
    assignedOrders: AssignedOrder[];
    bookings: TimeBookingItem[];
    vacations: VacationItem[];
}

export default function ConsultantDashboard({
    user,
    assignedOrders,
    bookings,
    vacations,
}: Props) {
    const { t } = useTranslation();
    const today = new Date().toISOString().split("T")[0];

    // Pagination for bookings and absences
    const bookingPagination = usePagination(bookings, 10);
    const vacationPagination = usePagination(vacations, 5);

    // Time Booking form
    const bookingForm = useForm({
        purchase_order_id: assignedOrders[0]?.id || "",
        date: today,
        hours: "7.50",
        description: "",
    });

    // Absence / Vacation form
    const vacationForm = useForm({
        start_date: "",
        end_date: "",
    });

    const submitBooking = (e: React.FormEvent) => {
        e.preventDefault();
        bookingForm.post("/bookings", {
            preserveScroll: true,
            onSuccess: () => {
                bookingForm.reset("description");
            },
        });
    };

    const submitVacation = (e: React.FormEvent) => {
        e.preventDefault();
        vacationForm.post("/vacations", {
            preserveScroll: true,
            onSuccess: () => {
                vacationForm.reset();
            },
        });
    };

    const totalHoursLogged = bookings
        .filter((b) => b.status === "approved")
        .reduce((acc, curr) => acc + curr.hours, 0);

    return (
        <div className="w-full space-y-6 sm:space-y-8 bg-gov-canvas pb-16 font-sans">
            {/* Top Workspace Bar */}
            <div className="border-b border-gov-border pb-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-semibold text-xl sm:text-2xl tracking-tight text-gov-text">
                                {t("consultant.title")}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs text-gov-muted">
                            {t("common.consultant")}:{" "}
                            <span className="font-medium text-gov-text">
                                {user.name}
                            </span>{" "}
                            · {t("common.supplier")}:{" "}
                            <span className="font-medium text-gov-text">
                                {assignedOrders[0]?.supplier_name ||
                                    "Acme Consulting GmbH"}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-full sm:w-auto rounded-lg border border-gov-border bg-gov-surface px-3 py-2 text-left sm:text-right">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gov-muted">
                                {t("consultant.approvedWorkingTime")}
                            </span>
                            <div className="font-mono text-sm font-semibold text-gov-text tabular-nums">
                                {totalHoursLogged.toFixed(2)} {t("common.hrs")} (
                                {(totalHoursLogged / 8).toFixed(2)} {t("common.pd")})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
                {/* Left Column: Recording Inputs & Absence Management */}
                <div className="space-y-6 sm:space-y-8 lg:col-span-1">
                    {/* Time Recording Form */}
                    <div
                        id="booking-form"
                        className="rounded-lg border border-gov-border bg-gov-surface p-4 sm:p-6 shadow-xs"
                    >
                        <div className="flex items-center gap-2 border-b border-gov-border pb-3">
                            <Clock className="h-4 w-4 text-gov-interactive" />
                            <h2 className="font-semibold text-sm text-gov-text uppercase tracking-wider">
                                {t("consultant.quickLog")}
                            </h2>
                        </div>
                        <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                            {t("consultant.logDescription")}
                        </p>

                        <form
                            onSubmit={submitBooking}
                            className="mt-5 space-y-4 text-xs"
                        >
                            <div className="space-y-1.5">
                                <label className="block font-medium text-xs text-gov-text">
                                    {t("consultant.targetPO")}
                                </label>
                                <select
                                    value={bookingForm.data.purchase_order_id}
                                    onChange={(e) =>
                                        bookingForm.setData(
                                            "purchase_order_id",
                                            Number(e.target.value),
                                        )
                                    }
                                    className="h-9 w-full rounded-lg border border-gov-border bg-gov-surface px-3 text-xs text-gov-text focus:border-gov-interactive focus:outline-none"
                                >
                                    {assignedOrders.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.order_number} · {o.title} (
                                            {o.remaining_person_days} {t("common.pd")} {t("common.free")})
                                        </option>
                                    ))}
                                </select>
                                {bookingForm.errors.purchase_order_id && (
                                    <p className="text-[11px] text-gov-critical-text font-medium">
                                        {bookingForm.errors.purchase_order_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block font-medium text-xs text-gov-text">
                                        {t("consultant.bookingDate")}
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingForm.data.date}
                                        onChange={(e) =>
                                            bookingForm.setData(
                                                "date",
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-lg border border-gov-border bg-gov-surface px-3 font-mono text-xs text-gov-text focus:border-gov-interactive focus:outline-none tabular-nums"
                                    />
                                    {bookingForm.errors.date && (
                                        <p className="text-[11px] text-gov-critical-text font-medium">
                                            {bookingForm.errors.date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block font-medium text-xs text-gov-text">
                                            {t("consultant.hoursWorked")}
                                        </label>
                                        <span className="font-mono text-[10px] text-gov-muted tabular-nums">
                                            {(
                                                Number(
                                                    bookingForm.data.hours || 0,
                                                ) / 8
                                            ).toFixed(2)}{" "}
                                            {t("common.pd")}
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0.25"
                                        max="10.0"
                                        value={bookingForm.data.hours}
                                        onChange={(e) =>
                                            bookingForm.setData(
                                                "hours",
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-lg border border-gov-border bg-gov-surface px-3 font-mono text-xs text-gov-text focus:border-gov-interactive focus:outline-none tabular-nums"
                                    />
                                </div>
                            </div>

                            {/* Statutory Error Callout */}
                            {bookingForm.errors.hours && (
                                <div className="rounded-lg border border-gov-critical-border bg-gov-critical-bg p-3 text-xs text-gov-critical-text">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed font-medium">
                                            {bookingForm.errors.hours}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block font-medium text-xs text-gov-text">
                                    {t("consultant.proofDescription")}
                                </label>
                                <textarea
                                    rows={3}
                                    value={bookingForm.data.description}
                                    onChange={(e) =>
                                        bookingForm.setData(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    placeholder={t("consultant.descriptionPlaceholder")}
                                    className="w-full rounded-lg border border-gov-border bg-gov-surface p-3 text-xs text-gov-text placeholder:text-gov-muted focus:border-gov-interactive focus:outline-none"
                                />
                                {bookingForm.errors.description && (
                                    <p className="text-[11px] text-gov-critical-text font-medium">
                                        {bookingForm.errors.description}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={bookingForm.processing}
                                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gov-interactive font-medium text-xs text-white transition-colors hover:bg-gov-interactive-hover disabled:opacity-50 cursor-pointer"
                            >
                                {bookingForm.processing
                                    ? t("consultant.submitting")
                                    : t("consultant.submitProof")}
                            </button>
                        </form>
                    </div>

                    {/* Absence & Planned Leave Management */}
                    <div
                        id="vacation-manager"
                        className="rounded-lg border border-gov-border bg-gov-surface p-4 sm:p-6 shadow-xs"
                    >
                        <div className="flex items-center gap-2 border-b border-gov-border pb-3">
                            <Calendar className="h-4 w-4 text-gov-interactive" />
                            <h2 className="font-semibold text-sm text-gov-text uppercase tracking-wider">
                                {t("consultant.vacationPlanner")}
                            </h2>
                        </div>
                        <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                            {t("consultant.absenceDescription")}
                        </p>

                        <form
                            onSubmit={submitVacation}
                            className="mt-4 space-y-3 text-xs"
                        >
                            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[11px] text-gov-muted">
                                        {t("consultant.startDate")}
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={vacationForm.data.start_date}
                                        onChange={(e) =>
                                            vacationForm.setData(
                                                "start_date",
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 w-full rounded-lg border border-gov-border bg-gov-surface px-2.5 font-mono text-xs tabular-nums"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] text-gov-muted">
                                        {t("consultant.endDate")}
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={vacationForm.data.end_date}
                                        onChange={(e) =>
                                            vacationForm.setData(
                                                "end_date",
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 w-full rounded-lg border border-gov-border bg-gov-surface px-2.5 font-mono text-xs tabular-nums"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={vacationForm.processing}
                                className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-gov-border bg-gov-surface font-medium text-xs text-gov-text hover:bg-gov-surface-hover transition-colors cursor-pointer"
                            >
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                {t("consultant.blockPeriod")}
                            </button>
                        </form>

                        <div className="mt-4 space-y-2">
                            {vacationPagination.paginatedItems.map((v) => (
                                <div
                                    key={v.id}
                                    className="flex items-center justify-between rounded-lg border border-gov-border bg-gov-canvas px-3 py-2 text-xs"
                                >
                                    <span className="font-mono text-gov-text tabular-nums">
                                        {v.start_date} → {v.end_date}
                                    </span>
                                    <span className="rounded-sm border border-gov-border bg-gov-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gov-muted">
                                        {t("consultant.runwayPaused")}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {vacations.length > 5 && (
                            <Pagination
                                currentPage={vacationPagination.currentPage}
                                totalItems={vacationPagination.totalItems}
                                pageSize={vacationPagination.pageSize}
                                onPageChange={vacationPagination.setCurrentPage}
                                itemLabel="absences"
                                className="mt-3 border-none bg-transparent p-0"
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Historical Booking Ledger */}
                <div id="ledger" className="space-y-6 lg:col-span-2">
                    <div className="rounded-lg border border-gov-border bg-gov-surface p-4 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-gov-border pb-4">
                            <div>
                                <h2 className="font-semibold text-base text-gov-text">
                                    {t("consultant.ledgerTitle")}
                                </h2>
                                <p className="text-xs text-gov-muted">
                                    {t("consultant.ledgerDescription")}
                                </p>
                            </div>
                            <span className="font-mono text-xs text-gov-muted">
                                {bookings.length} {t("common.lineItems")}
                            </span>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-lg border border-gov-border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-gov-border bg-gov-surface-hover text-[11px] font-semibold uppercase tracking-wider text-gov-muted">
                                        <tr>
                                            <th className="h-9 px-3 sm:px-4">{t("consultant.thDate")}</th>
                                            <th className="h-9 px-3 sm:px-4">
                                                {t("consultant.thOrder")}
                                            </th>
                                            <th className="h-9 px-3 sm:px-4 text-right">
                                                {t("consultant.thHours")}
                                            </th>
                                            <th className="h-9 px-3 sm:px-4 text-right">
                                                {t("consultant.thPd")}
                                            </th>
                                            <th className="h-9 px-3 sm:px-4">
                                                {t("consultant.thProof")}
                                            </th>
                                            <th className="h-9 px-3 sm:px-4 text-right">
                                                {t("consultant.thStatus")}
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
                                                    <td className="h-11 px-3 sm:px-4 font-mono font-medium text-gov-text tabular-nums whitespace-nowrap">
                                                        {b.date}
                                                    </td>
                                                    <td className="h-11 px-3 sm:px-4 font-medium text-gov-text">
                                                        <div>
                                                             {b.order_number}
                                                        </div>
                                                        <div className="text-[10px] text-gov-muted truncate max-w-28 sm:max-w-40">
                                                            {b.order_title}
                                                        </div>
                                                    </td>
                                                    <td className="h-11 px-3 sm:px-4 text-right font-mono font-semibold text-gov-text tabular-nums">
                                                        {b.hours.toFixed(2)}h
                                                    </td>
                                                    <td className="h-11 px-3 sm:px-4 text-right font-mono text-gov-muted tabular-nums">
                                                        {(b.hours / 8).toFixed(
                                                            2,
                                                        )}{" "}
                                                        {t("common.pd")}
                                                    </td>
                                                    <td className="h-11 px-3 sm:px-4 max-w-xs text-gov-muted truncate">
                                                        {b.description}
                                                        {b.rejection_reason && (
                                                            <span className="block font-medium text-gov-critical-text">
                                                                {t("common.reason")}:{" "}
                                                                {
                                                                    b.rejection_reason
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="h-11 px-3 sm:px-4 text-right whitespace-nowrap">
                                                        <span
                                                            className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                                                                b.status ===
                                                                "approved"
                                                                    ? "border-gov-success-border bg-gov-success-bg text-gov-success-text"
                                                                    : b.status ===
                                                                        "rejected"
                                                                      ? "border-gov-critical-border bg-gov-critical-bg text-gov-critical-text"
                                                                      : "border-gov-warning-border bg-gov-warning-bg text-gov-warning-text"
                                                            }`}
                                                        >
                                                            {b.status === "approved"
                                                                ? t("common.approved")
                                                                : b.status === "rejected"
                                                                  ? t("common.rejected")
                                                                  : t("common.pending")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Reusable Pagination Component */}
                            <Pagination
                                currentPage={bookingPagination.currentPage}
                                totalItems={bookingPagination.totalItems}
                                pageSize={bookingPagination.pageSize}
                                onPageChange={bookingPagination.setCurrentPage}
                                onPageSizeChange={bookingPagination.setPageSize}
                                pageSizeOptions={[10, 25, 50]}
                                itemLabel="timesheet logs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* In-App Regulatory Advisor Drawer */}
            <ChatbotDrawer />
        </div>
    );
}
