<?php

use App\Models\Cart;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemVariant;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentVerification;
use App\Models\Setting;
use App\Models\User;
use App\Services\Admin\KasirService;
use App\Services\Admin\PesananService as AdminPesananService;
use App\Services\OrderCodeGenerator;
use App\Services\Pelanggan\KeranjangService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

uses(DatabaseTransactions::class);

/**
 * @param  array<string, mixed>  $attributes
 */
function makePaymentRulesOrder(array $attributes = []): Order
{
    return Order::create(array_merge([
        'order_number' => 'TST-'.Str::uuid()->toString(),
        'source' => 'admin',
        'customer_name' => 'Pelanggan Tes',
        'customer_phone' => '081234567890',
        'order_type' => 'takeaway',
        'booking_date' => now()->addDays(5)->toDateString(),
        'booking_time' => '10:00:00',
        'order_status' => 'diproses',
        'subtotal' => 100000,
        'total_amount' => 100000,
        'dp_percentage' => 25,
        'dp_amount' => 25000,
        'remaining_amount' => 75000,
    ], $attributes));
}

it('continues the per-day order number sequence for a prefix', function (): void {
    $dayPrefix = 'TSTSEQ-'.now()->format('Ymd').'-';

    makePaymentRulesOrder(['order_number' => $dayPrefix.'00007']);
    makePaymentRulesOrder(['order_number' => 'TSTOTHER-'.now()->format('Ymd').'-00099']);

    $orderNumber = DB::transaction(
        fn (): string => app(OrderCodeGenerator::class)->nextOrderNumber('TSTSEQ', 5),
    );

    expect($orderNumber)->toBe($dayPrefix.'00008');
});

it('only treats codes of unpaid orders as taken', function (): void {
    $takenCodes = Order::query()
        ->whereIn('order_status', ['baru', 'diproses'])
        ->get(['unique_code', 'dp_unique_code'])
        ->flatMap(fn (Order $order): array => [$order->unique_code, $order->dp_unique_code])
        ->merge(Payment::query()->where('status', 'pending')->pluck('unique_code'))
        ->filter()
        ->map(fn (mixed $code): int => (int) $code)
        ->all();

    $freeCodes = array_values(array_diff(range(100, 999), $takenCodes));
    $codeOfFinishedOrder = array_shift($freeCodes);
    $exceptedCode = array_shift($freeCodes);

    $timestamp = now();
    $rows = array_map(static fn (int $code): array => [
        'order_number' => 'TST-'.Str::uuid()->toString(),
        'source' => 'admin',
        'customer_name' => 'Pengisi Kode',
        'customer_phone' => '081234567890',
        'order_type' => 'takeaway',
        'booking_date' => $timestamp->toDateString(),
        'booking_time' => '10:00:00',
        'order_status' => 'baru',
        'unique_code' => $code,
        'total_amount' => 0,
        'dp_percentage' => 25,
        'dp_amount' => 0,
        'remaining_amount' => 0,
        'created_at' => $timestamp,
        'updated_at' => $timestamp,
    ], $freeCodes);

    DB::table('orders')->insert($rows);
    makePaymentRulesOrder(['order_status' => 'selesai', 'unique_code' => $codeOfFinishedOrder]);

    expect(app(OrderCodeGenerator::class)->uniqueCode([$exceptedCode]))->toBe($codeOfFinishedOrder);
});

it('builds the cart summary from the dp setting with separate transfer codes', function (): void {
    Setting::current()->update(['dp_percentage' => 40]);

    $customer = User::factory()->create(['role' => 'pembeli']);
    $category = MenuCategory::query()->firstOrCreate(
        ['type' => 'eceran'],
        [
            'name' => 'Eceran',
            'slug' => 'eceran-'.Str::lower(Str::random(8)),
            'description' => null,
            'sort_order' => 3,
            'is_active' => true,
        ],
    );
    $menuItem = MenuItem::create([
        'category_id' => $category->id,
        'name' => 'Saksang Tes',
        'menu_type' => 'eceran',
        'is_available' => true,
        'sort_order' => 1,
    ]);
    MenuItemVariant::create([
        'menu_item_id' => $menuItem->id,
        'label' => 'Porsi',
        'harga' => 100000,
        'sort_order' => 1,
    ]);
    Cart::create([
        'user_id' => $customer->id,
        'menu_item_id' => $menuItem->id,
        'kondisi_produk' => 'mentah',
        'quantity' => 2,
    ]);

    $summary = app(KeranjangService::class)->getCartSummary($customer);

    expect($summary['dp_percentage'])->toBe(40)
        ->and((float) $summary['dp_amount'])->toBe(80000.0)
        ->and($summary['dp_unique_code'])->not->toBe($summary['unique_code'])
        ->and((float) $summary['dp_total'])->toBe(80000.0 + $summary['dp_unique_code'])
        ->and((float) $summary['remaining_amount'])->toBe((float) $summary['total'] - (float) $summary['dp_total']);
});

