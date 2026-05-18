<?php

use App\Models\LoyaltyConfig;
use App\Models\Order;
use App\Models\User;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeFinishedOrder(User $user, string $orderNumber, float $totalAmount): Order
{
    return Order::create([
        'user_id' => $user->id,
        'order_number' => $orderNumber,
        'created_by' => null,
        'source' => 'pembeli',
        'customer_name' => $user->name,
        'customer_phone' => '081234567890',
        'customer_email' => $user->email,
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '10:00:00',
        'order_status' => 'selesai',
        'subtotal' => $totalAmount,
        'total_amount' => $totalAmount,
        'dp_percentage' => 25,
        'dp_amount' => $totalAmount * 0.25,
        'remaining_amount' => $totalAmount * 0.75,
    ]);
}

it('counts eligible orders and applies loyalty redemption to the checkout order', function (): void {
    $service = app(LoyaltyService::class);
    $customer = User::factory()->create([
        'role' => 'pembeli',
    ]);

    makeFinishedOrder($customer, 'ORD-20260514-00001', 150000);
    makeFinishedOrder($customer, 'ORD-20260514-00002', 250000);

    $config = LoyaltyConfig::create([
        'is_active' => true,
        'min_orders' => 2,
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'max_discount' => 15000,
        'period_start' => now()->subDay()->toDateString(),
        'period_end' => now()->addDay()->toDateString(),
        'count_period' => 'all_time',
        'description' => 'Diskon Natal 2025',
    ]);

    expect($service->getActiveConfig()?->id)->toBe($config->id)
        ->and($service->countEligibleOrders($customer, $config))->toBe(2)
        ->and($service->isEligible($customer, $config))->toBeTrue();

    $info = $service->getUserLoyaltyInfo($customer, 100000);

    expect($info['has_active_program'])->toBeTrue()
        ->and($info['is_eligible'])->toBeTrue()
        ->and($info['order_count'])->toBe(2)
        ->and($info['orders_needed'])->toBe(0)
        ->and($info['discount_preview'])->toBe(10000.0);

    $checkoutOrder = Order::create([
        'user_id' => $customer->id,
        'order_number' => 'ORD-20260514-00003',
        'created_by' => null,
        'source' => 'pembeli',
        'customer_name' => $customer->name,
        'customer_phone' => '081234567890',
        'customer_email' => $customer->email,
        'order_type' => 'takeaway',
        'booking_date' => now()->toDateString(),
        'booking_time' => '11:00:00',
        'order_status' => 'baru',
        'subtotal' => 100000,
        'total_amount' => 100000,
        'dp_percentage' => 25,
        'dp_amount' => 25000,
        'remaining_amount' => 75000,
    ]);

    $redemption = $service->applyToOrder($checkoutOrder, $config);
    $checkoutOrder->refresh();

    expect((float) $redemption->discount_applied)->toBe(10000.0)
        ->and($redemption->orders_at_redemption)->toBe(2)
        ->and((float) $checkoutOrder->loyalty_discount)->toBe(10000.0)
        ->and((float) $checkoutOrder->total_amount)->toBe(90000.0)
        ->and((float) $checkoutOrder->dp_amount)->toBe(22500.0)
        ->and((float) $checkoutOrder->remaining_amount)->toBe(67500.0);

    $eligibleCustomers = $service->getEligibleCustomers($config);
    $customerRow = $eligibleCustomers->firstWhere('id', $customer->hashid);

    expect($customerRow)->not->toBeNull()
        ->and($customerRow['tier'])->toBe('bronze')
        ->and($customerRow['is_eligible'])->toBeTrue()
        ->and($customerRow['has_redeemed'])->toBeTrue();
});
