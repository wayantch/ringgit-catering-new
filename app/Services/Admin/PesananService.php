<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaymentVerification;
use App\Models\User;
use Carbon\Carbon;
use InvalidArgumentException;

class PesananService
{
    public function getPaginatedOrders(array $filters = [], int $perPage = 15, int $page = 1): array
    {
        $query = Order::query()
            ->with(['user', 'createdBy', 'items.menuItem.tiers', 'payments', 'paymentVerifications'])
            ->latest('created_at');

        // Only show pembeli orders that have payment verifications (bukti upload)
        // Or show admin orders regardless
        $query->where(function ($q) {
            $q->where('source', 'admin')
                ->orWhere(function ($subQ) {
                    $subQ->where('source', 'pembeli')
                        ->whereHas('paymentVerifications');
                });
        });

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('order_status', $filters['status']);
        }

        if (isset($filters['source'])) {
            $query->where('source', $filters['source']);
        }

        if (isset($filters['date_from']) && isset($filters['date_to'])) {
            $query->whereBetween('booking_date', [
                $filters['date_from'],
                $filters['date_to'],
            ]);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => collect($paginator->items())->map(function (Order $order): array {
                $cashbackSummary = $this->getCashbackSummary($order);

                return [
                    'id' => $order->hashid,
                    'order_number' => $order->order_number,
                    'source' => $order->source,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'booking_date' => $order->booking_date?->toDateString(),
                    'status' => $order->order_status,
                    'order_status' => $order->order_status,
                    'payment_method' => $cashbackSummary['payment_method'],
                    'total_amount' => $order->total_amount,
                    ...$cashbackSummary,
                    'is_price_pending' => $order->is_price_pending,
                ];
            })->values()->all(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'total' => $paginator->total(),
            'links' => $paginator->links()->elements[0] ?? [],
        ];
    }

    public function getOrderDetail(Order $order): Order
    {
        return $order->load([
            'user',
            'createdBy',
            'items.menuItem.tiers',
            'payments.verifiedBy',
            'paymentVerifications',
        ]);
    }

    /**
     * @return array{has_cashback: bool, cashback_eligible: bool, cashback_breakdown: array<int, array{menu_name: string, kode: string, cashback: float}>, total_cashback: float, total_after_cashback: float, payment_method: string}
     */
    public function getCashbackSummary(Order $order): array
    {
        $cashbackBreakdown = $this->buildCashbackBreakdown($order);
        $totalCashback = array_reduce(
            $cashbackBreakdown,
            static fn (float $carry, array $item): float => $carry + (float) $item['cashback'],
            0.0,
        );
        $paymentMethod = $this->resolvePaymentMethod($order);
        $shouldApplyCashback = $paymentMethod === 'full' && $totalCashback > 0;

        return [
            'has_cashback' => $totalCashback > 0,
            'cashback_eligible' => count($cashbackBreakdown) > 0,
            'cashback_breakdown' => $cashbackBreakdown,
            'total_cashback' => $totalCashback,
            'total_after_cashback' => $shouldApplyCashback
                ? max(0, (float) $order->total_amount - $totalCashback)
                : (float) $order->total_amount,
            'payment_method' => $paymentMethod,
        ];
    }

