<?php

namespace App\Services\Admin;

use App\Enums\KondisiProduk as KondisiProdukRules;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class KasirService
{
    public function createManualOrder(array $data, User $admin): Order
    {
        return DB::transaction(function () use ($data, $admin): Order {
            $items = $data['items'] ?? [];

            if ($items === []) {
                throw new InvalidArgumentException('Order must have at least one item');
            }

            $customer = $this->resolveCustomerSnapshot($data);
            $bookingTime = $data['order_type'] === 'delivery'
                ? ($data['delivery_time'] ?? null)
                : ($data['pickup_time'] ?? null);

            if ($bookingTime === null || $bookingTime === '') {
                throw new InvalidArgumentException('Booking time is required');
            }

            $resolvedItems = [];
            $subtotal = 0.0;
            $isPricePending = false;

            foreach ($items as $itemData) {
                $menuItem = MenuItem::findByHashid((string) $itemData['menu_item_id']);
                $menuItem->load('category');

                if (! $menuItem) {
                    throw new InvalidArgumentException('Menu item tidak ditemukan');
                }

                $allowedKondisi = $this->resolveAllowedKondisi($menuItem);
                $kondisiProduk = (string) $itemData['kondisi_produk'];

                if (! in_array($kondisiProduk, $allowedKondisi, true)) {
                    throw new InvalidArgumentException("Kondisi produk tidak valid untuk menu {$menuItem->name}");
                }

                $adatType = $itemData['adat_type'] ?? null;
                if ($kondisiProduk !== 'adat') {
                    $adatType = null;
                }

                if ($kondisiProduk === 'adat' && empty($adatType)) {
                    throw new InvalidArgumentException("Adat harus dipilih untuk menu {$menuItem->name}");
                }

                $price = array_key_exists('price', $itemData) ? $itemData['price'] : null;
                $qty = (float) $itemData['qty'];

                if ($price === null || $price === '') {
                    $isPricePending = true;
                    $resolvedPrice = null;
                    $resolvedSubtotal = null;
                } else {
                    $resolvedPrice = (float) $price;
                    $resolvedSubtotal = round($resolvedPrice * $qty, 2);
                    $subtotal += $resolvedSubtotal;
                }

                $resolvedItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'menu_name' => $itemData['menu_name'] ?? $menuItem->name,
                    'menu_category_type' => $itemData['menu_category_type'] ?? $menuItem->category?->type,
                    'menu_unit' => $itemData['menu_unit'] ?? $menuItem->unit,
                    'kondisi_produk' => $kondisiProduk,
                    'adat_type' => $adatType,
                    'quantity' => $qty,
                    'unit_price' => $resolvedPrice,
                    'subtotal' => $resolvedSubtotal,
                    'notes' => $itemData['notes'] ?? null,
                ];
            }

            $order = Order::create([
                'user_id' => $customer['user_id'],
                'order_number' => $this->generateOrderNumber(),
                'created_by' => $admin->id,
                'source' => 'admin',
                'customer_name' => $customer['customer_name'],
                'customer_phone' => $customer['customer_phone'],
                'customer_email' => $customer['customer_email'],
                'order_type' => $data['order_type'],
                'booking_date' => $data['booking_date'],
                'booking_time' => $bookingTime,
                'pickup_time' => $data['pickup_time'] ?? null,
                'delivery_time' => $data['delivery_time'] ?? null,
                'delivery_address' => $data['delivery_address'] ?? null,
                'order_status' => 'baru',
                'notes' => $data['notes'] ?? null,
                'is_price_pending' => $isPricePending,
                'subtotal' => $isPricePending ? null : round($subtotal, 2),
                'unique_code' => null,
                'total_amount' => 0,
                'dp_percentage' => 25,
                'dp_unique_code' => null,
                'dp_amount' => 0,
                'remaining_amount' => 0,
                'editable_until' => Carbon::parse($data['booking_date'])->subDays(3)->toDateString(),
            ]);

            foreach ($resolvedItems as $resolvedItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $resolvedItem['menu_item_id'],
                    'menu_name' => $resolvedItem['menu_name'],
                    'menu_category_type' => $resolvedItem['menu_category_type'],
                    'menu_unit' => $resolvedItem['menu_unit'],
                    'kondisi_produk' => $resolvedItem['kondisi_produk'],
                    'adat_type' => $resolvedItem['adat_type'],
                    'quantity' => $resolvedItem['quantity'],
                    'unit_price' => $resolvedItem['unit_price'],
                    'subtotal' => $resolvedItem['subtotal'],
                    'notes' => $resolvedItem['notes'],
                ]);
            }

            if (! $isPricePending) {
                $uniqueCode = $this->generateUniqueCode();
                $dpUniqueCode = $this->generateUniqueCode($uniqueCode);
                $subtotalValue = round($subtotal, 2);
                $totalAmount = round($subtotalValue + $uniqueCode, 2);
                $dpAmount = (string) $data['payment_method'] === 'dp'
                    ? round(($subtotalValue * 0.25) + $dpUniqueCode, 2)
                    : 0;
                $remainingAmount = (string) $data['payment_method'] === 'dp'
                    ? round($totalAmount - $dpAmount, 2)
                    : 0.0;

                $order->update([
                    'subtotal' => $subtotalValue,
                    'unique_code' => $uniqueCode,
                    'total_amount' => $totalAmount,
                    'dp_unique_code' => $dpUniqueCode,
                    'dp_amount' => $dpAmount,
                    'remaining_amount' => $remainingAmount,
                ]);

                if ((string) $data['payment_method'] === 'dp') {
                    Payment::create([
                        'order_id' => $order->id,
                        'type' => 'dp',
                        'expected_amount' => $dpAmount,
                        'unique_code' => $dpUniqueCode,
                        'status' => 'verified',
                        'verified_by' => $admin->id,
                        'verified_at' => now(),
                    ]);

                    Payment::create([
                        'order_id' => $order->id,
                        'type' => 'pelunasan',
                        'expected_amount' => $remainingAmount,
                        'unique_code' => $uniqueCode,
                        'status' => 'pending',
                    ]);
                    // Admin created the order and DP is already verified by admin,
                    // mark order as in progress so production can start.
                    if ($order->order_status === 'baru') {
                        $order->update(['order_status' => 'diproses']);
                    }
                } else {
                    Payment::create([
                        'order_id' => $order->id,
                        'type' => 'pelunasan',
                        'expected_amount' => $totalAmount,
                        'unique_code' => $uniqueCode,
                        'status' => 'verified',
                        'verified_by' => $admin->id,
                        'verified_at' => now(),
                    ]);
                    // Admin created order and immediately paid in full — start processing.
                    if ($order->order_status === 'baru') {
                        $order->update(['order_status' => 'diproses']);
                    }
                }
            }

            return $order->load(['user', 'createdBy', 'items', 'payments']);
        });
    }

    private function resolveCustomerSnapshot(array $data): array
    {
        if (($data['customer_type'] ?? 'walkin') === 'terdaftar') {
            $user = User::findByHashid($data['user_id']);

            return [
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'customer_phone' => $user->phone,
                'customer_email' => $user->email,
            ];
        }

        // For walkin customers: auto-create user if email is provided
        $customerEmail = $data['customer_email'] ?? null;
        $userId = null;

        if ($customerEmail) {
            // Check if user with this email already exists
            $user = User::query()->where('email', $customerEmail)->first();

            if ($user) {
                $userId = $user->id;
            } else {
                // Auto-create new user with role 'pembeli'
                $user = User::create([
                    'name' => trim((string) ($data['customer_name'] ?? 'Pelanggan')),
                    'email' => $customerEmail,
                    'phone' => $data['customer_phone'] ?? null,
                    'role' => 'pembeli',
                    'password' => bcrypt(Str::random(16)),
                ]);
                $userId = $user->id;
            }
        }

        return [
            'user_id' => $userId,
            'customer_name' => trim((string) ($data['customer_name'] ?? '')),
            'customer_phone' => $data['customer_phone'] ?? null,
            'customer_email' => $customerEmail,
        ];
    }

    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = "RCS-{$date}-";

        $lastOrder = Order::query()
            ->where('order_number', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('order_number')
            ->first();

        $sequence = 1;
        if ($lastOrder !== null) {
            $sequence = ((int) substr($lastOrder->order_number, -4)) + 1;
        }

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    private function generateUniqueCode(?int $except = null): int
    {
        do {
            $code = random_int(100, 999);
        } while (
            $code === $except ||
            Order::query()->where('unique_code', $code)->exists() ||
            Order::query()->where('dp_unique_code', $code)->exists() ||
            Payment::query()->where('unique_code', $code)->exists()
        );

        return $code;
    }

    /**
     * @return array<int, string>
     */
    private function resolveAllowedKondisi(MenuItem $menuItem): array
    {
        $allowedKondisi = KondisiProdukRules::forCategoryType((string) $menuItem->category?->type);

        if ($menuItem->menu_type === 'eceran') {
            $allowedKondisi = KondisiProdukRules::ECERAN;
        }

        if (
            $menuItem->menu_type === 'eceran' &&
            $menuItem->sub_type === 'babi_adat'
        ) {
            $allowedKondisi = array_values(array_unique(array_merge(
                $allowedKondisi,
                KondisiProdukRules::OLAHAN,
            )));
        }

        return $allowedKondisi;
    }
}
