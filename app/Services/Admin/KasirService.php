<?php

namespace App\Services\Admin;

use App\Enums\KondisiProduk as KondisiProdukRules;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Services\OrderCodeGenerator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class KasirService
{
    public function __construct(
        private OrderCodeGenerator $orderCodeGenerator,
    ) {}

    /**
     * Data needed to render the kasir order form.
     *
     * @return array{menuItems: array<int, array<string, mixed>>, customers: array<int, array<string, mixed>>, dpPercentage: int}
     */
    public function getFormData(): array
    {
        return [
            'menuItems' => $this->getMenuPickerItems(),
            'customers' => $this->getCustomerOptions(),
            'dpPercentage' => Setting::current()->dp_percentage,
        ];
    }

    /**
     * Full menu payload for the kasir picker, including tiers and variants.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getMenuPickerItems(): array
    {
        return MenuItem::query()
            ->with(['category:id,name,type', 'tiers', 'variants'])
            ->where('is_available', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'category_id',
                'name',
                'image',
                'menu_type',
                'sub_type',
                'base_price',
                'babi_mentah_price',
                'babi_matang_price',
                'bundle_desc',
                'free_ongkir_km',
                'unit',
                'is_available',
            ])
            ->map(static function (MenuItem $menuItem): array {
                return [
                    'id' => $menuItem->hashid,
                    'name' => $menuItem->name,
                    'image' => $menuItem->image,
                    'menu_type' => $menuItem->menu_type,
                    'sub_type' => $menuItem->sub_type,
                    'base_price' => $menuItem->base_price !== null ? (float) $menuItem->base_price : null,
                    'babi_mentah_price' => $menuItem->babi_mentah_price !== null ? (float) $menuItem->babi_mentah_price : null,
                    'babi_matang_price' => $menuItem->babi_matang_price !== null ? (float) $menuItem->babi_matang_price : null,
                    'bundle_desc' => $menuItem->bundle_desc,
                    'free_ongkir_km' => $menuItem->free_ongkir_km,
                    'unit' => $menuItem->unit,
                    'is_available' => (bool) $menuItem->is_available,
                    'category' => [
                        'id' => $menuItem->category?->hashid,
                        'name' => $menuItem->category?->name,
                        'type' => $menuItem->category?->type,
                    ],
                    'tiers' => $menuItem->tiers->map(static function (MenuItemPriceTier $tier): array {
                        return [
                            'id' => (string) $tier->id,
                            'kode' => $tier->kode,
                            'is_half' => (bool) $tier->is_half,
                            'berat_min' => (float) $tier->berat_min,
                            'berat_max' => $tier->berat_max !== null ? (float) $tier->berat_max : null,
                            'harga_mentah' => (float) $tier->harga_mentah,
                            'harga_matang' => (float) $tier->harga_matang,
                            'cashback' => (float) $tier->cashback,
                        ];
                    })->values(),
                    'variants' => $menuItem->variants->map(static function (MenuItemVariant $variant): array {
                        return [
                            'id' => (string) $variant->id,
                            'label' => $variant->label,
                            'harga' => (float) $variant->harga,
                        ];
                    })->values(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Slim menu payload for the order edit form.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getMenuOptions(): array
    {
        return MenuItem::query()
            ->with('category:id,type')
            ->where('is_available', true)
            ->get(['id', 'category_id', 'name', 'unit', 'base_price'])
            ->map(static function (MenuItem $menuItem): array {
                return [
                    'id' => $menuItem->hashid,
                    'name' => $menuItem->name,
                    'category_type' => $menuItem->category?->type,
                    'unit' => $menuItem->unit,
                    'base_price' => $menuItem->base_price !== null ? (float) $menuItem->base_price : null,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Registered buyers selectable as the order customer.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getCustomerOptions(): array
    {
        return User::query()
            ->where('role', 'pembeli')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone'])
            ->map(static fn (User $user): array => [
                'id' => $user->hashid,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ])
            ->values()
            ->all();
    }

    public function createManualOrder(array $data, User $admin): Order
    {
        $dpPercentage = Setting::current()->dp_percentage;

        return DB::transaction(function () use ($data, $admin, $dpPercentage): Order {
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
                'order_number' => $this->orderCodeGenerator->nextOrderNumber('RCS', 4),
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
                'dp_percentage' => $dpPercentage,
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
                $uniqueCode = $this->orderCodeGenerator->uniqueCode();
                $dpUniqueCode = $this->orderCodeGenerator->uniqueCode([$uniqueCode]);
                $subtotalValue = round($subtotal, 2);
                $totalAmount = round($subtotalValue + $uniqueCode, 2);
                $dpAmount = (string) $data['payment_method'] === 'dp'
                    ? round(($subtotalValue * $dpPercentage / 100) + $dpUniqueCode, 2)
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
        }, 3);
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
