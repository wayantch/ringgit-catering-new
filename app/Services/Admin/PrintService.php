<?php

namespace App\Services\Admin;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PrintService
{
    /**
     * Get grouped print data for production recap.
     *
     * @param string|null $tanggalDari
     * @param string|null $tanggalSampai
     * @param string|null $tanggalSpesifik
     * @return array
     */
    public function getDataPrint(
        ?string $tanggalDari = null,
        ?string $tanggalSampai = null,
        ?string $tanggalSpesifik = null,
    ): array {
        $query = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select([
                'orders.booking_date',
                'orders.order_number',
                'orders.customer_name',
                'orders.order_type',
                'orders.pickup_time',
                'orders.delivery_time',
                'order_items.menu_name',
                'order_items.menu_category_type',
                'order_items.menu_unit',
                'order_items.quantity',
                'order_items.kondisi_produk',
                'order_items.adat_type',
                'order_items.notes',
            ])
            ->orderBy('orders.booking_date', 'asc')
            ->orderByRaw("FIELD(order_items.kondisi_produk,
                'adat','panggang','saksang','sop',
                'mateng','mentah','satuan')")
            ->orderByRaw("COALESCE(orders.pickup_time, orders.delivery_time) ASC");

        if ($tanggalSpesifik) {
            $query->whereDate('orders.booking_date', $tanggalSpesifik);
        } elseif ($tanggalDari && $tanggalSampai) {
            $query->whereBetween('orders.booking_date', [$tanggalDari, $tanggalSampai]);
        }

        $rows = $query->get();

        // Group by customer_name
        $grouped = $rows->groupBy('customer_name');

        $result = [];

        foreach ($grouped as $customerName => $items) {
            $result[] = [
                'customer_name' => $customerName,
                'total_order'   => $items->pluck('order_number')->unique()->count(),
                'total_items'   => $items->count(),
                'items'         => $items->map(fn($i) => [
                    'menu_name'          => $i->menu_name,
                    'menu_category_type' => $i->menu_category_type,
                    'qty'                => $i->quantity,
                    'unit'               => $i->menu_unit,
                    'kondisi_produk'     => $i->kondisi_produk,
                    'adat_type'          => $i->adat_type,
                    'keterangan'         => $this->formatKeterangan($i->kondisi_produk, $i->adat_type),
                    'order_number'       => $i->order_number,
                    'booking_date'       => Carbon::parse($i->booking_date)->format('d/m/Y'),
                    'order_type'         => $i->order_type,
                    'jam'                => $i->order_type === 'takeaway'
                        ? ($i->pickup_time ? Carbon::parse($i->pickup_time)->format('H:i') : '—')
                        : ($i->delivery_time ? Carbon::parse($i->delivery_time)->format('H:i') : '—'),
                    'notes'              => $i->notes,
                ])->values()->toArray(),
            ];
        }

        return $result;
    }

    /**
     * Format keterangan text from kondisi and adat_type
     *
     * @param string $kondisi
     * @param string|null $adatType
     * @return string
     */
    private function formatKeterangan(string $kondisi, ?string $adatType): string
    {
        if ($kondisi !== 'adat') {
            return match ($kondisi) {
                'panggang' => 'Panggang',
                'saksang'  => 'Saksang',
                'sop'      => 'Sop',
                'mateng'   => 'Mateng',
                'mentah'   => 'Mentah',
                'satuan'   => 'Eceran Satuan',
                default    => ucfirst($kondisi),
            };
        }

        return match ($adatType) {
            'batak_lengkap'    => 'Adat Batak — Lengkap',
            'batak_kepala'     => 'Adat Batak — Kepala',
            'batak_aliang'     => 'Adat Batak — Aliang',
            'batak_somba'      => 'Adat Batak — Somba',
            'batak_soit'       => 'Adat Batak — Soit',
            'batak_ekor'       => 'Adat Batak — Ekor',
            'batak_jeroan'     => 'Adat Batak — Jeroan',
            'nias_simbi_simbi' => 'Adat Nias — Simbi-Simbi',
            'lainnya'          => 'Adat — Lainnya',
            default            => 'Adat',
        };
    }
}
