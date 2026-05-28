<?php

namespace App\Services\Admin;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PrintService
{
    public function getPrintData(?string $tanggal = null, ?string $dari = null, ?string $sampai = null): array
    {
        if (! $this->hasFilter($tanggal, $dari, $sampai)) {
            return [
                'groups' => [],
                'grand_total' => 0,
                'has_filters' => false,
                'range_exceeded' => false,
            ];
        }

        if ($this->isRangeTooLong($dari, $sampai)) {
            return [
                'groups' => [],
                'grand_total' => 0,
                'has_filters' => true,
                'range_exceeded' => true,
            ];
        }

        $query = Order::query()
            ->with([
                'items' => static fn($query) => $query->orderBy('id'),
                'payments',
            ])
            ->where('order_status', 'diproses');

        if ($tanggal) {
            $query->whereDate('booking_date', $tanggal);
        } elseif ($dari && $sampai) {
            $query->whereBetween('booking_date', [
                Carbon::parse($dari)->toDateString(),
                Carbon::parse($sampai)->toDateString(),
            ]);
        }

        $orders = $query
            ->orderBy('booking_date')
            ->orderByRaw('COALESCE(pickup_time, delivery_time) ASC')
            ->get();

        $groups = $orders
            ->groupBy(static fn(Order $order): string => $order->booking_date?->toDateString() ?? 'unknown')
            ->map(function (Collection $orders, string $bookingDate): array {
                $rows = $orders->flatMap(function (Order $order): array {
                    $scheduledTime = $order->pickup_time ?? $order->delivery_time;
                    $paymentSummary = $this->resolvePaymentSummary($order);

                    return $order->items->map(function ($item) use ($order, $scheduledTime, $paymentSummary): array {
                        $subtotal = (float) ($item->subtotal ?? 0);
                        $detailLabel = $item->menu_name . ' — ' . $this->formatKeterangan($item->kondisi_produk, $item->adat_type);

                        return [
                            'order_id' => $order->id,
                            'customer_name' => $order->customer_name,
                            'name' => $item->menu_name,
                            'qty' => (float) $item->quantity,
                            'qty_label' => $this->formatQuantity(
                                quantity: $item->quantity,
                                categoryType: $item->menu_category_type,
                            ),
                            'price' => $subtotal,
                            'keterangan' => $this->formatKeterangan($item->kondisi_produk, $item->adat_type),
                            'detail_label' => $detailLabel,
                            'payment_method' => $paymentSummary['method'],
                            'payment_date' => $paymentSummary['date_label'],
                            'jam' => $scheduledTime ? Carbon::parse($scheduledTime)->format('H:i') : '—',
                            'pickup_delivery' => $order->order_type === 'delivery' ? 'Delivery' : 'Pickup',
                        ];
                    })->values()->all();
                })->values()->all();

                $grandTotal = collect($rows)->sum('price');

                return [
                    'booking_date' => $bookingDate,
                    'booking_date_label' => Carbon::parse($bookingDate)->format('d/m/Y'),
                    'rows' => $rows,
                    'row_count' => count($rows),
                    'grand_total' => $grandTotal,
                ];
            })
            ->values()
            ->all();

        return [
            'groups' => $groups,
            'grand_total' => collect($groups)->sum('grand_total'),
            'has_filters' => true,
            'range_exceeded' => false,
        ];
    }

    private function hasFilter(?string $tanggal, ?string $dari, ?string $sampai): bool
    {
        return $tanggal !== null || ($dari !== null && $sampai !== null);
    }

    private function isRangeTooLong(?string $dari, ?string $sampai): bool
    {
        if (! $dari || ! $sampai) {
            return false;
        }

        $start = Carbon::parse($dari)->startOfDay();
        $end = Carbon::parse($sampai)->startOfDay();

        return $start->diffInDays($end) + 1 > 7;
    }

    private function formatQuantity(float|string $quantity, ?string $categoryType): string
    {
        $formattedQuantity = rtrim(rtrim(number_format((float) $quantity, 2, '.', ''), '0'), '.');

        if ($categoryType === 'timbang_hidup') {
            return $formattedQuantity . ' Kg';
        }

        return $formattedQuantity;
    }

    private function formatKeterangan(string $kondisi, ?string $adatType): string
    {
        if ($kondisi !== 'adat') {
            return match ($kondisi) {
                'panggang' => 'Panggang',
                'saksang' => 'Saksang',
                'sop' => 'Sop',
                'mateng' => 'Mateng',
                'mentah' => 'Mentah',
                'satuan' => 'Satuan',
                default => ucfirst($kondisi),
            };
        }

        if (! $adatType) {
            return 'Adat';
        }

        $adatParts = collect(explode(',', $adatType))
            ->map(static fn(string $part): string => trim($part))
            ->filter();

        $labels = $adatParts->map(fn(string $part): string => match ($part) {
            'batak_lengkap' => 'Lengkap',
            'batak_kepala' => 'Kepala',
            'batak_aliang' => 'Aliang',
            'batak_somba' => 'Somba',
            'batak_soit' => 'Soit',
            'batak_ekor' => 'Ekor',
            'batak_jeroan' => 'Jeroan',
            'nias_simbi_simbi' => 'Simbi-Simbi',
            'lainnya' => 'Lainnya',
            default => ucfirst(str_replace('_', ' ', $part)),
        });

        if ($adatParts->every(static fn(string $part): bool => str_starts_with($part, 'batak_'))) {
            return 'Adat Batak — ' . $labels->implode(', ');
        }

        if ($adatParts->contains('nias_simbi_simbi')) {
            return 'Adat Nias — ' . $labels->implode(', ');
        }

        if ($adatParts->contains('lainnya')) {
            return 'Adat — ' . $labels->implode(', ');
        }

        return 'Adat — ' . $labels->implode(', ');
    }

    private function resolvePaymentSummary(Order $order): array
    {
        $paymentLabel = (float) $order->dp_amount > 0 ? 'dp' : 'pembayaran penuh';
        $paymentLookupType = (float) $order->dp_amount > 0 ? 'dp' : 'pelunasan';
        $payment = $order->payments->firstWhere('type', $paymentLookupType)
            ?? $order->payments->firstWhere('type', 'pelunasan')
            ?? $order->payments->firstWhere('type', 'dp');

        $paymentDate = $payment?->verified_at?->format('d/m/Y') ?? '—';

        return [
            'method' => $paymentLabel,
            'date_label' => $paymentDate,
        ];
    }
}
