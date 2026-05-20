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

        if ($menuItem?->menu_type === 'timbang_hidup') {
            $validKondisi = KondisiProduk::TIMBANG_HIDUP;
        } elseif ($menuItem?->menu_type === 'eceran' && $menuItem->sub_type === 'babi_adat') {
            // Eceran babi adat sold as mentah/mateng — accept olahan values too
            $validKondisi = array_merge(KondisiProduk::ECERAN, KondisiProduk::OLAHAN);
        } else {
            $validKondisi = KondisiProduk::ECERAN;
        }

        return [
            'menu_item_id' => ['required', 'string', new ValidHashid(MenuItem::class)],
            'kondisi_produk' => ['required', Rule::in($validKondisi)],
            'adat_type' => [
                Rule::requiredIf($this->input('kondisi_produk') === 'adat'),
                'nullable',
                'string',
                Rule::in(KondisiProduk::ADAT_OPTIONS),
            ],
            'portion' => [
                'nullable',
                'string',
                Rule::in(['utuh', 'setengah']),
            ],
            'quantity' => ['required', 'numeric', 'min:0.5'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
