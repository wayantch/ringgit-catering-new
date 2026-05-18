<?php

namespace App\Http\Requests\Admin;

use App\AdatType;
use App\Enums\KondisiProduk as KondisiProdukRules;
use App\OrderType;
use App\Models\MenuItem;
use App\Models\User;
use App\Rules\ValidHashid;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreManualOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        $orderTypes = array_map(static fn(OrderType $orderType): string => $orderType->value, OrderType::cases());
        $adatValues = array_map(static fn(AdatType $adatType): string => $adatType->value, AdatType::cases());
        $kondisiValues = array_merge(
            KondisiProdukRules::TIMBANG_HIDUP,
            KondisiProdukRules::OLAHAN,
            KondisiProdukRules::ECERAN,
        );

        return [
            'customer_type' => ['required', Rule::in(['terdaftar', 'walkin'])],
            'user_id' => ['required_if:customer_type,terdaftar', 'nullable', 'string', new ValidHashid(User::class)],
            'customer_name' => ['required_if:customer_type,walkin', 'nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'order_type' => ['required', 'string', Rule::in($orderTypes)],
            'booking_date' => 'required|date|after_or_equal:today',
            'pickup_time' => ['nullable', 'date_format:H:i'],
            'delivery_time' => ['nullable', 'date_format:H:i'],
            'delivery_address' => ['required_if:order_type,delivery', 'nullable', 'string', 'max:500'],
            'notes' => 'nullable|string|max:1000',
            'payment_method' => ['required', Rule::in(['full', 'dp'])],
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => ['required', 'string', new ValidHashid(MenuItem::class)],
            'items.*.menu_name' => 'required|string|max:255',
            'items.*.menu_category_type' => 'required|string|in:timbang_hidup,olahan,eceran',
            'items.*.menu_unit' => 'required|string|max:50',
            'items.*.menu_image' => 'nullable|string',
            'items.*.base_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.kondisi_produk' => ['required', Rule::in($kondisiValues)],
            'items.*.adat_type' => ['nullable', Rule::in($adatValues)],
            'items.*.qty' => 'required|numeric|min:0.5',
            'items.*.price' => ['nullable', 'numeric', 'min:0'],
            'items.*.notes' => 'nullable|string|max:500',
        ];
    }
}