    public function createManualOrder(array $data, User $admin): Order
    {
        $items = $data['items'] ?? [];
        if (empty($items)) {
            throw new InvalidArgumentException('Order must have at least one item');
        }

        $dpPercentage = $data['dp_percentage'] ?? 25;
        $bookingTime = $data['order_type'] === 'delivery'
            ? ($data['delivery_time'] ?? null)
            : ($data['pickup_time'] ?? null);

        if ($bookingTime === null || $bookingTime === '') {
            throw new InvalidArgumentException('Booking time is required');
        }

        $totals = $this->calculateTotals($items, $dpPercentage);

        if ($totals['is_price_pending']) {
            throw new InvalidArgumentException('All items must have prices before creating order');
        }

        $order = Order::create([
            'user_id' => $data['user_id'] ?? null,
            'order_number' => $this->generateOrderNumber(),
            'created_by' => $admin->id,
            'source' => 'admin',
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'] ?? null,
            'order_type' => $data['order_type'],
            'booking_date' => $data['booking_date'],
            'booking_time' => $bookingTime,
            'pickup_time' => $data['pickup_time'] ?? null,
            'delivery_time' => $data['delivery_time'] ?? null,
            'delivery_address' => $data['delivery_address'] ?? null,
            'order_status' => 'baru',
            'notes' => $data['notes'] ?? null,
            'is_price_pending' => $totals['is_price_pending'],
            'subtotal' => $totals['subtotal'],
            'unique_code' => $this->generateUniqueCode(),
            'total_amount' => $totals['total_amount'],
            'dp_percentage' => $dpPercentage,
            'dp_unique_code' => $this->generateUniqueCode(),
            'dp_amount' => $totals['dp_amount'],
            'remaining_amount' => $totals['remaining_amount'],
            'editable_until' => Carbon::parse($data['booking_date'])->subDays(3),
        ]);

        // Create order items with snapshots
        foreach ($items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $item['menu_item_id'] ?? null,
                'menu_name' => $item['menu_name'],
                'menu_category_type' => $item['menu_category_type'],
                'menu_unit' => $item['menu_unit'],
                'kondisi_produk' => $item['kondisi_produk'],
                'adat_type' => $item['adat_type'] ?? null,
                'quantity' => (float) $item['qty'],
                'unit_price' => isset($item['unit_price']) ? (float) $item['unit_price'] : null,
                'subtotal' => isset($item['unit_price']) ? (float) $item['unit_price'] * (float) $item['qty'] : null,
                'notes' => $item['notes'] ?? null,
            ]);
        }

        return $this->getOrderDetail($order);
    }

    public function updateManualOrder(Order $order, array $data, User $admin): Order
    {
        if ($order->source === 'admin' && ! $order->isEditable()) {
            throw new InvalidArgumentException('Order is no longer editable (past editable_until date)');
        }

        if ($order->source === 'pembeli') {
            throw new InvalidArgumentException('Cannot edit pembeli orders');
        }

        $items = $data['items'] ?? [];
        if (empty($items)) {
            throw new InvalidArgumentException('Order must have at least one item');
        }

        $dpPercentage = $data['dp_percentage'] ?? $order->dp_percentage;
        $bookingTime = $data['order_type'] === 'delivery'
            ? ($data['delivery_time'] ?? null)
            : ($data['pickup_time'] ?? null);

        if ($bookingTime === null || $bookingTime === '') {
            throw new InvalidArgumentException('Booking time is required');
        }

        $totals = $this->calculateTotals($items, $dpPercentage);

        if ($totals['is_price_pending']) {
            throw new InvalidArgumentException('All items must have prices before updating order');
        }

        $order->update([
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'] ?? $order->customer_email,
            'order_type' => $data['order_type'],
            'booking_date' => $data['booking_date'],
            'booking_time' => $bookingTime,
            'pickup_time' => $data['pickup_time'] ?? null,
            'delivery_time' => $data['delivery_time'] ?? null,
            'delivery_address' => $data['delivery_address'] ?? $order->delivery_address,
            'notes' => $data['notes'] ?? null,
            'is_price_pending' => $totals['is_price_pending'],
            'subtotal' => $totals['subtotal'],
            'total_amount' => $totals['total_amount'],
            'dp_percentage' => $dpPercentage,
            'dp_amount' => $totals['dp_amount'],
            'remaining_amount' => $totals['remaining_amount'],
        ]);

        // Delete existing items and recreate
        $order->items()->delete();

        foreach ($items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $item['menu_item_id'] ?? null,
                'menu_name' => $item['menu_name'],
                'menu_category_type' => $item['menu_category_type'],
                'menu_unit' => $item['menu_unit'],
                'kondisi_produk' => $item['kondisi_produk'],
                'adat_type' => $item['adat_type'] ?? null,
                'quantity' => (float) $item['qty'],
                'unit_price' => isset($item['unit_price']) ? (float) $item['unit_price'] : null,
                'subtotal' => isset($item['unit_price']) ? (float) $item['unit_price'] * (float) $item['qty'] : null,
                'notes' => $item['notes'] ?? null,
            ]);
        }

        return $this->getOrderDetail($order);
    }

    public function verifyPayment(Payment $payment, User $admin): Payment
    {
        $order = $payment->order;

        $payment->update([
            'status' => 'verified',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);

        // For pembeli orders: only move to 'diproses' when all payments (dp + pelunasan) are verified
        if ($order->source === 'pembeli') {
            $allPaymentsVerified = $order->payments()
                ->whereIn('type', ['dp', 'pelunasan'])
                ->where('status', '!=', 'verified')
                ->doesntExist();

            if ($allPaymentsVerified && $order->order_status === 'baru') {
                $order->update(['order_status' => 'diproses']);
            }
        }

        // For admin-created orders: when admin verifies either DP or a direct pelunasan,
        // immediately mark order as 'diproses' so production can start.
        if ($order->source === 'admin' && in_array($payment->type, ['dp', 'pelunasan'], true)) {
            if ($order->order_status === 'baru') {
                $order->update(['order_status' => 'diproses']);
            }
        }

        return $payment;
    }

    public function rejectPayment(Payment $payment, string $rejectionNotes, User $admin): Payment
    {
        $payment->update([
            'status' => 'rejected',
            'verified_by' => $admin->id,
            'verified_at' => now(),
            'rejection_notes' => $rejectionNotes,
        ]);

        // Reset order to baru status if payment is DP
        if ($payment->type === 'dp' && $payment->order->source === 'pembeli') {
            $payment->order->update(['order_status' => 'baru']);
        }

        return $payment;
    }

    public function verifyPaymentVerification(PaymentVerification $pv, User $admin): PaymentVerification
    {
        $pv->update([
            'status' => 'verified',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);

        // Admin akan klik "Lanjut di Proses" untuk ubah status ke diproses
        // Jangan auto-update status di sini

        return $pv;
    }

    public function rejectPaymentVerification(PaymentVerification $pv, string $rejectionNotes, User $admin): PaymentVerification
    {
        $pv->update([
            'status' => 'rejected',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);

        $rejectionCount = $pv->order->paymentVerifications()
            ->where('payment_type', $pv->payment_type)
            ->where('status', 'rejected')
            ->count();

        if ($rejectionCount >= 2) {
            $pv->order->update(['order_status' => 'dibatalkan']);

            return $pv;
        }

        // Reset order to baru status if payment verification is rejected
        if ($pv->payment_type === 'dp' && $pv->order->source === 'pembeli') {
            $pv->order->update(['order_status' => 'baru']);
        }

        return $pv;
    }

    public function updateStatus(Order $order, string $newStatus): Order
    {
        $currentStatus = $order->order_status;
        $validTransitions = [
            'baru' => ['diproses', 'dibatalkan'],
            'diproses' => ['selesai', 'dibatalkan'],
            'selesai' => [],
            'dibatalkan' => [],
        ];

        if (! isset($validTransitions[$currentStatus])) {
            throw new InvalidArgumentException("Invalid current status: {$currentStatus}");
        }

        if (! in_array($newStatus, $validTransitions[$currentStatus])) {
            throw new InvalidArgumentException("Cannot transition from {$currentStatus} to {$newStatus}");
        }

        $order->update(['order_status' => $newStatus]);

        return $order;
    }

    private function calculateTotals(array $items, int $dpPercentage): array
    {
        $subtotal = 0;
        $isPricePending = false;

        foreach ($items as $item) {
            if (! isset($item['unit_price']) || $item['unit_price'] === null) {
                $isPricePending = true;

                continue;
            }

            $itemTotal = (float) $item['unit_price'] * (float) $item['qty'];
            $subtotal += $itemTotal;
        }

        $dpAmount = ($subtotal * $dpPercentage) / 100;
        $remainingAmount = $subtotal - $dpAmount;

        return [
            'subtotal' => $subtotal,
            'total_amount' => $subtotal,
            'dp_amount' => round($dpAmount, 2),
            'remaining_amount' => round($remainingAmount, 2),
            'is_price_pending' => $isPricePending,
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

            $tier = $tiers->first(static function ($tier) use ($quantity): bool {
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

    private function resolvePaymentMethod(Order $order): string
    {
        if ($order->source === 'admin') {
            return (float) $order->dp_amount > 0 ? 'dp' : 'full';
        }

        $paymentVerificationType = $order->paymentVerifications
            ->pluck('payment_type')
            ->filter()
            ->last();

        if ($paymentVerificationType === 'dp') {
            return 'dp';
        }

        if ($paymentVerificationType === 'pelunasan') {
            return 'full';
        }

        $paymentType = $order->payments
            ->pluck('type')
            ->filter()
            ->last();

        if ($paymentType === 'dp') {
            return 'dp';
        }

        if ($paymentType === 'pelunasan') {
            return 'full';
        }

        return (float) $order->dp_amount > 0 ? 'dp' : 'full';
    }

    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = Order::where('order_number', 'like', "{$date}%")
            ->latest('order_number')
            ->first();

        $sequence = 1;
        if ($lastOrder) {
            $lastSequence = (int) substr($lastOrder->order_number, -4);
            $sequence = $lastSequence + 1;
        }

        return $date.str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function generateUniqueCode(): int
    {
        do {
            $code = rand(100, 999);
        } while (
            Order::where('unique_code', $code)->exists() ||
            Order::where('dp_unique_code', $code)->exists() ||
            Payment::where('unique_code', $code)->exists()
        );

        return $code;
    }
}
