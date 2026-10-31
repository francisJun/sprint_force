import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ChatbotDrawer } from '@/components/hourradar/ChatbotDrawer';

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
    status: 'submitted' | 'approved' | 'rejected';
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

export default function ConsultantDashboard({ user, assignedOrders, bookings, vacations }: Props) {
    const today = new Date().toISOString().split('T')[0];

    // Booking form
    const bookingForm = useForm({
        purchase_order_id: assignedOrders[0]?.id || '',
        date: today,
        hours: '7.5',
        description: '',
    });

    // Vacation form
    const vacationForm = useForm({
        start_date: '',
        end_date: '',
    });

    const submitBooking = (e: React.FormEvent) => {
        e.preventDefault();
        bookingForm.post('/bookings', {
            preserveScroll: true,
            onSuccess: () => {
                bookingForm.reset('description');
            },
        });
    };

    const submitVacation = (e: React.FormEvent) => {
        e.preventDefault();
        vacationForm.post('/vacations', {
            preserveScroll: true,
            onSuccess: () => {
                vacationForm.reset();
            },
        });
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sidebar-border pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-bold text-2xl tracking-tight">Time Booking Portal</h1>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-900/40 dark:text-blue-300">
                            External Consultant
                        </span>
                    </div>
                    <p className="mt-1 text-neutral-500 text-sm">
                        Welcome, <span className="font-semibold">{user.name}</span>. Fast daily time booking with real-time ArbZG legal validation.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Time Booking Form */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-2xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold text-base">Book Working Time</h2>
                        <p className="mt-1 text-neutral-500 text-xs">
                            Books hours directly to your assigned client Purchase Order.
                        </p>

                        <form onSubmit={submitBooking} className="mt-4 space-y-4">
                            <div>
                                <label className="block font-medium text-xs text-neutral-700 dark:text-neutral-300">
                                    Purchase Order
                                </label>
                                <select
                                    value={bookingForm.data.purchase_order_id}
                                    onChange={(e) => bookingForm.setData('purchase_order_id', Number(e.target.value))}
                                    className="mt-1 w-full rounded-xl border border-sidebar-border bg-background p-2.5 text-sm"
                                >
                                    {assignedOrders.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.order_number} - {o.title}
                                        </option>
                                    ))}
                                </select>
                                {bookingForm.errors.purchase_order_id && (
                                    <p className="mt-1 text-red-500 text-xs">{bookingForm.errors.purchase_order_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-xs text-neutral-700 dark:text-neutral-300">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingForm.data.date}
                                        onChange={(e) => bookingForm.setData('date', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-sidebar-border bg-background p-2.5 text-sm"
                                    />
                                    {bookingForm.errors.date && (
                                        <p className="mt-1 text-red-500 text-xs">{bookingForm.errors.date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-medium text-xs text-neutral-700 dark:text-neutral-300">
                                        Hours (max 10h)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0.25"
                                        max="10.0"
                                        value={bookingForm.data.hours}
                                        onChange={(e) => bookingForm.setData('hours', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-sidebar-border bg-background p-2.5 text-sm"
                                    />
                                </div>
                            </div>
                            {bookingForm.errors.hours && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-700 text-xs dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                                    ⚠️ {bookingForm.errors.hours}
                                </div>
                            )}

                            <div>
                                <label className="block font-medium text-xs text-neutral-700 dark:text-neutral-300">
                                    Description / Proof of Work
                                </label>
                                <textarea
                                    rows={3}
                                    value={bookingForm.data.description}
                                    onChange={(e) => bookingForm.setData('description', e.target.value)}
                                    placeholder="What did you work on? (e.g. Migration pipeline API integration)"
                                    className="mt-1 w-full rounded-xl border border-sidebar-border bg-background p-2.5 text-sm"
                                />
                                {bookingForm.errors.description && (
                                    <p className="mt-1 text-red-500 text-xs">{bookingForm.errors.description}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={bookingForm.processing}
                                className="w-full rounded-xl bg-blue-600 py-2.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {bookingForm.processing ? 'Submitting...' : 'Submit Booking'}
                            </button>
                        </form>
                    </div>

                    {/* Planned Vacation Blocks */}
                    <div className="rounded-2xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold text-base">Planned Vacations / Absences</h2>
                        <p className="mt-1 text-neutral-500 text-xs">
                            Informs the client's runway algorithm to pause burn projections during your absence.
                        </p>

                        <form onSubmit={submitVacation} className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs">Start Date</label>
                                    <input
                                        type="date"
                                        value={vacationForm.data.start_date}
                                        onChange={(e) => vacationForm.setData('start_date', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-sidebar-border bg-background p-2 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs">End Date</label>
                                    <input
                                        type="date"
                                        value={vacationForm.data.end_date}
                                        onChange={(e) => vacationForm.setData('end_date', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-sidebar-border bg-background p-2 text-xs"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={vacationForm.processing}
                                className="w-full rounded-xl border border-sidebar-border py-2 font-medium text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                Add Vacation Block
                            </button>
                        </form>

                        <div className="mt-4 space-y-2">
                            {vacations.map((v) => (
                                <div key={v.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-xs">
                                    <span>🏖️ {v.start_date} → {v.end_date}</span>
                                    <span className="text-neutral-400">Planned</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Time Booking History */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-base">Your Booking History</h2>
                            <span className="text-neutral-500 text-xs">{bookings.length} entries shown</span>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-xl border border-sidebar-border">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted text-neutral-500 text-xs">
                                    <tr>
                                        <th className="px-4 py-2.5">Date</th>
                                        <th className="px-4 py-2.5">Order</th>
                                        <th className="px-4 py-2.5">Hours</th>
                                        <th className="px-4 py-2.5">Description</th>
                                        <th className="px-4 py-2.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border text-xs">
                                    {bookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-muted/50">
                                            <td className="whitespace-nowrap px-4 py-3 font-medium">{b.date}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold">{b.order_number}</span>
                                                <span className="block text-neutral-400 text-[10px] truncate max-w-[140px]">{b.order_title}</span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{b.hours}h</td>
                                            <td className="px-4 py-3 max-w-xs truncate text-neutral-600 dark:text-neutral-300">
                                                {b.description}
                                                {b.rejection_reason && (
                                                    <span className="block text-red-500">Reason: {b.rejection_reason}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 font-medium text-[10px] ${
                                                        b.status === 'approved'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                            : b.status === 'rejected'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {b.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Embedded AI Chatbot */}
            <ChatbotDrawer />
        </div>
    );
}
