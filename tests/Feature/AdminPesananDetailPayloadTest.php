<?php

use App\Http\Controllers\Admin\PesananController;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Payment;
use App\Models\PaymentVerification;
use App\Models\User;
use App\Services\Admin\KasirService;
use App\Services\Admin\PesananService;

it('formats admin order detail payload with hashids and item quantities', function (): void {
    $admin = User::make(['id' => 21, 'name' => 'Admin']);
    $customer = User::make(['id' => 45, 'name' => 'Pelanggan']);

    $order = Order::make();
    $order->setRawAttributes([
        'id' => 1001,
        'order_number' => 'ORD-1001',
        'source' => 'admin',
        'customer_name' => 'Pelanggan Contoh',
        'customer_phone' => '08123456789',
        'order_type' => 'takeaway',
        'booking_date' => '2026-05-14',
        'order_status' => 'baru',
        'subtotal' => 150000,
        'total_amount' => 150000,
        'dp_percentage' => 25,
        'dp_amount' => 37500,
        'remaining_amount' => 112500,
        'is_price_pending' => false,
    ], true);

    $item = OrderItem::make();
    $item->setRawAttributes([
        'id' => 2001,
        'order_id' => 1001,
        'menu_item_id' => 3001,
        'menu_name' => 'Ayam Panggang',
        'menu_category_type' => 'olahan',
        'menu_unit' => 'porsi',
        'kondisi_produk' => 'mateng',
        'adat_type' => 'adat',
        'quantity' => 3,
        'unit_price' => 50000,
        'subtotal' => 150000,
        'notes' => 'Tanpa sambal',
    ], true);
    $item->setRelation('order', $order);

    $menuItem = MenuItem::make();
    $menuItem->setRawAttributes([
        'id' => 3001,
        'name' => 'Ayam Panggang',
    ], true);
    $item->setRelation('menuItem', $menuItem);

    $payment = Payment::make();
    $payment->setRawAttributes([
        'id' => 4001,
        'order_id' => 1001,
        'type' => 'dp',
        'expected_amount' => 37500,
        'unique_code' => 555,
        'payment_proof' => 'proofs/dp.png',
        'status' => 'pending',
    ], true);
    $payment->setRelation('order', $order);

    $verification = PaymentVerification::make();
    $verification->setRawAttributes([
        'id' => 5001,
        'order_id' => 1001,
        'payment_type' => 'pelunasan',
        'amount' => 112500,
        'proof_image' => 'proofs/final.png',
        'status' => 'pending',
        'rejection_notes' => null,
    ], true);

    $order->setRelation('items', collect([$item]));
    $order->setRelation('payments', collect([$payment]));
    $order->setRelation('paymentVerifications', collect([$verification]));
    $order->setRelation('createdBy', $admin);
    $order->setRelation('user', $customer);

    $controller = new PesananController(
        app(PesananService::class),
        app(KasirService::class),
    );

    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('formatOrderForFrontend');
    $method->setAccessible(true);

    $formatted = $method->invoke($controller, $order);

    expect($formatted['id'])->toBe($order->hashid)
        ->and($formatted['items'])->toHaveCount(1)
        ->and($formatted['items'][0]['qty'])->toBe(3.0)
        ->and($formatted['payments'])->toHaveCount(2)
        ->and($formatted['payments'][1]['is_verification'])->toBeTrue();
});
