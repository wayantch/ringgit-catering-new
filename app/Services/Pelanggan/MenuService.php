<?php

namespace App\Services\Pelanggan;

use App\Models\MenuItem;

class MenuService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function getTimbangHidupMenus(): array
    {
        return MenuItem::query()
            ->where('is_available', true)
            ->where('menu_type', 'timbang_hidup')
            ->with(['category', 'tiers'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(static fn(MenuItem $item): array => self::mapItem($item))
            ->values()
            ->all();
    }

    /**
     * @return array{ paket_pass: array<int, array<string, mixed>>, paket_nasi_box: array<int, array<string, mixed>>, babi_adat: array<int, array<string, mixed>> }
     */
    public function getEceranMenus(): array
    {
        $items = MenuItem::query()
            ->where('is_available', true)
            ->where('menu_type', 'eceran')
            ->with(['category', 'variants'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(static fn(MenuItem $item): array => self::mapItem($item))
            ->values();

        return [
            'paket_pass' => $items->where('sub_type', 'paket_pass')->values()->all(),
            'paket_nasi_box' => $items->where('sub_type', 'paket_nasi_box')->values()->all(),
            'babi_adat' => $items->where('sub_type', 'babi_adat')->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function mapItem(MenuItem $item): array
    {
        $payload = $item->toArray();
        $payload['id'] = $item->hashid;
        $payload['category_id'] = $item->category?->hashid;
        $payload['category'] = [
            'id' => $item->category?->hashid,
            'name' => $item->category?->name,
            'type' => $item->category?->type,
        ];
        $payload['min_price'] = $item->min_price !== null ? (float) $item->min_price : null;
        $payload['tiers'] = $item->tiers->map(static function ($tier): array {
            return [
                'id' => (string) $tier->id,
                'kode' => $tier->kode,
                'is_half' => (bool) $tier->is_half,
                'berat_min' => (float) $tier->berat_min,
                'berat_max' => $tier->berat_max !== null ? (float) $tier->berat_max : null,
                'harga_mentah' => (float) $tier->harga_mentah,
                'harga_matang' => (float) $tier->harga_matang,
                'cashback' => (float) $tier->cashback,
            ];
        })->all();
        $payload['variants'] = $item->variants->map(static function ($variant): array {
            return [
                'id' => (string) $variant->id,
                'label' => $variant->label,
                'harga' => (float) $variant->harga,
            ];
        })->all();

        return $payload;
    }
}
