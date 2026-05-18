<?php

namespace App\Services\Pelanggan;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection as SupportCollection;

class BerandaService
{
    /**
     * Get featured menu items (6 items max, available only)
     */
    public function getFeaturedMenus(): EloquentCollection
    {
        return MenuItem::where('is_available', true)
            ->limit(6)
            ->orderBy('sort_order')
            ->with('category')
            ->get();
    }

    /**
     * Get 5 most recent orders for user.
     */
    public function getRecentOrders(User $user): SupportCollection
    {
        return Order::where('user_id', $user->id)
            ->latest('booking_date')
            ->latest('id')
            ->limit(5)
            ->with('items.menuItem')
            ->get()
            ->map(static function (Order $order): array {
                return [
                    'id' => $order->hashid,
                    'hashid' => $order->hashid,
                    'order_number' => $order->order_number,
                    'order_status' => $order->order_status,
                    'total_amount' => $order->total_amount,
                    'booking_date' => $order->booking_date?->locale('id')->isoFormat('D MMMM YYYY'),
                ];
            });
    }
}
