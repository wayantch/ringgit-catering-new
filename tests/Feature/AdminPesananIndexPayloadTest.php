<?php

use App\Models\Order;
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
