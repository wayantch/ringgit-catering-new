<?php

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\User;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('redirects checkout submission to the upload page with an inertia location response', function (): void {
    $customer = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $menuItem = MenuItem::create([
        'category_id' => null,
        'name' => 'Babi Timbang',
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

    $response = $this->actingAs($customer)
        ->withHeaders([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
            'Accept' => 'text/html, application/xhtml+xml',
        ])
        ->post(route('user.pesanan.store'), [
            'order_type' => 'takeaway',
            'booking_date' => now()->toDateString(),
            'booking_time' => '10:00',
            'delivery_address' => null,
            'notes' => 'Test checkout',
            'phone' => '081234567890',
            'use_loyalty_discount' => false,
        ]);

    $response->assertStatus(409);
    expect($response->headers->get('X-Inertia-Location'))
        ->not->toBeNull()
        ->and($response->headers->get('X-Inertia-Location'))
        ->toContain('/user/pesanan/')
        ->toContain('/upload');
});
