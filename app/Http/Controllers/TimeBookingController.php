<?php

namespace App\Http\Controllers;

use App\Domain\TimeTracking\Rules\ArbzgDailyLimitRule;
use App\Domain\TimeTracking\Rules\ConsultantAssignedToOrderRule;
use App\Models\TimeBooking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TimeBookingController extends Controller
{
    /**
     * Store a newly created time booking.
     */
    public function store(Request $request): RedirectResponse
    {
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
                new ArbzgDailyLimitRule($user->id, $request->input('date')),
            ],
            'description' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        TimeBooking::create([
            'purchase_order_id' => $validated['purchase_order_id'],
            'user_id' => $user->id,
            'date' => $validated['date'],
            'hours' => $validated['hours'],
            'description' => $validated['description'],
            'status' => 'submitted',
        ]);

        return back()->with('success', 'Time booking submitted successfully.');
    }

    /**
     * Approve a submitted time booking (Client Project Lead).
     */
    public function approve(Request $request, TimeBooking $timeBooking): RedirectResponse
    {
        if ($request->user()->isConsultant()) {
            abort(403, 'Consultants are not permitted to approve time bookings.');
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
        if ($request->user()->isConsultant()) {
            abort(403, 'Consultants are not permitted to reject time bookings.');
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

