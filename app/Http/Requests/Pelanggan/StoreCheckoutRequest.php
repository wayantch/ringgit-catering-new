<?php

namespace App\Http\Requests\Pelanggan;

use App\OrderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isPembeli() ?? false;
    }

    public function rules(): array
    {
        $orderTypes = array_map(static fn (OrderType $orderType): string => $orderType->value, OrderType::cases());

        return [
            'order_type' => ['required', 'string', Rule::in($orderTypes)],
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'pickup_time' => ['required_if:order_type,takeaway', 'nullable', 'date_format:H:i', 'regex:/^\d{2}:(00|30)$/', 'after_or_equal:05:00', 'before_or_equal:18:00'],
            'delivery_time' => ['required_if:order_type,delivery', 'nullable', 'date_format:H:i', 'regex:/^\d{2}:(00|30)$/', 'after_or_equal:05:00', 'before_or_equal:18:00'],
            'delivery_address' => ['required_if:order_type,delivery', 'nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'phone' => ['required', 'string'],
            'use_loyalty_discount' => ['sometimes', 'boolean'],
        ];
    }
}
