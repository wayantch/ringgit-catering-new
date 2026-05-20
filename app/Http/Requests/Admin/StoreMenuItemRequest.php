<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'menu_type' => 'required|in:timbang_hidup,eceran',
            'sub_type' => 'required_if:menu_type,eceran|nullable|in:paket_pass,paket_nasi_box,babi_adat',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'is_available' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',

            'is_bundle' => 'boolean',
            'bundle_desc' => 'required_if:is_bundle,true|nullable|string',
            'free_ongkir_km' => 'nullable|integer|min:0',
            'ongkir_subsidi' => 'nullable|array',
            'babi_mentah_price' => 'required_if:sub_type,babi_adat|numeric|min:0',
            'babi_matang_price' => 'required_if:sub_type,babi_adat|numeric|min:0',

            'tiers' => 'required_if:menu_type,timbang_hidup|array|min:1',
            'tiers.*.kode' => 'required|in:A,B,C',
            'tiers.*.is_half' => 'boolean',
            'tiers.*.berat_min' => 'required|numeric|min:0',
            'tiers.*.berat_max' => 'nullable|numeric|gt:tiers.*.berat_min',
            'tiers.*.harga_mentah' => 'required|numeric|min:0',
            'tiers.*.harga_matang' => 'required|numeric|min:0',
            'tiers.*.cashback' => 'nullable|numeric|min:0',

            'variants' => [
                'array',
                'min:1',
                function ($attribute, $value, $fail) {
                    $menuType = $this->input('menu_type');
                    $subType = $this->input('sub_type');

                    $fixed = ['paket_pass', 'paket_nasi_box', 'babi_adat'];

                    if ($menuType === 'eceran' && ! in_array($subType, $fixed, true)) {
                        if (! is_array($value) || count($value) === 0) {
                            $fail('The variants field is required for this sub-type.');
                        }
                    }
                },
            ],
            'variants.*.label' => 'required_with:variants|string|max:50',
            'variants.*.harga' => 'required_with:variants|numeric|min:0',
        ];
    }
}
