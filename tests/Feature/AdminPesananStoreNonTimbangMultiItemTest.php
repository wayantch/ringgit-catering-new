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

it('stores admin pesanan with multiple non timbang items', function (): void {
    $notesToken = 'Pesanan multi non timbang '.Str::lower(Str::random(8));

    $admin = User::factory()->admin()->create([
        'email' => 'admin-non-timbang-'.Str::lower(Str::random(8)).'@example.com',
    ]);

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

    $paketPass = MenuItem::create([
        'category_id' => $olahanCategory->id,
        'name' => 'Paket pass Multi',
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
        'sort_order' => 10,
    ]);

    $paketNapass = MenuItem::create([
        'category_id' => $olahanCategory->id,
        'name' => 'Paket Napass Multi',
        'description' => null,
        'image' => null,
        'menu_type' => 'eceran',
        'sub_type' => 'paket_nasi_box',
        'babi_mentah_price' => null,
        'babi_matang_price' => null,
        'is_bundle' => true,
        'bundle_desc' => null,
        'free_ongkir_km' => null,
        'ongkir_subsidi' => null,
        'is_available' => true,
        'sort_order' => 11,
    ]);

    $response = $this
        ->actingAs($admin)
        ->post(route('admin.pesanan.store'), [
            'customer_type' => 'walkin',
            'customer_name' => 'Walkin Multi Non Timbang',
            'customer_phone' => '081234567890',
            'customer_email' => null,
            'order_type' => 'takeaway',
            'booking_date' => now()->toDateString(),
            'pickup_time' => '11:30',
            'delivery_time' => null,
            'delivery_address' => null,
            'notes' => $notesToken,
            'payment_method' => 'full',
            'items' => [
                [
                    'menu_item_id' => $paketPass->hashid,
                    'menu_name' => $paketPass->name,
                    'menu_category_type' => 'eceran',
                    'menu_unit' => 'paket',
                    'menu_image' => null,
                    'base_price' => null,
                    'cashback' => null,
                    'kondisi_produk' => 'satuan',
                    'adat_type' => null,
                    'qty' => 1,
                    'price' => 430000,
                    'notes' => 'Item non timbang pertama',
                ],
                [
                    'menu_item_id' => $paketNapass->hashid,
                    'menu_name' => $paketNapass->name,
                    'menu_category_type' => 'eceran',
                    'menu_unit' => 'box',
                    'menu_image' => null,
                    'base_price' => null,
                    'cashback' => null,
                    'kondisi_produk' => 'satuan',
                    'adat_type' => null,
                    'qty' => 2,
                    'price' => 55000,
                    'notes' => 'Item non timbang kedua',
                ],
            ],
        ]);

    $response->assertRedirect();

    $order = Order::query()
        ->where('created_by', $admin->id)
        ->where('notes', $notesToken)
        ->latest('id')
        ->first();

    expect($order)->not->toBeNull()
        ->and((float) $order?->subtotal)->toBe(540000.0)
        ->and((float) $order?->total_amount)->toBeGreaterThan(540000.0);

    $orderItems = OrderItem::query()->where('order_id', $order?->id)->get();

    expect($orderItems)->toHaveCount(2)
        ->and($orderItems->pluck('kondisi_produk')->all())->toEqualCanonicalizing(['satuan', 'satuan'])
        ->and($orderItems->pluck('menu_category_type')->all())->toEqualCanonicalizing(['eceran', 'eceran']);
});
