<?php

namespace App\Services\Pelanggan;

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use Illuminate\Support\Collection;

/**
 * Shapes cart rows into the payload the keranjang page expects, resolving the
 * tier or variant price that applies to each row.
 */
class KeranjangPresenter
{
    /**
     * Notes are persisted as labelled lines; this maps those labels back to the
     * adat codes the frontend works with.
     *
     * @var array<string, string>
     */
    private const ADAT_LABEL_TO_CODE = [
        'Lengkap' => 'batak_lengkap',
        'Kepala' => 'batak_kepala',
        'Aliang' => 'batak_aliang',
        'Somba' => 'batak_somba',
        'Soit' => 'batak_soit',
        'Ekor' => 'batak_ekor',
        'Jeroan' => 'batak_jeroan',
        'Nias Barat' => 'nias_barat',
        'Nias Kota' => 'nias_kota',
        'Nias Sekitar' => 'nias_sekitar',
        'Simbi-Simbi' => 'nias_simbi_simbi',
    ];

    /**
     * @param  Collection<int, Cart>  $cartItems
     * @return array<int, array<string, mixed>>
     */
    public function cartItems(Collection $cartItems): array
    {
        return $cartItems
            ->map(fn (Cart $item): array => $this->cartItem($item))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function cartItem(Cart $item): array
    {
        $menuItem = $item->menuItem;
        $quantity = (float) $item->quantity;
        $tier = $this->resolveTier($menuItem, $quantity);
        $tiers = $menuItem?->tiers ?? collect();
        $variants = $menuItem?->variants ?? collect();
        $resolvedVariant = $variants->count() === 1 ? $variants->first() : null;
        $unitPrice = $this->resolveUnitPrice($menuItem, $tier, $item->kondisi_produk, $resolvedVariant);
        $summaryNotes = $this->parseSummaryNotes($item->notes);

        $mapped = [
            'id' => $item->hashid,
            'menu_type' => $menuItem?->menu_type ?? 'eceran',
            'menu_item' => [
                'id' => $menuItem?->hashid,
                'name' => $menuItem?->name,
                'image' => $menuItem?->image,
                'sub_type' => $menuItem?->sub_type,
                'is_bundle' => $menuItem?->is_bundle ?? false,
                'bundle_desc' => $menuItem?->bundle_desc,
                'free_ongkir_km' => $menuItem?->free_ongkir_km,
                'min_price' => $menuItem?->min_price,
                'is_price_pending' => $menuItem?->is_price_pending,
                'category' => [
                    'type' => $menuItem?->category?->type,
                ],
                'tiers' => $tiers->map(static fn (MenuItemPriceTier $tier): array => self::tierPayload($tier))->values(),
                'variants' => $variants->map(static function (MenuItemVariant $variant): array {
                    return [
                        'id' => $variant->id,
                        'label' => $variant->label,
                        'harga' => (float) $variant->harga,
                    ];
                })->values(),
            ],
            'tier' => $tier ? self::tierPayload($tier, withId: false) : null,
            'kondisi' => $item->kondisi_produk,
            'harga_per_kg' => $unitPrice,
            'subtotal' => $unitPrice !== null ? $unitPrice * $quantity : null,
            'adat_group' => $this->resolveAdatGroup($item->adat_type),
            'adat_parts' => $summaryNotes['adat_parts'],
            'adat_notes' => $summaryNotes['adat_notes'],
            'notes' => $summaryNotes['notes'],
            'portion' => $item->portion,
        ];

        if ($menuItem?->menu_type === 'timbang_hidup') {
            $mapped['berat'] = $quantity;
        }

        if ($menuItem?->menu_type === 'eceran') {
            $mapped['qty'] = $quantity;
        }

        return $mapped;
    }

    /**
     * @return array<string, mixed>
     */
    private static function tierPayload(MenuItemPriceTier $tier, bool $withId = true): array
    {
        $payload = [
            'kode' => $tier->kode,
            'is_half' => $tier->is_half,
            'berat_min' => (float) $tier->berat_min,
            'berat_max' => $tier->berat_max !== null ? (float) $tier->berat_max : null,
            'harga_mentah' => (float) $tier->harga_mentah,
            'harga_matang' => (float) $tier->harga_matang,
            'cashback' => (float) $tier->cashback,
        ];

        return $withId ? ['id' => $tier->id, ...$payload] : $payload;
    }

    private function resolveTier(?MenuItem $menuItem, float $quantity): ?MenuItemPriceTier
    {
        if (! $menuItem || $menuItem->menu_type !== 'timbang_hidup') {
            return null;
        }

        $tiers = $menuItem->relationLoaded('tiers')
            ? $menuItem->tiers
            : $menuItem->tiers()->orderBy('sort_order')->get();

        return $tiers->first(static function (MenuItemPriceTier $tier) use ($quantity): bool {
            return $tier->matchesBerat($quantity);
        });
    }

    private function resolveUnitPrice(
        ?MenuItem $menuItem,
        ?MenuItemPriceTier $tier,
        string $kondisiProduk,
        mixed $resolvedVariant,
    ): ?float {
        if (! $menuItem) {
            return null;
        }

        if ($menuItem->menu_type === 'timbang_hidup') {
            if (! $tier) {
                return null;
            }

            return $kondisiProduk === 'mateng'
                ? (float) $tier->harga_matang
                : (float) $tier->harga_mentah;
        }

        if ($resolvedVariant !== null) {
            return (float) $resolvedVariant->harga;
        }

        return $menuItem->min_price !== null ? (float) $menuItem->min_price : null;
    }

    /**
     * @return array{adat_parts: array<int, string>, adat_notes: string|null, notes: string|null}
     */
    private function parseSummaryNotes(?string $notes): array
    {
        if ($notes === null || trim($notes) === '') {
            return [
                'adat_parts' => [],
                'adat_notes' => null,
                'notes' => null,
            ];
        }

        $adatParts = [];
        $adatNotes = null;
        $userNotes = null;
        $lines = preg_split('/\R/u', trim($notes)) ?: [];

        foreach ($lines as $line) {
            foreach (['Batak detail: ', 'Nias detail: '] as $prefix) {
                if (str_starts_with($line, $prefix)) {
                    $adatParts = $this->parseAdatParts(str_replace($prefix, '', $line));
                }
            }

            if (str_starts_with($line, 'Sisa daging: ')) {
                $adatNotes = trim(str_replace('Sisa daging: ', '', $line));
            }

            if (str_starts_with($line, 'Catatan: ')) {
                $userNotes = trim(str_replace('Catatan: ', '', $line));
            }
        }

        return [
            'adat_parts' => $adatParts,
            'adat_notes' => $adatNotes,
            'notes' => $userNotes,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function parseAdatParts(string $value): array
    {
        $parts = array_map(static function (string $part): string {
            $cleanPart = trim($part);

            return self::ADAT_LABEL_TO_CODE[$cleanPart] ?? $cleanPart;
        }, explode(',', trim($value)));

        return array_values(array_filter($parts));
    }

    private function resolveAdatGroup(?string $adatType): ?string
    {
        return in_array($adatType, ['batak', 'nias', 'tanpa_adat', 'lainnya'], true)
            ? $adatType
            : null;
    }
}
