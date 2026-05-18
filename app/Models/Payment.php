<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasHashid;

class Payment extends Model
{
    use HasHashid;

    protected $fillable = [
        'order_id',
        'type',
        'expected_amount',
        'unique_code',
        'payment_proof',
        'status',
        'verified_by',
        'verified_at',
        'rejection_notes',
    ];

    protected $casts = [
        'expected_amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
