<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'business_name',
    'whatsapp_number',
    'bank_name',
    'bank_account_number',
    'bank_account_holder_name',
    'dp_percentage',
    'order_edit_limit_days',
    'otp_expiry_minutes',
])]
class Setting extends Model
{
    protected function casts(): array
    {
        return [
            'dp_percentage' => 'integer',
            'order_edit_limit_days' => 'integer',
            'otp_expiry_minutes' => 'integer',
        ];
    }

    public static function defaults(): array
    {
        return [
            'business_name' => config('app.name'),
            'whatsapp_number' => '',
            'bank_name' => '',
            'bank_account_number' => '',
            'bank_account_holder_name' => '',
            'dp_percentage' => 0,
            'order_edit_limit_days' => 0,
            'otp_expiry_minutes' => 10,
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], static::defaults());
    }
}
