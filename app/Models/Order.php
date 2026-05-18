<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasHashid;

class Order extends Model
{
    use HasHashid;

    protected $fillable = [
        'user_id',
        'order_number',
        'created_by',
        'source',
        'customer_name',
        'customer_phone',
        'customer_email',
        'order_type',
        'booking_date',
        'booking_time',
        'pickup_time',
        'delivery_time',
        'delivery_address',
        'order_status',
        'notes',
        'is_price_pending',
        'subtotal',
        'unique_code',
        'total_amount',
        'dp_percentage',
        'dp_unique_code',
        'dp_amount',
        'remaining_amount',
        'loyalty_redemption_id',
        'loyalty_discount',
        'editable_until',
        'production_stage',
        'is_urgent',
        'production_completed_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'dp_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'loyalty_discount' => 'decimal:2',
        'booking_date' => 'date',
        'editable_until' => 'date',
        'is_price_pending' => 'boolean',
        'is_urgent' => 'boolean',
        'production_completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentVerifications(): HasMany
    {
        return $this->hasMany(PaymentVerification::class);
    }

    public function loyaltyRedemption(): BelongsTo
    {
        return $this->belongsTo(LoyaltyRedemption::class);
    }

    public function isEditable(): bool
    {
        if ($this->source === 'pembeli') {
            return false;
        }

        if (! $this->editable_until) {
            return true;
        }

        return now()->toDateString() <= $this->editable_until->toDateString();
    }
}
