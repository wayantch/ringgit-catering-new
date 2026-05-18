<?php

namespace App\Models;

use App\Traits\HasHashid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyConfig extends Model
{
    use HasHashid;

    protected $fillable = [
        'is_active',
        'min_orders',
        'discount_type',
        'discount_value',
        'max_discount',
        'period_start',
        'period_end',
        'count_period',
        'count_from',
        'count_to',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'min_orders' => 'integer',
        'discount_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'count_from' => 'date',
        'count_to' => 'date',
    ];

    public function redemptions(): HasMany
    {
        return $this->hasMany(LoyaltyRedemption::class);
    }

    public function isCurrentlyActive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $today = now()->toDateString();

        if ($this->period_start && $today < $this->period_start->toDateString()) {
            return false;
        }

        if ($this->period_end && $today > $this->period_end->toDateString()) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($this->discount_type === 'nominal') {
            return round((float) $this->discount_value, 2);
        }

        $discount = $subtotal * ((float) $this->discount_value / 100);

        if ($this->max_discount !== null) {
            $discount = min($discount, (float) $this->max_discount);
        }

        return round($discount, 2);
    }
}
