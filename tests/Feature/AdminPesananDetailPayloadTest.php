<?php

use App\Http\Controllers\Admin\PesananController;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
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
        ->and($formatted['payments'][1]['is_verification'])->toBeTrue()
        ->and($formatted['payment_method'])->toBe('dp')
        ->and($formatted['dp_amount'])->toBe('37500.00')
        ->and($formatted['remaining_amount'])->toBe('112500.00')
        ->and($formatted['has_cashback'])->toBeFalse()
        ->and($formatted['total_after_cashback'])->toBe(150000.0);
});

it('keeps pembeli orders marked as dp when only the dp verification is approved', function (): void {
    $order = Order::make();
    $order->setRawAttributes([
        'id' => 1003,
        'order_number' => 'ORD-1003',
        'source' => 'pembeli',
        'customer_name' => 'Pelanggan DP',
        'customer_phone' => '08123456790',
        'order_type' => 'takeaway',
        'booking_date' => '2026-05-15',
        'order_status' => 'baru',
        'subtotal' => 200000,
        'total_amount' => 200000,
        'dp_amount' => 50000,
        'remaining_amount' => 150000,
        'is_price_pending' => false,
    ], true);

    $order->setRelation('items', collect());
    $order->setRelation('payments', collect());
    $order->setRelation('paymentVerifications', collect([
        tap(PaymentVerification::make(), function (PaymentVerification $verification): void {
            $verification->setRawAttributes([
                'id' => 5002,
                'order_id' => 1003,
                'payment_type' => 'dp',
                'amount' => 50000,
                'proof_image' => 'proofs/dp-approved.png',
                'status' => 'verified',
            ], true);
        }),
        tap(PaymentVerification::make(), function (PaymentVerification $verification): void {
            $verification->setRawAttributes([
                'id' => 5003,
                'order_id' => 1003,
                'payment_type' => 'pelunasan',
                'amount' => 150000,
                'proof_image' => 'proofs/final-pending.png',
                'status' => 'pending',
            ], true);
        }),
    ]));

    $controller = new PesananController(
        app(PesananService::class),
        app(KasirService::class),
    );

    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('formatOrderForFrontend');
    $method->setAccessible(true);

    $formatted = $method->invoke($controller, $order);

    expect($formatted['payment_method'])->toBe('dp')
        ->and($formatted['payments'])->toHaveCount(2);
});

it('applies cashback to admin detail total only for full payment orders', function (): void {
    $order = Order::make();
    $order->setRawAttributes([
        'id' => 1002,
        'order_number' => 'ORD-20260524-DETAIL-001',
        'source' => 'admin',
        'customer_name' => 'Pelanggan Full',
        'customer_phone' => '08123456781',
        'order_type' => 'takeaway',
        'booking_date' => '2026-05-24',
        'order_status' => 'diproses',
        'subtotal' => 500000,
        'unique_code' => 123,
        'total_amount' => 100123,
        'dp_amount' => 0,
        'remaining_amount' => 0,
        'is_price_pending' => false,
    ], true);

    $tier = MenuItemPriceTier::make();
    $tier->setRawAttributes([
        'id' => 1,
        'menu_item_id' => 3002,
        'kode' => 'A',
        'is_half' => false,
        'berat_min' => 1,
        'berat_max' => 10,
        'harga_mentah' => 100000,
        'harga_matang' => 110000,
        'cashback' => 25000,
        'sort_order' => 1,
    ], true);

    $menuItem = MenuItem::make();
    $menuItem->setRawAttributes([
        'id' => 3002,
        'name' => 'Babi Detail Cashback',
        'menu_type' => 'timbang_hidup',
    ], true);
    $menuItem->setRelation('tiers', collect([$tier]));

    $item = OrderItem::make();
    $item->setRawAttributes([
        'id' => 2002,
        'order_id' => 1002,
        'menu_item_id' => 3002,
        'menu_name' => 'Babi Detail Cashback',
        'menu_category_type' => 'timbang_hidup',
        'kondisi_produk' => 'mentah',
        'quantity' => 5,
        'unit_price' => 100000,
        'subtotal' => 500000,
    ], true);
    $item->setRelation('menuItem', $menuItem);
    $item->setRelation('order', $order);

    $order->setRelation('items', collect([$item]));
    $order->setRelation('payments', collect());
    $order->setRelation('paymentVerifications', collect());

    $controller = new PesananController(
        app(PesananService::class),
        app(KasirService::class),
    );

    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('formatOrderForFrontend');
    $method->setAccessible(true);

    $formatted = $method->invoke($controller, $order);

    expect($formatted['payment_method'])->toBe('full')
        ->and($formatted['has_cashback'])->toBeTrue()
        ->and($formatted['total_cashback'])->toBe(25000.0)
        ->and($formatted['total_after_cashback'])->toBe(75123.0)
        ->and($formatted['cashback_breakdown'])->toHaveCount(1)
        ->and($formatted['cashback_breakdown'][0]['kode'])->toBe('A');
});
