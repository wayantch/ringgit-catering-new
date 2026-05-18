<?php

namespace App\Services\Pelanggan;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentVerification;
use App\Models\MenuItemPriceTier;
use App\Models\User;
use App\Services\LoyaltyService;
use Carbon\Carbon;
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
     * Create order from cart items
     */
    public function create(User $user, array $data): Order
    {
        $keranjangService = new KeranjangService;
        $cartItems = $keranjangService->getCartItems($user);
        $cartSummary = $keranjangService->getCartSummary($user);

        if ($cartItems->isEmpty()) {
            throw new \Exception('Keranjang kosong');
        }

        // Temporary rule: olahan/eceran items must be booked at least H+1.
        $minimumBookingDate = now()->addDay()->startOfDay();
        $bookingDate = Carbon::parse($data['booking_date'])->startOfDay();

        foreach ($cartItems as $item) {
            $categoryType = $item->menuItem->category->type ?? null;

            if (in_array($categoryType, ['olahan', 'eceran'], true) && $bookingDate->lt($minimumBookingDate)) {
                throw new \Exception('Pesanan minimal H+1 dari tanggal pemesanan.');
            }
        }

        // Generate order number
        $lastOrder = Order::latest('id')->first();
        $orderNumber = 'ORD-' . now()->format('Ymd') . '-' . str_pad(($lastOrder?->id ?? 0) + 1, 5, '0', STR_PAD_LEFT);

        $order = DB::transaction(function () use ($user, $data, $cartItems, $cartSummary, $orderNumber) {
            $orderData = [
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'source' => 'pembeli',
                'customer_name' => $user->name,
                'customer_phone' => $data['phone'] ?? $user->phone,
                'customer_email' => $user->email,
                'order_type' => $data['order_type'],
                'booking_date' => $data['booking_date'],
                'booking_time' => $data['booking_time'],
                'delivery_address' => $data['delivery_address'] ?? null,
                'order_status' => 'baru',
                'subtotal' => $cartSummary['subtotal'],
                'total_amount' => $cartSummary['total'],
                'dp_amount' => $cartSummary['dp_total'],
                'remaining_amount' => $cartSummary['remaining_amount'],
                'notes' => $data['notes'] ?? null,
            ];

            // Set pickup_time or delivery_time based on order type
            if ($data['order_type'] === 'takeaway') {
                $orderData['pickup_time'] = $data['booking_time'];
            } else {
                $orderData['delivery_time'] = $data['booking_time'];
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

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $cartItem->menu_item_id,
                    'menu_name' => $menuItem->name,
                    'menu_category_type' => $menuItem->category->type ?? null,
                    'menu_unit' => $menuItem->unit ?? null,
                    'kondisi_produk' => $cartItem->kondisi_produk,
                    'adat_type' => $cartItem->adat_type,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'notes' => $cartItem->notes,
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
            ->latest('booking_date')
            ->latest('id')
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
            'total_amount' => $order->total_amount,
            'dp_amount' => $order->dp_amount,
            'remaining_amount' => $order->remaining_amount,
            'notes' => $order->notes,
            'source' => $order->source,
            'cashback_eligible' => count($cashbackBreakdown) > 0,
            'cashback_breakdown' => $cashbackBreakdown,
            'total_cashback' => array_reduce(
                $cashbackBreakdown,
                static fn(float $carry, array $item): float => $carry + (float) $item['cashback'],
                0.0,
            ),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->hashid,
                    'order_id' => $item->order?->hashid,
                    'menu_item_id' => $item->menuItem?->hashid,
                    'menu_item' => $item->menuItem->name,
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
     * Upload payment verification
     */
    public function uploadPaymentVerification(Order $order, UploadedFile $file, string $paymentType): PaymentVerification
    {
        // Check if payment verification already exists
        $existingPv = $order->paymentVerifications()
            ->where('payment_type', $paymentType)
            ->orderByDesc('id')
            ->first();

        $path = $file->store('payment-proofs', 'public');

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
                ]);

                return $existingPv->refresh();
            }

            if ($existingPv->status === 'rejected') {
                $pv = PaymentVerification::create([
                    'order_id' => $order->id,
                    'payment_type' => $paymentType,
                    'amount' => $paymentType === 'dp' ? $order->dp_amount : $order->remaining_amount,
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
            'amount' => $paymentType === 'dp' ? $order->dp_amount : $order->remaining_amount,
            'proof_image' => $path,
            'status' => 'pending',
        ]);

        return $pv;
    }
}
