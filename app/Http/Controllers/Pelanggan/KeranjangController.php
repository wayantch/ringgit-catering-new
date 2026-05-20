<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StoreCartItemRequest;
use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Services\Pelanggan\KeranjangService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeranjangController extends Controller
{
    public function index(Request $request, KeranjangService $service): Response
    {
        $user = $request->user();
        $cartItems = $service->getCartItems($user);
        $summary = $service->getCartSummary($user);

        return Inertia::render('Pelanggan/Keranjang', [
            'cartItems' => $cartItems->map(fn ($item) => $this->mapCartItem($item)),
            'summary' => $summary,
        ]);
    }

    public function store(StoreCartItemRequest $request, KeranjangService $service): RedirectResponse
    {
        $validated = $request->validated();

        $menuItem = MenuItem::findByHashid($validated['menu_item_id']);
        $service->addItem($request->user(), $menuItem, $validated);

        return back()->with('success', 'Item ditambahkan ke keranjang');
    }

    public function update(Request $request, Cart $cart, KeranjangService $service): RedirectResponse
    {
        $this->authorize('update', $cart);

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.5',
            'adat_type' => 'nullable|string',
            'portion' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $service->updateItem($cart, $validated);

        return back()->with('success', 'Keranjang diperbarui');
    }

    public function destroy(Request $request, Cart $cart, KeranjangService $service): RedirectResponse
    {
        $this->authorize('delete', $cart);

        $service->removeItem($cart);

        return back()->with('success', 'Item dihapus dari keranjang');
    }

    /**
     * @return array<string, mixed>
     */
    private function mapCartItem(Cart $item): array
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
                'tiers' => $tiers->map(static function (MenuItemPriceTier $tier): array {
                    return [
                        'id' => $tier->id,
                        'kode' => $tier->kode,
                        'is_half' => $tier->is_half,
                        'berat_min' => (float) $tier->berat_min,
                        'berat_max' => $tier->berat_max !== null ? (float) $tier->berat_max : null,
                        'harga_mentah' => (float) $tier->harga_mentah,
                        'harga_matang' => (float) $tier->harga_matang,
                        'cashback' => (float) $tier->cashback,
                    ];
                })->values(),
                'variants' => $variants->map(static function ($variant): array {
                    return [
                        'id' => $variant->id,
                        'label' => $variant->label,
                        'harga' => (float) $variant->harga,
                    ];
                })->values(),
            ],
            'tier' => $tier ? [
                'kode' => $tier->kode,
                'is_half' => $tier->is_half,
                'berat_min' => (float) $tier->berat_min,
                'berat_max' => $tier->berat_max !== null ? (float) $tier->berat_max : null,
                'harga_mentah' => (float) $tier->harga_mentah,
                'harga_matang' => (float) $tier->harga_matang,
                'cashback' => (float) $tier->cashback,
            ] : null,
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
        $labelToCode = [
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

        foreach ($lines as $line) {
            if (str_starts_with($line, 'Batak detail: ')) {
                $adatParts = array_values(array_filter(array_map(static function (string $part) use ($labelToCode): string {
                    $cleanPart = trim($part);

                    return $labelToCode[$cleanPart] ?? $cleanPart;
                }, explode(',', trim(str_replace('Batak detail: ', '', $line))))));
            }

            if (str_starts_with($line, 'Nias detail: ')) {
                $adatParts = array_values(array_filter(array_map(static function (string $part) use ($labelToCode): string {
                    $cleanPart = trim($part);

                    return $labelToCode[$cleanPart] ?? $cleanPart;
                }, explode(',', trim(str_replace('Nias detail: ', '', $line))))));
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

    private function resolveAdatGroup(?string $adatType): ?string
    {
        return in_array($adatType, ['batak', 'nias', 'tanpa_adat', 'lainnya'], true)
            ? $adatType
            : null;
    }
}
