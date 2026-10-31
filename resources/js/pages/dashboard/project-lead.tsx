import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChatbotDrawer } from '@/components/hourradar/ChatbotDrawer';

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

export default function ProjectLeadDashboard({ user, orders, pendingBookings }: Props) {
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = (bookingId: number) => {
        router.post(`/bookings/${bookingId}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = (bookingId: number) => {
        if (!rejectionReason.trim()) return;
        router.post(
            `/bookings/${bookingId}/reject`,
            { rejection_reason: rejectionReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingId(null);
                    setRejectionReason('');
                },
            }
        );
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sidebar-border pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-bold text-2xl tracking-tight">Project Steering Cockpit</h1>
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-medium text-purple-700 text-xs dark:bg-purple-900/40 dark:text-purple-300">
                            {user.role === 'purchasing' ? 'Purchasing & Finance' : 'Client Project Lead'}
                        </span>
                    </div>
                    <p className="mt-1 text-neutral-500 text-sm">
                        Real-time order budget runway monitoring, early procurement re-order warnings, and 1-click proof of work approvals.
                    </p>
                </div>
            </div>

            {/* Re-order alert banner if any order needs re-order */}
            {orders.some((o) => o.needs_reorder_alert) && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <h4 className="font-semibold text-sm">Early Warning: Procurement Re-Order Action Required</h4>
                        <p className="mt-0.5 text-xs">
                            One or more Purchase Orders are forecasted to exhaust budget within the 4-week procurement lead time or before project target dates.
                        </p>
                    </div>
                </div>
            )}

            {/* Purchase Orders Runway Cards */}
            <div className="mt-6">
                <h2 className="font-semibold text-lg">Active Purchase Orders & Runway Forecast</h2>
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {orders.map((order) => {
                        const percentUsed = Math.min(
                            100,
                            Math.round((order.used_person_days / order.total_person_days) * 100)
                        );

                        return (
                            <div
                                key={order.id}
                                className="relative flex flex-col justify-between rounded-2xl border border-sidebar-border bg-card p-6 shadow-sm"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-mono text-neutral-400 text-xs">PO #{order.order_number}</span>
                                            <h3 className="font-bold text-lg text-foreground">{order.title}</h3>
                                            <p className="text-neutral-500 text-xs">Supplier: {order.supplier_name}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs border border-sidebar-border bg-muted">
                                            <span
                                                className={`h-2.5 w-2.5 rounded-full ${
                                                    order.status_traffic_light === 'green'
                                                        ? 'bg-green-500'
                                                        : order.status_traffic_light === 'yellow'
                                                        ? 'bg-amber-500'
                                                        : 'bg-red-500'
                                                }`}
                                            ></span>
                                            <span className="capitalize">{order.status_traffic_light} Runway</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-5">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>Used: {order.used_person_days} PD</span>
                                            <span className="text-neutral-500">Total: {order.total_person_days} PD</span>
                                        </div>
                                        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div
                                                className={`h-full transition-all ${
                                                    percentUsed > 85 ? 'bg-red-500' : percentUsed > 65 ? 'bg-amber-500' : 'bg-blue-600'
                                                }`}
                                                style={{ width: `${percentUsed}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Runway Intelligence Grid */}
                                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-muted p-3 text-xs">
                                        <div>
                                            <span className="text-neutral-500">Remaining Budget</span>
                                            <p className="font-bold text-sm text-foreground">
                                                {order.remaining_person_days} Person-Days
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-500">Burn Pace</span>
                                            <p className="font-bold text-sm text-foreground">
                                                {order.average_weekly_burn_pd} PD / week
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-500">Forecasted Depletion</span>
                                            <p className="font-bold text-sm text-foreground">
                                                📅 {order.forecasted_end_date}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-500">Contract End Date</span>
                                            <p className="font-bold text-sm text-foreground">
                                                🏁 {order.target_end_date}
                                            </p>
                                        </div>
                                    </div>

                                    {order.vacation_days_affecting_runway > 0 && (
                                        <p className="mt-2 text-[11px] text-neutral-500">
                                            🏖️ Includes {order.vacation_days_affecting_runway} consultant vacation days extending the runway.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Approval Queue for Submitted Proof of Work */}
            <div className="mt-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-lg">Proof of Work Approval Queue</h2>
                        <p className="text-neutral-500 text-xs">
                            Review consultant hours before they hit the approved budget and invoice ledger.
                        </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800 text-xs dark:bg-amber-950 dark:text-amber-300">
                        {pendingBookings.length} Pending
                    </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-sidebar-border bg-card shadow-sm">
                    {pendingBookings.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                            🎉 All submitted hours have been reviewed and approved!
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted text-neutral-500 text-xs">
                                <tr>
                                    <th className="px-4 py-3">Consultant</th>
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Hours</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border text-xs">
                                {pendingBookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3.5 font-semibold">{b.consultant_name}</td>
                                        <td className="px-4 py-3.5">
                                            <span>{b.order_number}</span>
                                            <span className="block text-neutral-400 text-[10px]">{b.order_title}</span>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">{b.date}</td>
                                        <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400">
                                            {b.hours}h ({(b.hours / 8).toFixed(2)} PD)
                                        </td>
                                        <td className="px-4 py-3.5 max-w-sm text-neutral-600 dark:text-neutral-300">
                                            {b.description}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                            {rejectingId === b.id ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Rejection reason..."
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="rounded-lg border border-sidebar-border bg-background px-2 py-1 text-xs"
                                                    />
                                                    <button
                                                        onClick={() => handleReject(b.id)}
                                                        className="rounded-lg bg-red-600 px-2.5 py-1 text-white hover:bg-red-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(null)}
                                                        className="rounded-lg px-2 py-1 text-neutral-400 hover:text-neutral-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(b.id)}
                                                        className="rounded-lg bg-green-600 px-3 py-1.5 font-medium text-white hover:bg-green-700"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(b.id)}
                                                        className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Embedded AI Chatbot */}
            <ChatbotDrawer />
        </div>
    );
}
