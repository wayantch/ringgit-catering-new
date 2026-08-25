<?php

namespace App\Services\Pelanggan;

use App\Models\Order;
use App\Models\User;
use App\Services\LoyaltyService;

class ProfilService
{
    public function __construct(
        private LoyaltyService $loyaltyService,
    ) {}

    /**
     * Get profile stats
     */
    public function getStats(User $user): array
    {
        $activeConfig = $this->loyaltyService->getActiveConfig();
        $totalOrders = Order::where('user_id', $user->id)->count();
        $totalSpent = Order::where('user_id', $user->id)
            ->where('order_status', 'selesai')
            ->sum('total_amount');
        $completedOrders = Order::where('user_id', $user->id)
            ->where('order_status', 'selesai')
            ->count();
        $hasRedeemed = $activeConfig !== null
            ? $user->loyaltyRedemptions()
                ->where('loyalty_config_id', $activeConfig->id)
                ->exists()
            : false;

        return [
            'total_orders' => $totalOrders,
            'total_spent' => $totalSpent,
            'member_since' => $user->created_at->format('d M Y'),
            'loyalty_tier' => $this->loyaltyService->getTier($completedOrders),
            'loyalty_completed_orders' => $completedOrders,
            'loyalty_min_orders' => $activeConfig?->min_orders,
            'loyalty_progress_percent' => $activeConfig !== null
                ? min(100, (int) round(($completedOrders / max(1, $activeConfig->min_orders)) * 100))
                : null,
            'loyalty_is_eligible' => $activeConfig ? $completedOrders >= $activeConfig->min_orders : false,
            'loyalty_has_redeemed' => $hasRedeemed,
        ];
    }

    /**
     * Update user profile
     */
    public function update(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'] ?? $user->name,
            'phone' => $data['phone'] ?? ($user->phone ?? null),
            'address' => $data['address'] ?? ($user->address ?? null),
        ]);

        return $user;
    }
}
