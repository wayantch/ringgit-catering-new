<?php

namespace App\Services\Admin;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $revenueToday = (float) Order::whereDate('created_at', $today)
            ->where('order_status', 'selesai')
            ->sum('total_amount');

        $revenueYesterday = (float) Order::whereDate('created_at', $yesterday)
            ->where('order_status', 'selesai')
            ->sum('total_amount');

        $ordersToday = Order::whereDate('created_at', $today)->count();
        $ordersYesterday = Order::whereDate('created_at', $yesterday)->count();
        $ordersTodayNew = Order::whereDate('created_at', $today)
            ->where('order_status', 'baru')
            ->count();

        $totalCustomers = User::where('role', 'pembeli')->count();
        $customersThisWeek = User::where('role', 'pembeli')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $activeMenus = MenuItem::where('is_available', true)
            ->whereNull('deleted_at')
            ->count();

        $lowStockMenus = MenuItem::whereNotNull('stock_quantity')
            ->where('stock_quantity', '<=', 5)
            ->count();

        return [
            'revenue_today' => $revenueToday,
            'revenue_yesterday' => $revenueYesterday,
            'orders_today' => $ordersToday,
            'orders_yesterday' => $ordersYesterday,
            'orders_today_new' => $ordersTodayNew,
            'total_customers' => $totalCustomers,
            'customers_this_week' => $customersThisWeek,
            'active_menus' => $activeMenus,
            'low_stock_menus' => $lowStockMenus,
        ];
    }

    public function getWeeklyRevenue(): array
    {
        $items = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $label = $day->locale('id')->isoFormat('ddd');
            $value = (float) Order::whereDate('created_at', $day)
                ->where('order_status', 'selesai')
                ->sum('total_amount');

            $items[] = [
                'label' => $label,
                'value' => $value,
            ];
        }

        return $items;
    }

    public function getOrderStatusDistribution(): array
    {
        $colors = [
            'baru' => '#60a5fa',
            'diproses' => '#f59e0b',
            'selesai' => '#7a8f6b',
            'dibatalkan' => '#f87171',
        ];

        $counts = Order::select('order_status', DB::raw('count(*) as cnt'))
            ->groupBy('order_status')
            ->get()
            ->pluck('cnt', 'order_status')
            ->toArray();

        $result = [];
        foreach (['baru', 'diproses', 'selesai', 'dibatalkan'] as $key) {
            $result[] = [
                'label' => ucfirst($key),
                'value' => (int) ($counts[$key] ?? 0),
                'color' => $colors[$key],
            ];
        }

        return $result;
    }

    public function getCompletionRate(): int
    {
        $total = Order::count();
        if ($total === 0) {
            return 0;
        }

        $completed = Order::where('order_status', 'selesai')->count();

        return (int) round(($completed / $total) * 100);
    }

    public function getRecentOrders(): array
    {
        $orders = Order::with('items')
            ->latest('created_at')
            ->take(5)
            ->get();

        return $orders->map(function (Order $order) {
            $items = $order->items->map(function ($it) {
                $qty = $it->quantity;
                $unit = $it->menu_unit ?? null;
                $unitText = $unit ? " {$unit}" : '';

                return trim("{$it->menu_name} ({$qty}{$unitText})");
            })->toArray();

            $menuSummary = '';
            if (count($items) === 0) {
                $menuSummary = '';
            } elseif (count($items) <= 2) {
                $menuSummary = implode(', ', $items);
            } else {
                $firstTwo = array_slice($items, 0, 2);
                $menuSummary = implode(', ', $firstTwo).' dan '.(count($items) - 2).' lainnya';
            }

            return [
                'id' => $order->hashid,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'menu_summary' => $menuSummary,
                'total_amount' => $order->is_price_pending ? null : (float) $order->total_amount,
                'is_price_pending' => (bool) $order->is_price_pending,
                'status' => $order->order_status,
            ];
        })->toArray();
    }

    public function getTopMenus(): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.order_status', '!=', 'dibatalkan')
            ->selectRaw('order_items.menu_name as menu_name, COUNT(DISTINCT order_items.order_id) as order_count')
            ->groupBy('order_items.menu_name')
            ->orderByDesc('order_count')
            ->limit(5)
            ->get()
            ->toArray();

        if (count($rows) === 0) {
            return [];
        }

        $top = (int) $rows[0]->order_count;

        return array_map(function ($r) use ($top) {
            return [
                'name' => $r->menu_name,
                'orders' => (int) $r->order_count,
                'pct' => $top > 0 ? (int) round(($r->order_count / $top) * 100) : 0,
            ];
        }, $rows);
    }
}
