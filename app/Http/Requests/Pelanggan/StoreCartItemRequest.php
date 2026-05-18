<?php

namespace App\Http\Requests\Pelanggan;

use App\Enums\KondisiProduk;
use App\Models\MenuItem;
use App\Rules\ValidHashid;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $menuItem = MenuItem::findByHashidOrNull((string) $this->input('menu_item_id'));

        $validKondisi = $menuItem?->menu_type === 'timbang_hidup'
            ? KondisiProduk::TIMBANG_HIDUP
            : KondisiProduk::ECERAN;

        return [
            'menu_item_id' => ['required', 'string', new ValidHashid(MenuItem::class)],
            'kondisi_produk' => ['required', Rule::in($validKondisi)],
            'adat_type' => [
                Rule::requiredIf($this->input('kondisi_produk') === 'adat'),
                'nullable',
                'string',
                Rule::in(KondisiProduk::ADAT_OPTIONS),
            ],
            'quantity' => ['required', 'numeric', 'min:0.5'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
