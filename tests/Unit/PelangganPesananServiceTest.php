<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\LoyaltyService;
use App\Services\Pelanggan\PesananService;

uses(Tests\TestCase::class);

it('builds cashback summary for timbang hidup customer orders', function (): void {
    $this->instance(LoyaltyService::class, Mockery::mock(LoyaltyService::class));

    $category = MenuCategory::make([
        'name' => 'Timbang Hidup',
        'type' => 'timbang_hidup',
        'slug' => 'timbang-hidup',
        'description' => null,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    $menuItem = MenuItem::make([
        'category_id' => 1,
        'name' => 'Babi Timbang',
        'description' => null,
        'image' => null,
        'base_price' => null,
        'unit' => 'kg',
        'menu_type' => 'timbang_hidup',
        'is_available' => true,
        'sort_order' => 1,
    ]);

    $menuItem->setRelation('category', $category);
    $menuItem->setRelation('tiers', collect([
        MenuItemPriceTier::make([
            'kode' => 'B',
            'is_half' => false,
            'berat_min' => 25,
            'berat_max' => 49,
            'harga_mentah' => 88000,
            'harga_matang' => 108000,
            'cashback' => 75000,
            'sort_order' => 1,
        ]),
    ]));

    $order = Order::make([
        'order_number' => 'ORD-20260517-00001',
        'source' => 'pembeli',
        'customer_name' => 'Pelanggan Test',
        'customer_phone' => '08123456789',
        'customer_email' => 'pelanggan@example.com',
        'order_type' => 'takeaway',
        'booking_date' => '2026-05-17',
        'booking_time' => '10:00',
        'order_status' => 'baru',
        'subtotal' => 3240000,
        'total_amount' => 3240000,
        'dp_amount' => 810000,
        'remaining_amount' => 2430000,
    ]);

    $item = OrderItem::make([
        'menu_item_id' => 1,
        'menu_name' => 'Babi Timbang',
        'menu_category_type' => 'timbang_hidup',
        'menu_unit' => 'kg',
        'kondisi_produk' => 'mateng',
        'adat_type' => 'batak',
        'quantity' => 30,
        'unit_price' => 108000,
        'subtotal' => 3240000,
        'notes' => 'Adat utama: Batak',
    ]);
    $item->setRelation('menuItem', $menuItem);

    $order->setRelation('items', collect([$item]));
    $order->setRelation('paymentVerifications', collect());

    $service = app(PesananService::class);
    $reflection = new ReflectionClass($service);
    $method = $reflection->getMethod('buildCashbackBreakdown');
    $method->setAccessible(true);
    $cashbackBreakdown = $method->invoke($service, $order);

    expect($cashbackBreakdown)->toHaveCount(1)
        ->and($cashbackBreakdown[0])->toMatchArray([
            'menu_name' => 'Babi Timbang',
            'kode' => 'B',
            'cashback' => 75000.0,
        ]);
});
