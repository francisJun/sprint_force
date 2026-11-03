<?php

namespace App\Policies;

use App\Models\TimeBooking;
use App\Models\User;

class TimeBookingPolicy
{
    /**
     * Determine whether the user can view a list of bookings.
     */
    public function viewAny(User $user): bool
    {
        // Super Admin, Project Lead, and Consultant (own) may view bookings.
        // Purchasing only sees aggregated person-days per order (data minimization).
        return $user->isSuperAdmin() || $user->isProjectLead() || $user->isConsultant();
    }

    /**
     * Determine whether the user can view an individual time booking.
     */
    public function view(User $user, TimeBooking $timeBooking): bool
    {
        if ($user->isSuperAdmin() || $user->isProjectLead()) {
            return true;
        }

        if ($user->isConsultant()) {
            return $user->id === $timeBooking->user_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create a time booking.
     */
    public function create(User $user): bool
    {
        // Strictly restricted to external consultants per docs/roles-and-privacy.md
        return $user->isConsultant();
    }

    /**
     * Determine whether the user can update the time booking.
     */
    public function update(User $user, TimeBooking $timeBooking): bool
    {
        // Consultant can only modify their own booking while still in 'submitted' state
        return $user->isConsultant()
            && $user->id === $timeBooking->user_id
            && $timeBooking->isSubmitted();
    }

    /**
     * Determine whether the user can delete the time booking.
     */
    public function delete(User $user, TimeBooking $timeBooking): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isConsultant()
            && $user->id === $timeBooking->user_id
            && $timeBooking->isSubmitted();
    }

    /**
     * Determine whether the user can approve the time booking.
     */
    public function approve(User $user, TimeBooking $timeBooking): bool
    {
        // Only Client Project Lead and Super Admin can approve, and only while in 'submitted' state
        return ($user->isProjectLead() || $user->isSuperAdmin())
            && $timeBooking->isSubmitted();
    }

    /**
     * Determine whether the user can reject the time booking.
     */
    public function reject(User $user, TimeBooking $timeBooking): bool
    {
        // Only Client Project Lead and Super Admin can reject, and only while in 'submitted' state
        return ($user->isProjectLead() || $user->isSuperAdmin())
            && $timeBooking->isSubmitted();
    }
}
