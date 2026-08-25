<?php

use App\Services\Admin\PrintService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('includes completed orders in the print data for a selected date', function (): void {
    $userId = DB::table('users')->insertGetId([
        'name' => 'Test Admin',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
        'remember_token' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $categoryId = DB::table('menu_categories')->insertGetId([
        'name' => 'Olahan',
        'type' => 'olahan',
        'slug' => 'olahan',
        'description' => null,
        'sort_order' => 0,
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $menuItemId = DB::table('menu_items')->insertGetId([
        'category_id' => $categoryId,
        'name' => 'Rendang Daging',
        'description' => null,
        'image' => null,
        'base_price' => 35000,
        'unit' => 'porsi',
        'is_available' => true,
        'stock_quantity' => null,
        'min_order_hours' => null,
        'sort_order' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $orderId = DB::table('orders')->insertGetId([
        'user_id' => $userId,
        'order_number' => 'ORD-20260531-00001',
        'created_by' => $userId,
        'source' => 'pembeli',
        'customer_name' => 'Pelanggan Test',
        'customer_phone' => '08123456789',
        'customer_email' => 'pelanggan@example.com',
        'order_type' => 'takeaway',
        'booking_date' => '2026-05-31',
        'booking_time' => '08:00:00',
        'order_status' => 'selesai',
        'delivery_address' => null,
        'pickup_time' => '08:00:00',
        'delivery_time' => null,
        'is_price_pending' => false,
        'subtotal' => 35000,
        'total_amount' => 35000,
        'unique_code' => null,
        'dp_percentage' => 25,
        'dp_unique_code' => null,
        'dp_amount' => 0,
        'remaining_amount' => 35000,
        'editable_until' => null,
        'notes' => null,
        'loyalty_redemption_id' => null,
        'loyalty_discount' => null,
        'production_stage' => 'diproses',
        'is_urgent' => false,
        'production_completed_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('order_items')->insert([
        'order_id' => $orderId,
        'menu_item_id' => $menuItemId,
        'kondisi_produk' => 'mateng',
        'adat_type' => null,
        'quantity' => 1,
        'unit_price' => 35000,
        'subtotal' => 35000,
        'menu_name' => 'Rendang Daging',
        'menu_category_type' => 'olahan',
        'menu_unit' => 'porsi',
        'notes' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $printData = app(PrintService::class)->getPrintData(tanggal: '2026-05-31');

    expect($printData['has_filters'])->toBeTrue();
    expect($printData['range_exceeded'])->toBeFalse();
    expect($printData['groups'])->toHaveCount(1);
    expect($printData['groups'][0]['booking_date'])->toBe('2026-05-31');
    expect($printData['groups'][0]['row_count'])->toBe(1);
    expect($printData['groups'][0]['orders'][0]['order_id'])->toBe($orderId)
        ->and($printData['groups'][0]['orders'][0]['customer_name'])->toBe('Pelanggan Test')
        ->and($printData['groups'][0]['orders'][0]['item_count'])->toBe(1)
        ->and($printData['groups'][0]['orders'][0]['items'][0]['name'])->toBe('Rendang Daging');
});
