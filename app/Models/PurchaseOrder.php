<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'title',
        'total_person_days',
        'start_date',
        'target_end_date',
        'status',
        'supplier_id',
    ];

    protected function casts(): array
    {
        return [
            'total_person_days' => 'decimal:2',
            'start_date' => 'date',
            'target_end_date' => 'date',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function assignedConsultants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'purchase_order_assignments');
    }

    public function timeBookings(): HasMany
    {
        return $this->hasMany(TimeBooking::class);
    }

    /**
     * Total approved booked hours
     */
    public function approvedHours(): float
    {
        return (float) $this->timeBookings()->where('status', 'approved')->sum('hours');
    }

    /**
     * Total used person-days (hours / 8.0)
     */
    public function usedPersonDays(): float
    {
        return round($this->approvedHours() / 8.0, 2);
    }

    /**
     * Remaining person-days
     */
    public function remainingPersonDays(): float
    {
        return max(0.0, round((float) $this->total_person_days - $this->usedPersonDays(), 2));
    }

    /**
     * Book time on this purchase order with domain rule validation.
     * Fulfills Technical Criterion 2 (Order.book(hours)).
     *
     * @param  array{
     *     date: string,
     *     hours: float|string,
     *     description?: string,
     *     start_time?: ?string,
     *     end_time?: ?string,
     *     special_authorization?: bool,
     *     status?: string,
     *     state?: ?string
     * }  $attributes
     *
     * @throws \App\Domain\TimeTracking\Exceptions\BookingValidationException
     */
    public function book(User $consultant, array $attributes): TimeBooking
    {
        /** @var \App\Domain\TimeTracking\Actions\BookTimeAction $action */
        $action = app(\App\Domain\TimeTracking\Actions\BookTimeAction::class);

        return $action->execute($this, $consultant, $attributes);
    }
}

