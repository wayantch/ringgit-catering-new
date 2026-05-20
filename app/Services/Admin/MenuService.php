<?php

namespace App\Services\Admin;

use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MenuService
{
    private const FIXED_PRICE_SUB_TYPES = [
        'paket_pass',
        'paket_nasi_box',
        'babi_adat',
    ];

    private const SUB_TYPE_MENU_NAMES = [
        'paket_pass' => 'Paket Pass',
        'paket_nasi_box' => 'Paket Napass',
        'babi_adat' => 'Babi Adat',
    ];

    public function getPaginatedMenus(array $filters): LengthAwarePaginator
    {
        return MenuItem::query()
            ->with(['tiers', 'variants'])
            ->when($filters['search'] ?? null, function ($query, $search): void {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(($filters['is_available'] ?? '') !== '', function ($query) use ($filters): void {
                $query->where('is_available', $filters['is_available'] === '1');
            })
            ->latest('id')
            ->paginate(15)
            ->through(function (MenuItem $item): array {
                return [
                    'id' => $item->hashid,
                    'name' => $item->name,
                    'description' => $item->description,
                    'image' => $item->image,
                    'image_url' => $item->image_url,
                    'menu_type' => $item->menu_type,
                    'sub_type' => $item->sub_type,
                    'babi_mentah_price' => $item->babi_mentah_price,
                    'babi_matang_price' => $item->babi_matang_price,
                    'is_bundle' => $item->is_bundle,
                    'bundle_desc' => $item->bundle_desc,
                    'free_ongkir_km' => $item->free_ongkir_km,
                    'ongkir_subsidi' => $item->ongkir_subsidi,
                    'min_price' => $item->min_price,
                    'is_available' => $item->is_available,
                    'sort_order' => $item->sort_order,
                    'tiers' => $item->tiers->map(static function (MenuItemPriceTier $tier): array {
                        return [
                            'id' => $tier->id,
                            'kode' => $tier->kode,
                            'is_half' => $tier->is_half,
                            'berat_min' => $tier->berat_min,
                            'berat_max' => $tier->berat_max,
                            'harga_mentah' => $tier->harga_mentah,
                            'harga_matang' => $tier->harga_matang,
                            'cashback' => $tier->cashback,
                            'sort_order' => $tier->sort_order,
                        ];
                    })->values(),
                    'variants' => $item->variants->map(static function (MenuItemVariant $variant): array {
                        return [
                            'id' => $variant->id,
                            'label' => $variant->label,
                            'harga' => $variant->harga,
                            'sort_order' => $variant->sort_order,
                        ];
                    })->values(),
                ];
            })
            ->withQueryString();
    }

    public function createItem(array $data): MenuItem
    {
        return DB::transaction(function () use ($data): MenuItem {
            $payload = $this->extractBaseData($data);

            if (($data['image'] ?? null) instanceof UploadedFile) {
                $payload['image'] = $data['image']->store('menus', 'public');
            }

            $item = MenuItem::create($payload);
            $this->syncChildItems($item, $data);

            return $item->fresh(['tiers', 'variants']);
        });
    }

    public function updateItem(MenuItem $item, array $data): MenuItem
    {
        return DB::transaction(function () use ($item, $data): MenuItem {
            $payload = $this->extractBaseData($data);

            if (($data['image'] ?? null) instanceof UploadedFile) {
                if ($item->image !== null) {
                    Storage::disk('public')->delete($item->image);
                }

                $payload['image'] = $data['image']->store('menus', 'public');
            }

            $item->update($payload);
            $item->tiers()->delete();
            $item->variants()->delete();
            $this->syncChildItems($item, $data);

            return $item->fresh(['tiers', 'variants']);
        });
    }

    public function toggleAvailability(MenuItem $item): MenuItem
    {
        $item->update([
            'is_available' => ! $item->is_available,
        ]);

        return $item->refresh();
    }

    public function deleteItem(MenuItem $item): void
    {
        if ($item->image !== null) {
            Storage::disk('public')->delete($item->image);
        }

        $item->delete();
    }

    public function resolveHarga(MenuItem $item, float $berat, string $kondisi): ?array
    {
        if ($item->menu_type !== 'timbang_hidup') {
            return null;
        }

        $tiers = $item->relationLoaded('tiers')
            ? $item->tiers
            : $item->tiers()->orderBy('sort_order')->get();

        $tier = $tiers->first(static function (MenuItemPriceTier $tier) use ($berat): bool {
            return $tier->matchesBerat($berat);
        });

        if (! $tier) {
            return null;
        }

        $harga = $kondisi === 'matang'
            ? (float) $tier->harga_matang
            : (float) $tier->harga_mentah;

        return [
            'kode' => $tier->kode,
            'is_half' => $tier->is_half,
            'harga_kg' => $harga,
            'cashback' => (float) $tier->cashback,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function extractBaseData(array $data): array
    {
        $payload = [
            'category_id' => null,
            'name' => $this->resolveMenuName($data),
            'menu_type' => $data['menu_type'],
            'sub_type' => $data['sub_type'] ?? null,
            'description' => $data['description'] ?? null,
            'is_bundle' => (bool) ($data['is_bundle'] ?? false),
            'bundle_desc' => $data['bundle_desc'] ?? null,
            'free_ongkir_km' => $this->normalizeNullableInteger($data['free_ongkir_km'] ?? null),
            'ongkir_subsidi' => $this->normalizeSubsidi($data['ongkir_subsidi'] ?? null),
            'babi_mentah_price' => $this->normalizeNullableDecimal($data['babi_mentah_price'] ?? null),
            'babi_matang_price' => $this->normalizeNullableDecimal($data['babi_matang_price'] ?? null),
            'is_available' => (bool) ($data['is_available'] ?? true),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];

        if (! in_array($payload['sub_type'] ?? null, self::FIXED_PRICE_SUB_TYPES, true)) {
            $payload['is_bundle'] = false;
            $payload['bundle_desc'] = null;
            $payload['free_ongkir_km'] = null;
        }

        return $payload;
    }

    private function normalizeNullableDecimal(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function syncChildItems(MenuItem $item, array $data): void
    {
        if (($data['menu_type'] ?? null) === 'timbang_hidup') {
            foreach (($data['tiers'] ?? []) as $sortOrder => $tier) {
                $item->tiers()->create([
                    'kode' => $tier['kode'],
                    'is_half' => (bool) ($tier['is_half'] ?? false),
                    'berat_min' => $tier['berat_min'],
                    'berat_max' => $tier['berat_max'] ?? null,
                    'harga_mentah' => $tier['harga_mentah'],
                    'harga_matang' => $tier['harga_matang'],
                    'cashback' => $tier['cashback'] ?? 0,
                    'sort_order' => $tier['sort_order'] ?? $sortOrder,
                ]);
            }

            return;
        }

        foreach (($data['variants'] ?? []) as $sortOrder => $variant) {
            $item->variants()->create([
                'label' => $variant['label'],
                'harga' => $variant['harga'],
                'sort_order' => $variant['sort_order'] ?? $sortOrder,
            ]);
        }
    }

    private function normalizeSubsidi(mixed $subsidi): ?array
    {
        if (! is_array($subsidi) || $subsidi === []) {
            return null;
        }

        $normalized = [];

        foreach ($subsidi as $row) {
            if (! is_array($row)) {
                continue;
            }

            $normalized[] = [
                'min_kg' => $row['min_kg'] ?? null,
                'max_kg' => $row['max_kg'] ?? null,
                'max_subsidi' => $row['max_subsidi'] ?? null,
            ];
        }

        return $normalized === [] ? null : $normalized;
    }

    private function normalizeNullableInteger(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolveMenuName(array $data): string
    {
        $submittedName = trim((string) ($data['name'] ?? ''));

        if (($data['menu_type'] ?? null) !== 'eceran') {
            return $submittedName;
        }

        if ($submittedName !== '') {
            return $submittedName;
        }

        $subType = (string) ($data['sub_type'] ?? '');

        return self::SUB_TYPE_MENU_NAMES[$subType] ?? 'Menu Eceran';
    }
}
