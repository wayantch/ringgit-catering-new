<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Admin\PesananService;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('includes the current order status in the admin pesanan index payload', function (): void {
    User::factory()->create([
        'role' => 'admin',
    ]);

    $order = Order::create([
        'source' => 'admin',
        'order_number' => 'ORD-20260519-INDEX-001',
        'customer_name' => 'Pelanggan Contoh',
        'customer_phone' => '08123456789',
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '10:00',
        'order_status' => 'diproses',
        'subtotal' => 100000,
        'total_amount' => 100000,
        'dp_amount' => 25000,
        'remaining_amount' => 75000,
    ]);

    $payload = app(PesananService::class)->getPaginatedOrders([
        'search' => $order->order_number,
    ], 15, 1);

    expect($payload['data'])->toHaveCount(1)
        ->and($payload['data'][0]['status'])->toBe('diproses')
        ->and($payload['data'][0]['order_status'])->toBe('diproses');
});

it('marks dp orders as dp and keeps cashback off the indexed total', function (): void {
    User::factory()->create([
        'role' => 'admin',
    ]);

    $category = MenuCategory::create([
        'name' => 'Timbang Hidup',
        'type' => 'timbang_hidup',
        'slug' => 'timbang-hidup-index-test',
        'sort_order' => 1,
        'is_active' => true,
    ]);

    $menuItem = MenuItem::create([
        'category_id' => $category->id,
        'name' => 'Babi Test Cashback',
        'base_price' => 100000,
        'unit' => 'kg',
        'is_available' => true,
        'sort_order' => 1,
        'menu_type' => 'timbang_hidup',
    ]);

    MenuItemPriceTier::create([
        'menu_item_id' => $menuItem->id,
        'kode' => 'A',
        'is_half' => false,
        'berat_min' => 1,
        'berat_max' => 10,
        'harga_mentah' => 100000,
        'harga_matang' => 110000,
        'cashback' => 15000,
        'sort_order' => 1,
    ]);

    $order = Order::create([
        'source' => 'admin',
        'order_number' => 'ORD-20260519-INDEX-002',
        'customer_name' => 'Pelanggan DP',
        'customer_phone' => '08123456780',
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '10:30',
        'order_status' => 'baru',
        'subtotal' => 100000,
        'total_amount' => 100000,
        'dp_amount' => 25000,
        'remaining_amount' => 75000,
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'menu_item_id' => $menuItem->id,
        'kondisi_produk' => 'mentah',
        'quantity' => 1,
        'unit_price' => 100000,
        'subtotal' => 100000,
    ]);

    $payload = app(PesananService::class)->getPaginatedOrders([
        'search' => $order->order_number,
    ], 15, 1);

    expect($payload['data'])->toHaveCount(1)
        ->and($payload['data'][0]['payment_method'])->toBe('dp')
        ->and($payload['data'][0]['total_after_cashback'])->toBe(100000.0);
});
