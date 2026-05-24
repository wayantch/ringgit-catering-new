<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    private const FALLBACK_IMAGE = 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=1200';

    private const OLD_ITEM_NAMES = [
        'Daging Babi Segar',
        'Usus Babi',
        'Jantung Babi',
        'Saksang',
        'Panggang Babi',
        'Sop Tulang Babi',
        'Saksang Porsi',
        'Panggang Porsi',
        'Sop Tulang Porsi',
        'Paket PASS',
        'Paket PASS mini',
        'PANGGANG BOX',
        'Paket NAPASS',
        'NASI BIPANG',
        'NASI SAKSANG',
        'NAMARGOAR (matang)',
        'NAMARGOAR (mentah)',
        'SIMBI-SIMBI',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->purgeExistingSeedData();

            $timbangHidupCategory = MenuCategory::updateOrCreate(
                ['type' => 'timbang_hidup'],
                [
                    'name' => 'Timbang Hidup',
                    'slug' => Str::slug('Timbang Hidup'),
                    'description' => 'Menu timbang hidup untuk pelanggan',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            );

            $eceranCategory = MenuCategory::updateOrCreate(
                ['type' => 'eceran'],
                [
                    'name' => 'Eceran',
                    'slug' => Str::slug('Eceran'),
                    'description' => 'Menu eceran untuk pelanggan',
                    'sort_order' => 2,
                    'is_active' => true,
                ]
            );

            $timbangHidup = MenuItem::updateOrCreate(
                ['name' => 'Timbang Hidup'],
                [
                    'category_id' => $timbangHidupCategory->id,
                    'description' => 'Daging babi timbang hidup dengan pilihan tier A, B, dan C.',
                    'image' => self::FALLBACK_IMAGE,
                    'base_price' => null,
                    'unit' => 'kg',
                    'stock_quantity' => 100,
                    'min_order_hours' => 24,
                    'menu_type' => 'timbang_hidup',
                    'sub_type' => null,
                    'is_bundle' => false,
                    'bundle_desc' => null,
                    'free_ongkir_km' => null,
                    'ongkir_subsidi' => null,
                    'babi_mentah_price' => null,
                    'babi_matang_price' => null,
                    'is_available' => true,
                    'sort_order' => 1,
                ]
            );

            $timbangHidup->tiers()->delete();
            $this->seedTimbangHidupTiers($timbangHidup);

            $paketPass = MenuItem::updateOrCreate(
                ['name' => 'Paket Pass'],
                [
                    'category_id' => $eceranCategory->id,
                    'description' => 'Paket Pass isi 3 item untuk sajian praktis.',
                    'image' => self::FALLBACK_IMAGE,
                    'base_price' => 430000,
                    'unit' => 'paket',
                    'stock_quantity' => 100,
                    'min_order_hours' => 72,
                    'menu_type' => 'eceran',
                    'sub_type' => 'paket_pass',
                    'is_bundle' => true,
                    'bundle_desc' => 'Isi 3 item: lauk utama, pendamping, dan sambal.',
                    'free_ongkir_km' => 10,
                    'ongkir_subsidi' => null,
                    'babi_mentah_price' => null,
                    'babi_matang_price' => null,
                    'is_available' => true,
                    'sort_order' => 1,
                ]
            );

            $paketPass->variants()->delete();
            $this->seedVariants($paketPass, [
                ['label' => 'Paket Pass', 'harga' => 430000],
            ]);

            $paketNapass = MenuItem::updateOrCreate(
                ['name' => 'Paket Napass'],
                [
                    'category_id' => $eceranCategory->id,
                    'description' => 'Paket Napass isi 2 item untuk porsi lebih ringkas.',
                    'image' => self::FALLBACK_IMAGE,
                    'base_price' => 275000,
                    'unit' => 'paket',
                    'stock_quantity' => 100,
                    'min_order_hours' => 72,
                    'menu_type' => 'eceran',
                    'sub_type' => 'paket_nasi_box',
                    'is_bundle' => true,
                    'bundle_desc' => 'Isi 2 item: nasi dan lauk.',
                    'free_ongkir_km' => 10,
                    'ongkir_subsidi' => null,
                    'babi_mentah_price' => null,
                    'babi_matang_price' => null,
                    'is_available' => true,
                    'sort_order' => 2,
                ]
            );

            $paketNapass->variants()->delete();
            $this->seedVariants($paketNapass, [
                ['label' => 'Paket Napass', 'harga' => 275000],
            ]);

            $babiAdat = MenuItem::updateOrCreate(
                ['name' => 'Babi Adat'],
                [
                    'category_id' => $eceranCategory->id,
                    'description' => 'Babi adat isi 1 item untuk kebutuhan adat dan acara keluarga.',
                    'image' => self::FALLBACK_IMAGE,
                    'base_price' => null,
                    'unit' => 'paket',
                    'stock_quantity' => 100,
                    'min_order_hours' => 72,
                    'menu_type' => 'eceran',
                    'sub_type' => 'babi_adat',
                    'is_bundle' => true,
                    'bundle_desc' => 'Isi 1 item: pilihan babi adat.',
                    'free_ongkir_km' => 10,
                    'ongkir_subsidi' => null,
                    'babi_mentah_price' => 85000,
                    'babi_matang_price' => 95000,
                    'is_available' => true,
                    'sort_order' => 3,
                ]
            );

            $babiAdat->variants()->delete();
            $this->seedVariants($babiAdat, [
                ['label' => 'Babi Adat', 'harga' => 85000],
            ]);
        });
    }

    private function purgeExistingSeedData(): void
    {
        MenuItem::withTrashed()
            ->whereIn('name', self::OLD_ITEM_NAMES)
            ->forceDelete();

        MenuItemPriceTier::query()
            ->whereHas('menuItem', function ($query): void {
                $query->whereIn('name', ['Timbang Hidup']);
            })
            ->delete();

        MenuItemVariant::query()
            ->whereHas('menuItem', function ($query): void {
                $query->whereIn('name', ['Paket Pass', 'Paket Napass', 'Babi Adat']);
            })
            ->delete();
    }

    /**
     * @param  array<int, array{label: string, harga: int|float|string}>  $variants
     */
    private function seedVariants(MenuItem $item, array $variants): void
    {
        foreach ($variants as $index => $variant) {
            $item->variants()->create([
                'label' => $variant['label'],
                'harga' => $variant['harga'],
                'sort_order' => $index + 1,
            ]);
        }
    }

    /**
     * @param  array<int, array{kode: string, is_half: bool, berat_min: int|float|string, berat_max: int|float|string|null, harga_mentah: int|float|string, harga_matang: int|float|string, cashback: int|float|string}>  $tiers
     */
    private function seedTimbangHidupTiers(MenuItem $item, array $tiers = []): void
    {
        $tiers = $tiers !== [] ? $tiers : [
            ['kode' => 'A', 'is_half' => false, 'berat_min' => 10, 'berat_max' => 19.99, 'harga_mentah' => 95000, 'harga_matang' => 105000, 'cashback' => 50000],
            ['kode' => 'B', 'is_half' => false, 'berat_min' => 20, 'berat_max' => 49.99, 'harga_mentah' => 90000, 'harga_matang' => 100000, 'cashback' => 75000],
            ['kode' => 'C', 'is_half' => false, 'berat_min' => 50, 'berat_max' => null, 'harga_mentah' => 85000, 'harga_matang' => 95000, 'cashback' => 100000],
        ];

        foreach ($tiers as $index => $tier) {
            $item->tiers()->create([
                'kode' => $tier['kode'],
                'is_half' => $tier['is_half'],
                'berat_min' => $tier['berat_min'],
                'berat_max' => $tier['berat_max'],
                'harga_mentah' => $tier['harga_mentah'],
                'harga_matang' => $tier['harga_matang'],
                'cashback' => $tier['cashback'],
                'sort_order' => $index + 1,
            ]);
        }
    }
}
