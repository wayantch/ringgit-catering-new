<?php

use App\Models\Order;
use App\Models\User;

it('paginates customer order history on the admin customer show page', function (): void {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $pelanggan = User::factory()->create([
        'role' => 'pembeli',
        'last_login_at' => now()->subDays(10),
    ]);

    foreach (range(1, 12) as $index) {
        Order::create([
            'user_id' => $pelanggan->id,
            'order_number' => 'ORD-'.uniqid().'-'.str_pad((string) $index, 4, '0', STR_PAD_LEFT),
            'source' => 'pembeli',
            'customer_name' => $pelanggan->name,
            'customer_phone' => $pelanggan->phone,
            'customer_email' => $pelanggan->email,
            'order_type' => 'takeaway',
            'booking_date' => now()->subDays($index)->toDateString(),
            'booking_time' => '12:00',
            'order_status' => 'selesai',
            'subtotal' => 100000,
            'total_amount' => 100000,
            'dp_amount' => 0,
            'remaining_amount' => 0,
        ]);
    }

    $response = $this->actingAs($admin)->get(route('admin.pelanggan.show', $pelanggan));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Pelanggan/Show')
            ->where('pelanggan.status', 'aktif')
            ->where('pelanggan.total_orders', 12)
            ->where('pelanggan.orders.current_page', 1)
            ->where('pelanggan.orders.last_page', 2)
            ->where('pelanggan.orders.total', 12)
            ->has('pelanggan.orders.data', 10)
    );
});
