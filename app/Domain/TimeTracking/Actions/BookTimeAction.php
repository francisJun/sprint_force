<?php

namespace App\Domain\TimeTracking\Actions;

use App\Domain\TimeTracking\Exceptions\BookingValidationException;
use App\Domain\TimeTracking\Services\TimeBookingValidator;
use App\Models\PurchaseOrder;
use App\Models\TimeBooking;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BookTimeAction
{
    public function __construct(
        protected TimeBookingValidator $validator = new TimeBookingValidator
    ) {}

    /**
     * Execute time booking on an order with full domain rule enforcement.
     *
     * @param  array{
     *     date: string,
     *     hours: float|string,
     *     description: string,
     *     start_time?: ?string,
     *     end_time?: ?string,
     *     special_authorization?: bool,
     *     status?: string,
     *     state?: ?string
     * }  $data
     *
     * @throws BookingValidationException
     */
    public function execute(PurchaseOrder $order, User $consultant, array $data): TimeBooking
    {
        return DB::transaction(function () use ($order, $consultant, $data) {
            $compliance = $this->validator->validateBooking($order, $consultant, $data);

            return TimeBooking::create([
                'purchase_order_id' => $order->id,
                'user_id' => $consultant->id,
                'date' => $data['date'],
                'hours' => $data['hours'],
                'start_time' => $data['start_time'] ?? null,
                'end_time' => $data['end_time'] ?? null,
                'description' => $data['description'] ?? '',
                'status' => $data['status'] ?? 'submitted',
                'requires_compensatory_rest' => $compliance['requires_compensatory_rest'],
                'special_authorization' => (bool) ($data['special_authorization'] ?? false),
                'statutory_notes' => $compliance['statutory_notes'],
            ]);
        });
    }
}

