<?php

namespace App\Http\Controllers;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Rules\ConsultantAssignedToOrderRule;
use App\Models\PurchaseOrder;
use App\Models\TimeBooking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TimeBookingController extends Controller
{
    /**
     * Store a newly created time booking.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', TimeBooking::class);

        $user = $request->user();

        $validated = $request->validate([
            'purchase_order_id' => [
                'required',
                'integer',
                new ConsultantAssignedToOrderRule($user->id),
            ],
            'date' => ['required', 'date'],
            'hours' => [
                'required',
                'numeric',
                'min:0.25',
                'max:10.0',
            ],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'description' => ['required', 'string', 'min:5', 'max:1000'],
            'special_authorization' => ['nullable', 'boolean'],
        ]);

        $order = PurchaseOrder::findOrFail($validated['purchase_order_id']);

        Gate::authorize('bookTime', $order);

        try {
            $booking = $order->book($user, $validated);

            $message = 'Time booking submitted successfully.';
            if ($booking->requires_compensatory_rest) {
                $message .= ' (ArbZG § 3 Notice: Compensatory rest required within 6 months).';
            }

            return back()->with('success', $message);
        } catch (BookingValidationException $e) {
            return back()
                ->withErrors([$e->getField() ?? 'hours' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Approve a submitted time booking (Client Project Lead & Super Admin).
     */
    public function approve(Request $request, TimeBooking $timeBooking): RedirectResponse
    {
        Gate::authorize('approve', $timeBooking);

        if (! $timeBooking->isSubmitted()) {
            return back()->withErrors(['booking' => 'Only submitted time bookings can be approved.']);
        }

        $timeBooking->update([
            'status' => 'approved',
            'rejection_reason' => null,
        ]);

        return back()->with('success', sprintf('Booking #%d approved.', $timeBooking->id));
    }

    /**
     * Reject a submitted time booking with a reason.
     */
    public function reject(Request $request, TimeBooking $timeBooking): RedirectResponse
    {
        Gate::authorize('reject', $timeBooking);

        if (! $timeBooking->isSubmitted()) {
            return back()->withErrors(['booking' => 'Only submitted time bookings can be rejected.']);
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $timeBooking->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', sprintf('Booking #%d rejected.', $timeBooking->id));
    }
}

