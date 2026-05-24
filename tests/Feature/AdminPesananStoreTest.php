<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('stores admin pesanan with multiple items', function (): void {
    $admin = User::factory()->admin()->create([
        'email' => 'admin-store-'.Str::lower(Str::random(8)).'@example.com',
    ]);

    $timbangCategory = MenuCategory::query()->firstOrCreate(
        ['type' => 'timbang_hidup'],
        [
            'name' => 'Timbang Hidup',
            'slug' => 'timbang-hidup-'.Str::lower(Str::random(8)),
            'description' => null,
            'sort_order' => 1,
            'is_active' => true,
        ],
    );

    $olahanCategory = MenuCategory::query()->firstOrCreate(
        ['type' => 'olahan'],
        [
            'name' => 'Olahan',
            'slug' => 'olahan-'.Str::lower(Str::random(8)),
            'description' => null,
            'sort_order' => 2,
            'is_active' => true,
        ],
    );

    $timbangItem = MenuItem::create([
        'category_id' => $timbangCategory->id,
        'name' => 'Timbang Hidup A',
        'description' => null,
        'image' => null,
        'menu_type' => 'timbang_hidup',
        'sub_type' => null,
        'babi_mentah_price' => null,
        'babi_matang_price' => null,
        'is_bundle' => false,
        'bundle_desc' => null,
        'free_ongkir_km' => null,
        'ongkir_subsidi' => null,
        'is_available' => true,
        'sort_order' => 1,
    ]);

    $olahanItem = MenuItem::create([
        'category_id' => $olahanCategory->id,
        'name' => 'Paket Napass',
        'description' => null,
        'image' => null,
        'menu_type' => 'eceran',
        'sub_type' => 'paket_pass',
        'babi_mentah_price' => null,
        'babi_matang_price' => null,
        'is_bundle' => true,
        'bundle_desc' => null,
        'free_ongkir_km' => null,
        'ongkir_subsidi' => null,
        'is_available' => true,
        'sort_order' => 2,
    ]);

    $response = $this
        ->actingAs($admin)
        ->post(route('admin.pesanan.store'), [
            'customer_type' => 'walkin',
            'customer_name' => 'Pelanggan Walk-in',
            'customer_phone' => '081234567890',
            'customer_email' => null,
            'order_type' => 'takeaway',
            'booking_date' => now()->toDateString(),
            'pickup_time' => '10:30',
            'delivery_time' => null,
            'delivery_address' => null,
            'notes' => 'Pesanan dua item',
            'payment_method' => 'full',
            'items' => [
                [
                    'menu_item_id' => $timbangItem->hashid,
                    'menu_name' => $timbangItem->name,
                    'menu_category_type' => 'timbang_hidup',
                    'menu_unit' => 'kg',
                    'menu_image' => null,
                    'base_price' => null,
                    'cashback' => 100000,
                    'kondisi_produk' => 'mentah',
                    'adat_type' => null,
                    'qty' => 50,
                    'price' => 85000,
                    'notes' => 'Item pertama',
                ],
                [
                    'menu_item_id' => $olahanItem->hashid,
                    'menu_name' => $olahanItem->name,
                    'menu_category_type' => 'eceran',
                    'menu_unit' => 'paket',
                    'menu_image' => null,
                    'base_price' => null,
                    'cashback' => null,
                    'kondisi_produk' => 'satuan',
                    'adat_type' => null,
                    'qty' => 2,
                    'price' => 55000,
                    'notes' => 'Item kedua',
                ],
            ],
        ]);

    $response->assertRedirect();

    $order = Order::query()->where('customer_name', 'Pelanggan Walk-in')->first();

    expect($order)->not->toBeNull()
        ->and($order?->source)->toBe('admin')
        ->and((float) $order?->subtotal)->toBe(4360000.0)
        ->and((float) $order?->total_amount)->toBeGreaterThan(4360000.0);

    $orderItems = OrderItem::query()->where('order_id', $order?->id)->get();

    expect($orderItems)->toHaveCount(2)
        ->and($orderItems->pluck('menu_name')->all())->toEqualCanonicalizing([
            'Timbang Hidup A',
            'Paket Napass',
        ]);
});
