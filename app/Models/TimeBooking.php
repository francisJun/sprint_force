<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'user_id',
        'date',
        'start_time',
        'end_time',
        'hours',
        'description',
        'status',
        'rejection_reason',
        'requires_compensatory_rest',
        'special_authorization',
        'statutory_notes',
    ];

    protected function casts(): array
    {
        return [
            'hours' => 'decimal:2',
            'date' => 'date',
            'requires_compensatory_rest' => 'boolean',
            'special_authorization' => 'boolean',
        ];
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}

