<?php

namespace App\Http\Requests\Admin;

use App\AdatType;
use App\Enums\KondisiProduk as KondisiProdukRules;
use App\Models\MenuItem;
use App\OrderType;
use App\Rules\ValidHashid;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateManualOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        $orderTypes = array_map(
            static fn (OrderType $orderType): string => $orderType->value,
            OrderType::cases(),
        );
        $adatValues = array_map(static fn (AdatType $adatType): string => $adatType->value, AdatType::cases());
        $kondisiValues = array_merge(
            KondisiProdukRules::TIMBANG_HIDUP,
            KondisiProdukRules::OLAHAN,
            KondisiProdukRules::ECERAN,
        );

        return [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'order_type' => ['required', 'string', 'in:'.implode(',', $orderTypes)],
            'booking_date' => 'required|date|after_or_equal:today',
            'pickup_time' => 'required_if:order_type,takeaway|date_format:H:i',
            'delivery_time' => 'required_if:order_type,delivery|date_format:H:i',
            'delivery_address' => 'required_if:order_type,delivery|string|max:500',
            'notes' => 'nullable|string|max:500',
            'dp_percentage' => 'nullable|integer|min:10|max:100',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => ['nullable', 'string', new ValidHashid(MenuItem::class)],
            'items.*.menu_name' => 'required|string|max:255',
            'items.*.menu_category_type' => 'required|string|in:timbang_hidup,olahan,eceran',
            'items.*.menu_unit' => 'required|string|max:50',
            'items.*.kondisi_produk' => ['required', Rule::in(array_merge($kondisiValues, ['satuan', 'adat']))],
            'items.*.adat_type' => ['nullable', Rule::in($adatValues)],
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:255',
        ];
    }
}
