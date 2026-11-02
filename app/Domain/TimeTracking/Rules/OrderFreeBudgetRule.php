<?php

namespace App\Domain\TimeTracking\Rules;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Models\PurchaseOrder;

class OrderFreeBudgetRule
{
    /**
     * Validate that the requested booking does not exceed the remaining free person-days of the order.
     *
     * @throws BookingValidationException
     */
    public function validate(PurchaseOrder $order, float $hours): void
    {
        $requestedPd = round($hours / 8.0, 2);
        $remainingPd = $order->remainingPersonDays();

        // Allow exact remaining budget within float epsilon
        if ($requestedPd > ($remainingPd + 0.0001)) {
            $formattedRemaining = number_format($remainingPd, 1, '.', '');
            // Strip trailing zero if whole number e.g. 2.0 -> 2, 2.5 -> 2.5
            if (str_ends_with($formattedRemaining, '.0')) {
                $formattedRemaining = substr($formattedRemaining, 0, -2);
            }

            throw new BookingValidationException(
                "Booking rejected: only {$formattedRemaining} PD left on order {$order->order_number}",
                'order_free_budget',
                'hours'
            );
        }
    }
}

