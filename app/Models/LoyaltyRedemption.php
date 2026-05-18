<?php

namespace App\Models;

use App\Traits\HasHashid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyRedemption extends Model
{
    use HasHashid;

    protected $fillable = [
        'user_id',
        'order_id',
        'loyalty_config_id',
        'discount_applied',
        'orders_at_redemption',
    ];

    protected $casts = [
        'discount_applied' => 'decimal:2',
        'orders_at_redemption' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function config(): BelongsTo
    {
        return $this->belongsTo(LoyaltyConfig::class);
    }
}
