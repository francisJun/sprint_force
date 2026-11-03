<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
{
    /**
     * Determine whether the user can view the list of purchase orders.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view a specific purchase order.
     */
    public function view(User $user, PurchaseOrder $order): bool
    {
        if ($user->isSuperAdmin() || $user->isProjectLead() || $user->isPurchasing()) {
            return true;
        }

        if ($user->isConsultant()) {
            return $order->assignedConsultants()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create purchase orders.
     */
    public function create(User $user): bool
    {
        return $user->isPurchasing() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the purchase order.
     */
    public function update(User $user, PurchaseOrder $order): bool
    {
        return $user->isPurchasing() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can delete the purchase order.
     */
    public function delete(User $user, PurchaseOrder $order): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can book working time against this order.
     */
    public function bookTime(User $user, PurchaseOrder $order): bool
    {
        return $user->isConsultant()
            && $order->status === 'active'
            && $order->assignedConsultants()->where('users.id', $user->id)->exists();
    }
}
