<?php

namespace App\Services\Produksi;

use App\Models\Order;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class PesananService
{
    public function getBerandaData(): array
    {
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $pesanan_diproses = Order::where('order_status', 'diproses')
            ->whereDate('booking_date', $today)
            ->with('items')
            ->get();

        $selesai_hari_ini = Order::where('order_status', 'selesai')
            ->whereDate('production_completed_at', $today)
            ->count();

        $menunggu_besok = Order::whereIn('order_status', ['baru', 'diproses'])
            ->whereDate('booking_date', $tomorrow)
            ->count();

        return [
            'stats' => [
                'pesanan_diproses' => $pesanan_diproses->count(),
                'selesai_hari_ini' => $selesai_hari_ini,
                'menunggu_besok' => $menunggu_besok,
            ],
            'pesanan_aktif' => $this->formatPesananList($pesanan_diproses),
            'pesanan_diproses_count' => $pesanan_diproses->count(),
        ];
    }

    public function getPesananIndex(string $filter_status = 'semua', int $page = 1): array
    {
        // Produksi hanya melihat pesanan yang sudah diverifikasi admin (status: diproses)
        $query = Order::where('order_status', 'diproses')
            ->with('items')
            ->orderBy('booking_date')
            ->orderBy('booking_time');

        $pesanan = $query->paginate(15, ['*'], 'page', $page);

        $pesanan_diproses = Order::where('order_status', 'diproses')->count();

        return [
            'pesanan' => [
                'data' => $this->formatPesananList($pesanan->items()),
                'current_page' => $pesanan->currentPage(),
                'last_page' => $pesanan->lastPage(),
                'total' => $pesanan->total(),
            ],
            'pesanan_diproses_count' => $pesanan_diproses,
        ];
    }

    public function getRiwayatIndex(array $filters = []): array
    {
        $search = trim($filters['search'] ?? '');
        $booking_date = $filters['booking_date'] ?? '';
        $status = $filters['status'] ?? 'semua';
        $page = (int) ($filters['page'] ?? 1);

        $query = Order::whereIn('order_status', ['selesai', 'dibatalkan']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($booking_date !== '') {
            $query->whereDate('booking_date', $booking_date);
        }

        if ($status === 'selesai') {
            $query->where('order_status', 'selesai');
        } elseif ($status === 'dibatalkan') {
            $query->where('order_status', 'dibatalkan');
        }

        $riwayat = $query->withCount('items')
            ->orderByDesc('updated_at')
            ->paginate(15, ['*'], 'page', $page);

        $pesanan_diproses = Order::where('order_status', 'diproses')->count();

        return [
            'riwayat' => [
                'data' => $this->formatRiwayatList($riwayat->items()),
                'current_page' => $riwayat->currentPage(),
                'last_page' => $riwayat->lastPage(),
                'total' => $riwayat->total(),
            ],
            'pesanan_diproses_count' => $pesanan_diproses,
        ];
    }

    public function formatOrderDetail(Order $order): array
    {
        return [
            'id' => $order->hashid,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'booking_date' => $order->booking_date->toDateString(),
            'pickup_time' => $order->pickup_time,
            'delivery_time' => $order->delivery_time,
            'delivery_address' => $order->delivery_address,
            'order_type' => $order->order_type,
            'status' => $order->order_status,
            'notes' => $order->notes,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->hashid,
                'menu_name' => $item->menu_name,
                'menu_category_type' => $item->menu_category_type,
                'menu_unit' => $item->menu_unit,
                'qty' => $item->quantity,
                'kondisi_produk' => $item->kondisi_produk,
                'adat_type' => $item->adat_type,
                'notes' => $item->notes,
            ])->toArray(),
        ];
    }

    public function markAsProses(Order $order): void
    {
        if ($order->order_status !== 'baru') {
            throw new InvalidArgumentException('Hanya pesanan dengan status baru yang bisa diproses.');
        }

        $order->update([
            'order_status' => 'diproses',
        ]);
    }

    public function markAsSelesai(Order $order): void
    {
        if ($order->order_status !== 'diproses') {
            throw new InvalidArgumentException('Hanya pesanan dengan status diproses yang bisa diselesaikan.');
        }

        $order->update([
            'order_status' => 'selesai',
            'production_completed_at' => now(),
        ]);
    }

    private function formatPesananList(array|Collection $orders): array
    {
        $collection = is_array($orders) ? collect($orders) : $orders;

        return $collection->map(fn ($order) => [
            'id' => $order->hashid,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'booking_date' => $order->booking_date->toDateString(),
            'pickup_time' => $order->pickup_time,
            'delivery_time' => $order->delivery_time,
            'order_type' => $order->order_type,
            'status' => $order->order_status,
            'items_count' => $order->items->count(),
            'kondisi_summary' => $this->buildKondisiSummary($order->items),
        ])->values()->toArray();
    }

    private function formatRiwayatList(array|Collection $orders): array
    {
        $collection = is_array($orders) ? collect($orders) : $orders;

        return $collection->map(fn ($order) => [
            'id' => $order->hashid,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'booking_date' => $order->booking_date->toDateString(),
            'order_type' => $order->order_type,
            'status' => $order->order_status,
            'items_count' => $order->items_count ?? $order->items->count(),
            'total_amount' => $order->total_amount,
            'is_price_pending' => $order->is_price_pending,
            'selesai_at' => $order->production_completed_at?->toDateTimeString() ?? $order->updated_at?->toDateTimeString(),
        ])->values()->toArray();
    }

    private function buildKondisiSummary(Collection $items): string
    {
        $grouped = $items->groupBy('kondisi_produk')
            ->map(fn ($group, $kondisi) => $group->count().' '.$this->getKondisiLabel($kondisi))
            ->values();

        return $grouped->join(', ') ?: 'Tidak ada item';
    }

    private function getKondisiLabel(string $kondisi): string
    {
        return match ($kondisi) {
            'adat' => 'Adat',
            'panggang' => 'Panggang',
            'saksang' => 'Saksang',
            'sop' => 'Sop',
            'mentah' => 'Mentah',
            'mateng' => 'Mateng',
            'satuan' => 'Satuan',
            default => $kondisi,
        };
    }
}