it('uses the dp setting for kasir orders', function (): void {
    Setting::current()->update(['dp_percentage' => 50]);

    $admin = User::factory()->admin()->create();
    $category = MenuCategory::query()->firstOrCreate(
        ['type' => 'eceran'],
        [
            'name' => 'Eceran',
            'slug' => 'eceran-'.Str::lower(Str::random(8)),
            'description' => null,
            'sort_order' => 3,
            'is_active' => true,
        ],
    );
    $menuItem = MenuItem::create([
        'category_id' => $category->id,
        'name' => 'Paket Kasir Tes',
        'menu_type' => 'eceran',
        'is_available' => true,
        'sort_order' => 1,
    ]);

    $kasirService = app(KasirService::class);

    $order = $kasirService->createManualOrder([
        'customer_type' => 'walkin',
        'customer_name' => 'Walk-in DP',
        'customer_phone' => '081234567890',
        'order_type' => 'takeaway',
        'booking_date' => now()->addDays(5)->toDateString(),
        'pickup_time' => '10:30',
        'payment_method' => 'dp',
        'items' => [[
            'menu_item_id' => $menuItem->hashid,
            'kondisi_produk' => 'satuan',
            'qty' => 2,
            'price' => 100000,
        ]],
    ], $admin);

    expect($kasirService->getFormData()['dpPercentage'])->toBe(50)
        ->and($order->dp_percentage)->toBe(50)
        ->and((float) $order->dp_amount)->toBe(100000.0 + $order->dp_unique_code)
        ->and($order->dp_unique_code)->not->toBe($order->unique_code)
        ->and($order->order_number)->toStartWith('RCS-'.now()->format('Ymd').'-');
});

it('cancels an order after the second rejection of a payment type across both payment sources', function (): void {
    $admin = User::factory()->admin()->create();
    $order = makePaymentRulesOrder();
    $kasirPayment = Payment::create([
        'order_id' => $order->id,
        'type' => 'dp',
        'expected_amount' => 25000,
        'unique_code' => 101,
        'status' => 'pending',
    ]);
    $uploadedProof = PaymentVerification::create([
        'order_id' => $order->id,
        'payment_type' => 'dp',
        'amount' => 25000,
        'status' => 'pending',
    ]);

    app(AdminPesananService::class)->rejectPayment($kasirPayment, 'Transfer tidak masuk', $admin);

    expect($order->refresh()->order_status)->toBe('baru');

    app(AdminPesananService::class)->rejectPaymentVerification($uploadedProof, '', $admin);

    expect($order->refresh()->order_status)->toBe('dibatalkan');
});

it('moves an order back to baru once it has no verified payment left', function (): void {
    $admin = User::factory()->admin()->create();
    $order = makePaymentRulesOrder();
    $payment = Payment::create([
        'order_id' => $order->id,
        'type' => 'pelunasan',
        'expected_amount' => 100000,
        'unique_code' => 103,
        'status' => 'verified',
    ]);

    app(AdminPesananService::class)->rejectPayment($payment, 'Nominal tidak sesuai', $admin);

    expect($order->refresh()->order_status)->toBe('baru');
});

it('keeps an order in production when another payment is still verified', function (): void {
    $admin = User::factory()->admin()->create();
    $order = makePaymentRulesOrder(['source' => 'pembeli']);
    PaymentVerification::create([
        'order_id' => $order->id,
        'payment_type' => 'dp',
        'amount' => 25000,
        'status' => 'verified',
    ]);
    $pelunasan = PaymentVerification::create([
        'order_id' => $order->id,
        'payment_type' => 'pelunasan',
        'amount' => 75000,
        'status' => 'pending',
    ]);

    app(AdminPesananService::class)->rejectPaymentVerification($pelunasan, '', $admin);

    expect($order->refresh()->order_status)->toBe('diproses');
});

it('leaves finished orders untouched when a payment is rejected', function (): void {
    $admin = User::factory()->admin()->create();
    $order = makePaymentRulesOrder(['order_status' => 'selesai']);
    $verification = PaymentVerification::create([
        'order_id' => $order->id,
        'payment_type' => 'dp',
        'amount' => 25000,
        'status' => 'pending',
    ]);

    app(AdminPesananService::class)->rejectPaymentVerification($verification, '', $admin);

    expect($order->refresh()->order_status)->toBe('selesai');
});

it('does not write the otp code to the log when verification fails', function (): void {
    Log::spy();

    $this->post(route('otp.verify'), [
        'email' => 'otp-log-'.Str::lower(Str::random(8)).'@example.com',
        'token' => '123456',
    ])->assertSessionHasErrors('token');

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => ! array_key_exists('token', $context))
        ->once();
});
