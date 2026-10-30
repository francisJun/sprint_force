<?php

namespace App\Domain\TimeTracking\Rules;

use App\Models\PurchaseOrder;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Ensures that a consultant can only book time against an active purchase order
 * that they are explicitly assigned to.
 */
class ConsultantAssignedToOrderRule implements ValidationRule
{
    public function __construct(
        protected int $userId
    ) {}

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $order = PurchaseOrder::find($value);

        if (! $order) {
            $fail('The selected purchase order does not exist.');

            return;
        }

        if ($order->status !== 'active') {
            $fail(sprintf('Purchase order %s is %s. Bookings are only accepted for active orders.', $order->order_number, $order->status));

            return;
        }

        $isAssigned = $order->assignedConsultants()->where('users.id', $this->userId)->exists();

        if (! $isAssigned) {
            $fail(sprintf('You are not assigned to purchase order %s (%s).', $order->order_number, $order->title));
        }
    }
}

