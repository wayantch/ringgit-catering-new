<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentVerification;
use App\Models\User;
use App\Services\Admin\PesananService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

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
        'order_number' => 'ORD-'.now()->format('YmdHisv').'-'.Str::uuid()->toString(),
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

    $category = MenuCategory::firstOrCreate(
        ['type' => 'timbang_hidup'],
        [
            'name' => 'Timbang Hidup',
            'slug' => 'timbang-hidup-index-test-'.Str::uuid()->toString(),
            'sort_order' => 1,
            'is_active' => true,
        ],
    );

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
        'order_number' => 'ORD-'.now()->format('YmdHisv').'-'.Str::uuid()->toString(),
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
        'menu_name' => 'Babi Test Cashback',
        'menu_category_type' => 'timbang_hidup',
        'menu_unit' => 'kg',
        'kondisi_produk' => 'mentah',
        'adat_type' => 'batak',
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

it('keeps pembeli orders labeled as dp when the dp verification is already approved', function (): void {
    $customer = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $order = Order::create([
        'user_id' => $customer->id,
        'source' => 'pembeli',
        'order_number' => 'ORD-'.now()->format('YmdHisv').'-'.Str::uuid()->toString(),
        'customer_name' => 'Pelanggan DP Verified',
        'customer_phone' => '08123456782',
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '11:00',
        'order_status' => 'baru',
        'subtotal' => 200000,
        'total_amount' => 200000,
        'dp_amount' => 50000,
        'remaining_amount' => 150000,
    ]);

    PaymentVerification::create([
        'order_id' => $order->id,
        'payment_type' => 'dp',
        'amount' => 50000,
        'proof_image' => 'proofs/dp-approved.png',
        'status' => 'verified',
        'verified_at' => now(),
    ]);

    PaymentVerification::create([
        'order_id' => $order->id,
        'payment_type' => 'pelunasan',
        'amount' => 150000,
        'proof_image' => 'proofs/final-pending.png',
        'status' => 'pending',
    ]);

    $payload = app(PesananService::class)->getPaginatedOrders([
        'search' => $order->order_number,
    ], 15, 1);

    expect($payload['data'])->toHaveCount(1)
        ->and($payload['data'][0]['payment_method'])->toBe('dp');
});
