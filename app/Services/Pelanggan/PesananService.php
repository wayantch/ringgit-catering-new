<?php

namespace App\Services\Pelanggan;

use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentVerification;
use App\Models\User;
use App\Services\LoyaltyService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PesananService
{
    public function __construct(
        private LoyaltyService $loyaltyService,
    ) {}

    /**
     * Prepare a checkout draft without creating an order yet.
     *
     * @return array{checkout: array, summary: array, cart_count: int}
     */
    public function buildCheckoutDraft(User $user, array $data): array
    {
        ['cartItems' => $cartItems, 'cartSummary' => $cartSummary] = $this->getCheckoutCartData($user, $data);
        $cashbackBreakdown = $this->buildCashbackBreakdownFromCartItems($cartItems);
        $cashbackTotal = array_reduce(
            $cashbackBreakdown,
            static fn (float $carry, array $item): float => $carry + (float) $item['cashback'],
            0.0,
        );

        return [
            'checkout' => $data,
            'summary' => array_merge($cartSummary, [
                'cashback_breakdown' => $cashbackBreakdown,
                'cashback_total' => $cashbackTotal,
                'total_after_cashback' => max(0, (float) $cartSummary['total'] - $cashbackTotal),
            ]),
            'cart_count' => $cartItems->count(),
        ];
    }

    /**
     * Finalize a draft checkout by creating the order and uploading the proof.
     */
    public function finalizeCheckoutDraft(
        User $user,
        array $draft,
        UploadedFile $file,
        string $paymentType,
    ): Order {
        if (! isset($draft['checkout'], $draft['summary'], $draft['cart_count'])) {
            throw new \Exception('Draft checkout tidak valid.');
        }

        $keranjangService = new KeranjangService;
        $currentCartItems = $keranjangService->getCartItems($user);
        $currentCartSummary = $keranjangService->getCartSummary($user);

        if (
            $currentCartItems->count() !== (int) $draft['cart_count'] ||
            (float) $currentCartSummary['subtotal'] !== (float) $draft['summary']['subtotal']
        ) {
            throw new \Exception('Keranjang berubah. Silakan checkout ulang.');
        }

        $checkoutData = $draft['checkout'];
        $checkoutData['use_loyalty_discount'] = false;

        $order = $this->create($user, $checkoutData);

        $order->update([
            'subtotal' => $draft['summary']['subtotal'],
            'unique_code' => $draft['summary']['unique_code'],
            'dp_unique_code' => $draft['summary']['dp_unique_code'],
            'total_amount' => $draft['summary']['total'],
            'dp_amount' => $draft['summary']['dp_total'],
            'remaining_amount' => $draft['summary']['remaining_amount'],
        ]);

        if (! empty($draft['checkout']['use_loyalty_discount'])) {
            $activeConfig = $this->loyaltyService->getActiveConfig();

            if ($activeConfig && $this->loyaltyService->isEligible($user, $activeConfig)) {
                $this->loyaltyService->applyToOrder($order->refresh(), $activeConfig);
            }
        }

        $this->uploadPaymentVerification($order->refresh(), $file, $paymentType);

        return $order->refresh();
    }

    /**
     * Create order from cart items
     */
    public function create(User $user, array $data): Order
    {
        ['cartItems' => $cartItems, 'cartSummary' => $cartSummary] = $this->getCheckoutCartData($user, $data);
        $bookingTime = $this->resolveBookingTime($data);

        if ($bookingTime === null) {
            throw new \Exception('Jam booking wajib diisi.');
        }

        // Generate order number
        $lastOrder = Order::latest('id')->first();
        $orderNumber = 'ORD-'.now()->format('Ymd').'-'.str_pad(($lastOrder?->id ?? 0) + 1, 5, '0', STR_PAD_LEFT);

        $order = DB::transaction(function () use ($user, $data, $cartItems, $cartSummary, $orderNumber, $bookingTime) {
            $orderData = [
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'source' => 'pembeli',
                'customer_name' => $user->name,
                'customer_phone' => $data['phone'] ?? $user->phone,
                'customer_email' => $user->email,
                'order_type' => $data['order_type'],
                'booking_date' => $data['booking_date'],
                'booking_time' => $bookingTime,
                'delivery_address' => $data['delivery_address'] ?? null,
                'order_status' => 'baru',
                'subtotal' => $cartSummary['subtotal'],
                'unique_code' => $cartSummary['unique_code'],
                'dp_unique_code' => $cartSummary['dp_unique_code'],
                'total_amount' => $cartSummary['total'],
                'dp_amount' => $cartSummary['dp_total'],
                'remaining_amount' => $cartSummary['remaining_amount'],
                'notes' => $data['notes'] ?? null,
            ];

            // Set pickup_time or delivery_time based on order type
            if ($data['order_type'] === 'takeaway') {
                $orderData['pickup_time'] = $bookingTime;
            } else {
                $orderData['delivery_time'] = $bookingTime;
            }

            $order = Order::create($orderData);

            // Create order items
            foreach ($cartItems as $cartItem) {
                $menuItem = $cartItem->menuItem;
                $quantity = (float) $cartItem->quantity;

                // Determine unit price and subtotal. For timbang_hidup, find matching tier.
                $unitPrice = null;
                if ($menuItem->menu_type === 'timbang_hidup') {
                    $tiers = $menuItem->relationLoaded('tiers')
                        ? $menuItem->tiers
                        : $menuItem->tiers()->orderBy('sort_order')->get();

                    $tier = $tiers->first(static function ($t) use ($quantity) {
                        return $t->matchesBerat($quantity);
                    });

                    if ($tier) {
                        $unitPrice = $cartItem->kondisi_produk === 'mateng'
                            ? (float) $tier->harga_matang
                            : (float) $tier->harga_mentah;
                    }
                } else {
                    $unitPrice = $menuItem->min_price ?? null;
                }

                $subtotal = $unitPrice === null ? null : $unitPrice * $quantity;

                $itemNotes = $cartItem->notes;
                if (! empty($cartItem->portion)) {
                    $label = $cartItem->portion === 'utuh' ? 'Utuh / Satu ekor' : 'Setengah ekor';
                    $itemNotes = trim(($label).($itemNotes ? ' - '.$itemNotes : ''));
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $cartItem->menu_item_id,
                    'menu_name' => $menuItem->name,
                    'menu_category_type' => $this->resolveMenuCategoryType($menuItem),
                    'menu_unit' => $menuItem->unit ?? null,
                    'kondisi_produk' => $cartItem->kondisi_produk,
                    'adat_type' => $cartItem->adat_type,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'notes' => $itemNotes,
                ]);
            }

            if (! empty($data['use_loyalty_discount'])) {
                $activeConfig = $this->loyaltyService->getActiveConfig();

                if ($activeConfig && $this->loyaltyService->isEligible($user, $activeConfig)) {
                    $this->loyaltyService->applyToOrder($order, $activeConfig);
                }
            }

            // Clear cart
            $keranjangService = new KeranjangService;
            $keranjangService->clearCart($user);

            return $order;
        });

        return $order;
    }

    /**
     * @return array{cartItems: Collection<int, mixed>, cartSummary: array}
     */
    private function getCheckoutCartData(User $user, array $data): array
    {
        $keranjangService = new KeranjangService;
        $cartItems = $keranjangService->getCartItems($user);

        if ($cartItems->isEmpty()) {
            throw new \Exception('Keranjang kosong');
        }

        // Temporary rule: olahan/eceran items must be booked at least H+1.
        $minimumBookingDate = now()->addDay()->startOfDay();
        $bookingDate = Carbon::parse($data['booking_date'])->startOfDay();

        foreach ($cartItems as $item) {
            $categoryType = $this->resolveMenuCategoryType($item->menuItem);

            if (in_array($categoryType, ['olahan', 'eceran'], true) && $bookingDate->lt($minimumBookingDate)) {
                throw new \Exception('Pesanan minimal H+1 dari tanggal pemesanan.');
            }
        }

        return [
            'cartItems' => $cartItems,
            'cartSummary' => $keranjangService->getCartSummary($user),
        ];
    }

    private function resolveBookingTime(array $data): ?string
    {
        return $data['booking_time']
            ?? $data['pickup_time']
            ?? $data['delivery_time']
            ?? null;
    }

    /**
     * Get user orders with pagination
     */
    public function getOrders(
        User $user,
        int $perPage = 10,
        string $filter = 'all',
        ?string $date = null,
    ): LengthAwarePaginator {
        $query = Order::where('user_id', $user->id);
        $today = Carbon::today();

        if ($filter === 'today') {
            $query->whereDate('booking_date', $today);
        } elseif ($filter === 'yesterday') {
            $query->whereDate('booking_date', $today->copy()->subDay());
        } elseif ($filter === 'last_week') {
            $query->whereBetween('booking_date', [
                $today->copy()->subDays(7),
                $today->copy()->subDay(),
            ]);
        } elseif ($filter === 'date' && $date) {
            $query->whereDate('booking_date', Carbon::parse($date));
        }

        return $query
            ->withCount('items')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->through(function ($order): array {
                return [
                    'id' => $order->hashid,
                    'order_number' => $order->order_number,
                    'booking_date' => $order->booking_date,
                    'booking_time' => $order->booking_time,
                    'order_type' => $order->order_type === 'takeaway' ? 'Pickup' : 'Delivery',
                    'order_status' => $order->order_status,
                    'total_amount' => $order->total_amount,
                    'items_count' => $order->items_count,
                ];
            });
    }

    /**
     * Get order detail
     */
    public function getDetail(Order $order): array
    {
        $order->loadMissing(['items.menuItem.tiers', 'paymentVerifications']);
        $cashbackBreakdown = $this->buildCashbackBreakdown($order);

        return [
            'hashid' => $order->hashid,
            'id' => $order->hashid,
            'order_number' => $order->order_number,
            'booking_date' => $order->booking_date,
            'booking_time' => $order->booking_time,
            'order_type' => $order->order_type === 'takeaway' ? 'Pickup' : 'Delivery',
            'order_status' => $order->order_status,
            'delivery_address' => $order->delivery_address,
            'subtotal' => $order->subtotal,
            'total_amount' => $order->total_amount,
            'dp_amount' => $order->dp_amount,
            'remaining_amount' => $order->remaining_amount,
            'unique_code' => $order->unique_code,
            'dp_unique_code' => $order->dp_unique_code,
            'notes' => $order->notes,
            'source' => $order->source,
            'cashback_eligible' => count($cashbackBreakdown) > 0,
            'cashback_breakdown' => $cashbackBreakdown,
            'total_cashback' => array_reduce(
                $cashbackBreakdown,
                static fn (float $carry, array $item): float => $carry + (float) $item['cashback'],
                0.0,
            ),
            'total_after_cashback' => max(
                0,
                (float) $order->total_amount - array_reduce(
                    $cashbackBreakdown,
                    static fn (float $carry, array $item): float => $carry + (float) $item['cashback'],
                    0.0,
                ),
            ),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->hashid,
                    'order_id' => $item->order?->hashid,
                    'menu_item_id' => $item->menuItem?->hashid,
                    'menu_item' => $item->menuItem->name,
                    'menu_category_type' => $item->menuItem?->menu_type,
                    'menu_sub_type' => $item->menuItem?->sub_type,
                    'kondisi_produk' => $item->kondisi_produk,
                    'adat_type' => $item->adat_type,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                    'notes' => $item->notes,
                ];
            }),
            'payment_verifications' => $order->paymentVerifications->map(function ($pv) {
                return [
                    'id' => $pv->hashid,
                    'payment_type' => $pv->payment_type,
                    'amount' => $pv->amount,
                    'proof_image' => $pv->proof_image ? $pv->proof_image : null,
                    'status' => $pv->status,
                    'verified_at' => $pv->verified_at,
                ];
            }),
        ];
    }

    /**
     * @return array<int, array{menu_name: string, kode: string, cashback: float}>
     */
    private function buildCashbackBreakdown(Order $order): array
    {
        $breakdown = [];

        foreach ($order->items as $item) {
            $menuItem = $item->menuItem;

            if (! $menuItem || $menuItem->menu_type !== 'timbang_hidup') {
                continue;
            }

            $quantity = (float) $item->quantity;
            $tiers = $menuItem->relationLoaded('tiers')
                ? $menuItem->tiers
                : $menuItem->tiers()->orderBy('sort_order')->get();

            $tier = $tiers->first(static function (MenuItemPriceTier $tier) use ($quantity): bool {
                return $tier->matchesBerat($quantity);
            });

            if (! $tier || (float) $tier->cashback <= 0) {
                continue;
            }

            $breakdown[] = [
                'menu_name' => $item->menu_name,
                'kode' => $tier->kode,
                'cashback' => (float) $tier->cashback,
            ];
        }

        return $breakdown;
    }

    /**
     * @param  iterable<int, mixed>  $cartItems
     * @return array<int, array{menu_name: string, kode: string, cashback: float}>
     */
    private function buildCashbackBreakdownFromCartItems(Collection $cartItems): array
    {
        $breakdown = [];

        foreach ($cartItems as $item) {
            $menuItem = $item->menuItem;

            if (! $menuItem || $menuItem->menu_type !== 'timbang_hidup') {
                continue;
            }

            $quantity = (float) $item->quantity;
            $tiers = $menuItem->relationLoaded('tiers')
                ? $menuItem->tiers
                : $menuItem->tiers()->orderBy('sort_order')->get();

            $tier = $tiers->first(static function (MenuItemPriceTier $tier) use ($quantity): bool {
                return $tier->matchesBerat($quantity);
            });

            if (! $tier || (float) $tier->cashback <= 0) {
                continue;
            }

            $breakdown[] = [
                'menu_name' => $menuItem->name,
                'kode' => $tier->kode,
                'cashback' => (float) $tier->cashback,
            ];
        }

        return $breakdown;
    }

    private function resolveMenuCategoryType(MenuItem $menuItem): string
    {
        $categoryType = $menuItem->category_type ?? $menuItem->menu_type;

        if (in_array($categoryType, ['timbang_hidup', 'olahan', 'eceran'], true)) {
            return $categoryType;
        }

        throw new \Exception('Kategori menu tidak valid.');
    }

    /**
     * Upload payment verification
     */
    public function uploadPaymentVerification(Order $order, UploadedFile $file, string $paymentType): PaymentVerification
    {
        $order->loadMissing(['items.menuItem.tiers']);

        // Check if payment verification already exists
        $existingPv = $order->paymentVerifications()
            ->where('payment_type', $paymentType)
            ->orderByDesc('id')
            ->first();

        $path = $file->store('payment-proofs', 'public');
        $amount = $this->resolvePaymentVerificationAmount($order, $paymentType);

        if ($existingPv) {
            // Delete old image if exists
            if ($existingPv->proof_image) {
                Storage::disk('public')->delete($existingPv->proof_image);
            }

            if ($existingPv->status === 'pending') {
                $existingPv->update([
                    'proof_image' => $path,
                    'status' => 'pending',
                    'verified_at' => null,
                    'verified_by' => null,
                    'amount' => $amount,
                ]);

                return $existingPv->refresh();
            }

            if ($existingPv->status === 'rejected') {
                $pv = PaymentVerification::create([
                    'order_id' => $order->id,
                    'payment_type' => $paymentType,
                    'amount' => $amount,
                    'proof_image' => $path,
                    'status' => 'pending',
                ]);

                return $pv;
            }
        }

        // Create new payment verification
        $pv = PaymentVerification::create([
            'order_id' => $order->id,
            'payment_type' => $paymentType,
            'amount' => $amount,
            'proof_image' => $path,
            'status' => 'pending',
        ]);

        return $pv;
    }

    private function resolvePaymentVerificationAmount(Order $order, string $paymentType): float
    {
        if ($paymentType === 'dp') {
            return (float) $order->dp_amount;
        }

        $cashbackTotal = array_reduce(
            $this->buildCashbackBreakdown($order),
            static fn (float $carry, array $item): float => $carry + (float) $item['cashback'],
            0.0,
        );

        return max(0.0, (float) $order->total_amount - $cashbackTotal);
    }
}
