<?php

use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Pelanggan\PesananService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('includes a cashback-adjusted total in the user order detail payload', function (): void {
    $customer = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $menuItem = MenuItem::create([
        'category_id' => null,
        'name' => 'Babi Cashback',
        'description' => 'Menu timbang hidup',
        'image' => null,
        'base_price' => null,
        'unit' => 'kg',
        'menu_type' => 'timbang_hidup',
        'sub_type' => null,
        'is_bundle' => false,
        'bundle_desc' => null,
        'free_ongkir_km' => null,
        'ongkir_subsidi' => null,
        'is_available' => true,
        'sort_order' => 0,
    ]);

    MenuItemPriceTier::create([
        'menu_item_id' => $menuItem->id,
        'kode' => 'B',
        'is_half' => false,
        'berat_min' => 25,
        'berat_max' => 49,
        'harga_mentah' => 88000,
        'harga_matang' => 108000,
        'cashback' => 75000,
        'sort_order' => 1,
    ]);

    $order = Order::create([
        'user_id' => $customer->id,
        'order_number' => 'ORD-'.now()->format('YmdHisv').'-'.Str::uuid()->toString(),
        'source' => 'pembeli',
        'customer_name' => 'Pelanggan Test',
        'customer_phone' => '08123456789',
        'customer_email' => 'pelanggan@example.com',
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '10:00',
        'order_status' => 'baru',
        'subtotal' => 3240000,
        'unique_code' => 555,
        'total_amount' => 3240000,
        'dp_amount' => 810000,
        'remaining_amount' => 2430000,
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'menu_item_id' => $menuItem->id,
        'menu_name' => 'Babi Cashback',
        'menu_category_type' => 'timbang_hidup',
        'menu_unit' => 'kg',
        'kondisi_produk' => 'mateng',
        'adat_type' => 'batak',
        'quantity' => 30,
        'unit_price' => 108000,
        'subtotal' => 3240000,
        'notes' => null,
    ]);

    $detail = app(PesananService::class)->getDetail($order);

    expect($detail['cashback_eligible'])->toBeTrue()
        ->and($detail['subtotal'])->toBe('3240000.00')
        ->and($detail['unique_code'])->toBe(555)
        ->and($detail['total_cashback'])->toBe(75000.0)
        ->and($detail['total_after_cashback'])->toBe(3165000.0)
        ->and($detail['items'][0]['menu_category_type'])->toBe('timbang_hidup')
        ->and($detail['items'][0]['menu_sub_type'])->toBeNull();
});
