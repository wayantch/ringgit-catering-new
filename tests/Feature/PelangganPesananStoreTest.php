<?php

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Pelanggan\PesananService;

beforeEach(function (): void {
    config()->set('database.default', 'mysql');
    config()->set('database.connections.mysql.database', 'ringgit-catering-db');
    config()->set('database.connections.mysql.host', '127.0.0.1');
    config()->set('database.connections.mysql.port', '3306');
});

it('stores the menu category snapshot when creating an order from cart items without a category relation', function (): void {
    $customer = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $menuItem = MenuItem::create([
        'category_id' => null,
        'name' => 'Kambing Guling',
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
        'kode' => 'A',
        'is_half' => false,
        'berat_min' => 20,
        'berat_max' => 29,
        'harga_mentah' => 100000,
        'harga_matang' => 110000,
        'cashback' => 0,
        'sort_order' => 1,
    ]);

    Cart::create([
        'user_id' => $customer->id,
        'menu_item_id' => $menuItem->id,
        'kondisi_produk' => 'mateng',
        'adat_type' => 'batak',
        'quantity' => 25,
        'notes' => 'Test checkout',
    ]);

    $order = app(PesananService::class)->create($customer, [
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '10:00',
        'delivery_address' => null,
        'notes' => 'Test checkout',
        'phone' => '081234567890',
        'use_loyalty_discount' => false,
    ]);

    expect($order)->toBeInstanceOf(Order::class);

    $orderItem = OrderItem::query()->where('order_id', $order->id)->first();

    expect($orderItem)->not->toBeNull()
        ->and($orderItem?->menu_category_type)->toBe('timbang_hidup')
        ->and((float) $orderItem?->unit_price)->toBe(110000.0)
        ->and((float) $orderItem?->subtotal)->toBe(2750000.0);
});
