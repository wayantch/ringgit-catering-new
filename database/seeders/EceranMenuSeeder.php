<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EceranMenuSeeder extends Seeder
{
    /**
     * Names used by the previous version of this seeder, when babi adat was split
     * into one item per kondisi. They are soft deleted so past orders keep their menu.
     *
     * @var array<int, string>
     */
    private const RETIRED_ITEM_NAMES = [
        'NAMARGOAR (matang)',
        'NAMARGOAR (mentah)',
    ];

    /**
     * Eceran catalog: paket, nasi box and babi adat.
     *
     * Paket and nasi box are priced through a single variant. Babi adat is priced per
     * kondisi through babi_mentah_price / babi_matang_price, so the customer picks
     * mentah or matang on the same item.
     *
     * @var array<int, array{name: string, sub_type: string, unit: string, description: string, is_bundle?: bool, bundle_desc?: string, free_ongkir_km?: int, harga?: int, babi_mentah_price?: int|null, babi_matang_price?: int}>
     */
    private const MENU_ITEMS = [
        [
            'name' => 'Paket PASS',
            'sub_type' => 'paket_pass',
            'unit' => 'paket',
            'description' => "Menggunakan daging babi muda yang pastinya akan membuat masakan jadi terasa lebih NIKMAT!!\n\n• PASS untuk 8 porsi\n• GRATIS ONGKIR (maksimal jarak 10 km)",
            'is_bundle' => true,
            'bundle_desc' => 'Panggang 1000 ml, Saksang 1000 ml, Sop 1000 ml. Tiap menu bisa untuk 8 porsi.',
            'free_ongkir_km' => 10,
            'harga' => 430000,
        ],
        [
            'name' => 'Paket PASS mini',
            'sub_type' => 'paket_pass',
            'unit' => 'paket',
            'description' => 'Menggunakan daging babi muda yang pastinya akan membuat masakan jadi terasa lebih NIKMAT!!',
            'is_bundle' => true,
            'free_ongkir_km' => 10,
            'harga' => 225000,
        ],
        [
            'name' => 'PANGGANG BOX',
            'sub_type' => 'paket_pass',
            'unit' => 'box',
            'description' => 'Menggunakan daging babi muda dipadu dengan sambal andaliman khas Ringgit',
            'harga' => 220000,
        ],
        [
            'name' => 'Paket NAPASS',
            'sub_type' => 'paket_nasi_box',
            'unit' => 'porsi',
            'description' => 'Menggunakan daging babi muda dipadu dengan bumbu racikan KONG RINGGIT membuat masakan jadi terasa NIKMAT!!',
            'is_bundle' => true,
            'bundle_desc' => 'Nasi, Saksang, Panggang, Sop',
            'harga' => 55000,
        ],
        [
            'name' => 'NASI BIPANG',
            'sub_type' => 'paket_nasi_box',
            'unit' => 'porsi',
            'description' => 'Menggunakan daging babi muda dipadu dengan bumbu racikan khas',
            'harga' => 35000,
        ],
        [
            'name' => 'NASI SAKSANG',
            'sub_type' => 'paket_nasi_box',
            'unit' => 'porsi',
            'description' => 'Menggunakan daging babi muda dipadu dengan bumbu racikan KONG RINGGIT membuat masakan jadi terasa NIKMAT!!',
            'is_bundle' => true,
            'bundle_desc' => 'Nasi, Saksang, Sop',
            'harga' => 30000,
        ],
        [
            'name' => 'NAMARGOAR',
            'sub_type' => 'babi_adat',
            'unit' => 'ekor',
            'description' => "• Namargoar adat batak\n• Harga sudah termasuk jeroan\n• Timbang hidup kisaran 25Kg",
            'babi_mentah_price' => 975000,
            'babi_matang_price' => 1075000,
        ],
        [
            'name' => 'SIMBI-SIMBI',
            'sub_type' => 'babi_adat',
            'unit' => 'ekor',
            'description' => "• Simbi-simbi adat Nias\n• Panjang jambar sampai ketiak",
            // Harga mentah belum ditentukan; lengkapi dari halaman admin menu.
            'babi_mentah_price' => null,
            'babi_matang_price' => 1075000,
        ],
    ];

    /**
     * Run the database seeds. Safe to run repeatedly: items are matched by name.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $eceranCategory = MenuCategory::updateOrCreate(
                ['type' => 'eceran'],
                [
                    'name' => 'Eceran',
                    'slug' => 'eceran',
                    'description' => 'Paket, nasi box, dan babi adat',
                    'sort_order' => 2,
                    'is_active' => true,
                ],
            );

            MenuItem::query()->whereIn('name', self::RETIRED_ITEM_NAMES)->delete();

            foreach (self::MENU_ITEMS as $sortOrder => $item) {
                $menuItem = MenuItem::withTrashed()->updateOrCreate(
                    ['name' => $item['name']],
                    [
                        'category_id' => $eceranCategory->id,
                        'menu_type' => 'eceran',
                        'sub_type' => $item['sub_type'],
                        'unit' => $item['unit'],
                        'description' => $item['description'],
                        'is_bundle' => $item['is_bundle'] ?? false,
                        'bundle_desc' => $item['bundle_desc'] ?? null,
                        'free_ongkir_km' => $item['free_ongkir_km'] ?? null,
                        'babi_mentah_price' => $item['babi_mentah_price'] ?? null,
                        'babi_matang_price' => $item['babi_matang_price'] ?? null,
                        'is_available' => true,
                        'sort_order' => $sortOrder + 1,
                    ],
                );

                if ($menuItem->trashed()) {
                    $menuItem->restore();
                }

                $menuItem->variants()->delete();

                if (isset($item['harga'])) {
                    $menuItem->variants()->create([
                        'label' => $item['name'],
                        'harga' => $item['harga'],
                        'sort_order' => 1,
                    ]);
                }
            }
        });
    }
}
