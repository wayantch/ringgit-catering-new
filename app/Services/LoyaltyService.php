<?php

namespace App\Services;

use App\Models\LoyaltyConfig;
use App\Models\LoyaltyRedemption;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    public function getActiveConfig(): ?LoyaltyConfig
    {
        return LoyaltyConfig::query()
            ->where('is_active', true)
            ->where(function ($query): void {
                $today = now()->toDateString();

                $query->whereNull('period_start')
                    ->orWhere('period_start', '<=', $today);
            })
            ->where(function ($query): void {
                $today = now()->toDateString();

                $query->whereNull('period_end')
                    ->orWhere('period_end', '>=', $today);
            })
            ->latest('id')
            ->first();
    }

    public function countEligibleOrders(User $user, LoyaltyConfig $config): int
    {
        $query = Order::query()
            ->where('user_id', $user->id)
            ->where('order_status', 'selesai');

        match ($config->count_period) {
            'this_year' => $query->whereYear('booking_date', now()->year),
            'custom' => $query->whereBetween('booking_date', [
                $config->count_from?->toDateString(),
                $config->count_to?->toDateString(),
            ]),
            default => null,
        };

        return (int) $query->count();
    }

    public function isEligible(User $user, LoyaltyConfig $config): bool
    {
        $alreadyRedeemed = LoyaltyRedemption::query()
            ->where('user_id', $user->id)
            ->where('loyalty_config_id', $config->id)
            ->exists();

        if ($alreadyRedeemed) {
            return false;
        }

        return $this->countEligibleOrders($user, $config) >= $config->min_orders;
    }

    public function getUserLoyaltyInfo(User $user, ?float $subtotal = null): array
    {
        $config = $this->getActiveConfig();

        if (! $config) {
            return [
                'has_active_program' => false,
                'is_eligible' => false,
                'order_count' => 0,
                'orders_needed' => null,
                'min_orders' => null,
                'discount_type' => null,
                'discount_value' => null,
                'discount_preview' => null,
                'period_start' => null,
                'period_end' => null,
                'description' => null,
                'config_id' => null,
            ];
        }

        $subtotal ??= 0;
        $orderCount = $this->countEligibleOrders($user, $config);
        $isEligible = $this->isEligible($user, $config);

        return [
            'has_active_program' => true,
            'is_eligible' => $isEligible,
            'order_count' => $orderCount,
            'orders_needed' => max(0, $config->min_orders - $orderCount),
            'min_orders' => $config->min_orders,
            'discount_type' => $config->discount_type,
            'discount_value' => (float) $config->discount_value,
            'discount_preview' => $isEligible ? $config->calculateDiscount($subtotal) : null,
            'period_start' => $config->period_start?->toDateString(),
            'period_end' => $config->period_end?->toDateString(),
            'description' => $config->description,
            'config_id' => $config->hashid,
        ];
    }

    public function applyToOrder(Order $order, LoyaltyConfig $config): LoyaltyRedemption
    {
        $existingRedemption = $order->loyaltyRedemption;

        if ($existingRedemption) {
            return $existingRedemption;
        }

        return DB::transaction(function () use ($order, $config): LoyaltyRedemption {
            $user = $order->user;
            $orderCount = $this->countEligibleOrders($user, $config);
            $discount = $config->calculateDiscount((float) $order->subtotal);

            $redemption = LoyaltyRedemption::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'loyalty_config_id' => $config->id,
                'discount_applied' => $discount,
                'orders_at_redemption' => $orderCount,
            ]);

            $newTotal = max(0, (float) $order->total_amount - $discount);
            $dpPercentage = (int) ($order->dp_percentage ?? 0);
            $dpAmount = $dpPercentage > 0 ? round($newTotal * ($dpPercentage / 100), 2) : 0;

            $order->update([
                'loyalty_redemption_id' => $redemption->id,
                'loyalty_discount' => $discount,
                'total_amount' => round($newTotal, 2),
                'dp_amount' => $dpAmount,
                'remaining_amount' => round(max(0, $newTotal - $dpAmount), 2),
            ]);

            return $redemption;
        });
    }

    public function getAdminStats(): array
    {
        $config = $this->getActiveConfig();

        if (! $config) {
            return [
                'program_active' => false,
                'total_eligible' => 0,
                'total_redeemed' => 0,
                'total_discount_given' => 0,
            ];
        }

        $eligibleCustomers = $this->getEligibleCustomers($config);

        return [
            'program_active' => true,
            'program_description' => $config->description,
            'min_orders' => $config->min_orders,
            'period_end' => $config->period_end?->toDateString(),
            'total_eligible' => $eligibleCustomers->where('is_eligible', true)->count(),
            'total_redeemed' => LoyaltyRedemption::query()
                ->where('loyalty_config_id', $config->id)
                ->count(),
            'total_discount_given' => LoyaltyRedemption::query()
                ->where('loyalty_config_id', $config->id)
                ->sum('discount_applied'),
        ];
    }

    public function getEligibleCustomers(LoyaltyConfig $config): Collection
    {
        $query = User::query()
            ->where('role', 'pembeli')
            ->withCount([
                'orders as orders_count' => function ($builder) use ($config): void {
                    $builder->where('order_status', 'selesai');

                    if ($config->count_period === 'this_year') {
                        $builder->whereYear('booking_date', now()->year);
                    } elseif ($config->count_period === 'custom') {
                        $builder->whereBetween('booking_date', [
                            $config->count_from?->toDateString(),
                            $config->count_to?->toDateString(),
                        ]);
                    }
                },
            ]);

        $query->withCount([
            'loyaltyRedemptions as active_loyalty_redemptions_count' => function ($builder) use ($config): void {
                $builder->where('loyalty_config_id', $config->id);
            },
        ]);

        return $query
            ->orderByDesc('orders_count')
            ->orderBy('name')
            ->get()
            ->map(function (User $user) use ($config): array {
                $orderCount = (int) $user->orders_count;
                $hasRedeemed = (int) ($user->active_loyalty_redemptions_count ?? 0) > 0;

                return [
                    'id' => $user->hashid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'order_count' => $orderCount,
                    'is_eligible' => $orderCount >= $config->min_orders,
                    'has_redeemed' => $hasRedeemed,
                    'tier' => $this->getTier($orderCount),
                ];
            })
            ->values();
    }

    public function getTier(int $orderCount): string
    {
        return match (true) {
            $orderCount >= 50 => 'platinum',
            $orderCount >= 25 => 'gold',
            $orderCount >= 10 => 'silver',
            default => 'bronze',
        };
    }
}
