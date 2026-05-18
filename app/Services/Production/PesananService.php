<?php

namespace App\Services\Production;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class PesananService
{
    /**
     * @return array<string, mixed>
     */
    public function getBerandaData(): array
    {
        $incomingOrdersCollection = $this->incomingOrdersQuery('')->limit(5)->get();
        $completedToday = Order::query()
            ->where('order_status', 'selesai')
            ->whereDate('production_completed_at', now()->toDateString())
            ->count();

        $estimatedQueueMinutes = (int) $incomingOrdersCollection->sum(function (Order $order): int {
            $itemPortions = (int) $order->items->sum(fn($item): float => (float) $item->quantity);

            return max(1, $itemPortions) * 5;
        });

        $dailyProductionPortions = (int) OrderItem::query()
            ->whereHas('order', function ($query): void {
                $query->whereDate('booking_date', now()->toDateString())
                    ->whereIn('order_status', ['diproses', 'selesai']);
            })
            ->sum('quantity');

        return [
            'summary' => [
                'incoming' => $incomingOrdersCollection->count(),
                'in_progress' => $incomingOrdersCollection
                    ->whereIn('production_stage', ['dimasak', 'siap'])
                    ->count(),
                'completed_today' => $completedToday,
                'queue_minutes' => $estimatedQueueMinutes,
                'daily_portions' => $dailyProductionPortions,
            ],
            'recentOrders' => $this->mapIncomingOrders($incomingOrdersCollection),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getPesananData(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $period = (string) ($filters['period'] ?? 'today');

        $incomingOrdersCollection = $this->incomingOrdersQuery($search)->get();
        $historyOrdersCollection = $this->historyOrdersQuery($search, $period)->get();

        $estimatedQueueMinutes = (int) $incomingOrdersCollection->sum(function (Order $order): int {
            $itemPortions = (int) $order->items->sum(fn($item): float => (float) $item->quantity);

            return max(1, $itemPortions) * 5;
        });

        $completedToday = Order::query()
            ->where('order_status', 'selesai')
            ->whereDate('production_completed_at', now()->toDateString())
            ->count();

        $dailyProductionPortions = (int) OrderItem::query()
            ->whereHas('order', function ($query): void {
                $query->whereDate('booking_date', now()->toDateString())
                    ->whereIn('order_status', ['diproses', 'selesai']);
            })
            ->sum('quantity');

        return [
            'summary' => [
                'incoming' => $incomingOrdersCollection->count(),
                'in_progress' => $incomingOrdersCollection
                    ->whereIn('production_stage', ['dimasak', 'siap'])
                    ->count(),
                'completed_today' => $completedToday,
                'queue_minutes' => $estimatedQueueMinutes,
                'daily_portions' => $dailyProductionPortions,
            ],
            'incomingOrders' => $this->mapIncomingOrders($incomingOrdersCollection),
            'historyOrders' => $this->mapHistoryOrders($historyOrdersCollection),
            'notificationCount' => $incomingOrdersCollection->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getRiwayatData(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $period = (string) ($filters['period'] ?? 'week');

        $historyOrdersCollection = $this->historyOrdersQuery($search, $period)->get();

        $totalCompleted = Order::query()
            ->where('order_status', 'selesai')
            ->count();

        $completedToday = Order::query()
            ->where('order_status', 'selesai')
            ->whereDate('production_completed_at', now()->toDateString())
            ->count();

        return [
            'historyOrders' => $this->mapHistoryOrders($historyOrdersCollection),
            'summary' => [
                'total_completed' => $totalCompleted,
                'completed_today' => $completedToday,
                'this_week' => $historyOrdersCollection->count(),
            ],
        ];
    }

    public function completeOrder(Order $order): void
    {
        if ($order->order_status !== 'diproses') {
            throw new InvalidArgumentException('Pesanan ini tidak ada di antrean produksi.');
        }

        $order->update([
            'order_status' => 'selesai',
            'production_stage' => 'siap',
            'production_completed_at' => now(),
        ]);
    }

    public function updateStage(Order $order, string $stage): void
    {
        if ($order->order_status !== 'diproses') {
            throw new InvalidArgumentException('Tahap produksi hanya bisa diubah untuk pesanan diproses.');
        }

        $order->update([
            'production_stage' => $stage,
        ]);
    }

    public function togglePriority(Order $order): void
    {
        if ($order->order_status !== 'diproses') {
            throw new InvalidArgumentException('Hanya pesanan diproses yang bisa diatur prioritasnya.');
        }

        $order->update([
            'is_urgent' => ! $order->is_urgent,
        ]);
    }

    private function incomingOrdersQuery(string $search)
    {
        return Order::query()
            ->with(['items:id,order_id,menu_name,quantity,kondisi_produk,adat_type,notes'])
            ->where('order_status', 'diproses')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nestedQuery) use ($search): void {
                    $nestedQuery->where('order_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('is_urgent')
            ->orderBy('booking_date')
            ->orderBy('booking_time');
    }

    private function historyOrdersQuery(string $search, string $period)
    {
        return Order::query()
            ->withCount('items')
            ->where('order_status', 'selesai')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nestedQuery) use ($search): void {
                    $nestedQuery->where('order_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->when($period === 'today', function ($query): void {
                $query->whereDate('production_completed_at', now()->toDateString());
            })
            ->when($period === 'week', function ($query): void {
                $query->where('production_completed_at', '>=', now()->subDays(7));
            })
            ->orderByDesc('production_completed_at')
            ->limit(50);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function mapIncomingOrders(Collection $orders): array
    {
        return $orders->map(function (Order $order): array {
            $scheduleTime = $order->order_type === 'delivery'
                ? ($order->delivery_time ?? $order->booking_time)
                : ($order->pickup_time ?? $order->booking_time);

            $itemPortions = (int) $order->items->sum(fn($item): float => (float) $item->quantity);

            return [
                'id' => $order->hashid,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'booking_date' => Carbon::parse($order->booking_date)->toDateString(),
                'schedule_time' => $scheduleTime,
                'notes' => $order->notes,
                'order_type' => $order->order_type,
                'production_stage' => $order->production_stage ?? 'diproses',
                'is_urgent' => $order->is_urgent,
                'estimated_minutes' => max(1, $itemPortions) * 5,
                'items' => $order->items->map(static function ($item): array {
                    return [
                        'id' => $item->hashid,
                        'menu_name' => $item->menu_name,
                        'quantity' => $item->quantity,
                        'notes' => $item->notes,
                        'kondisi_produk' => $item->kondisi_produk,
                        'adat_type' => $item->adat_type,
                    ];
                })->values()->all(),
            ];
        })->values()->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function mapHistoryOrders(Collection $orders): array
    {
        return $orders->map(function (Order $order): array {
            return [
                'id' => $order->hashid,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'total_items' => $order->items_count,
                'completed_at' => ($order->production_completed_at ?? $order->updated_at)?->toDateTimeString(),
                'status' => 'selesai',
            ];
        })->values()->all();
    }
}
