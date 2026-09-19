<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaymentVerification;
use App\Models\User;

/**
 * Shapes order models into the payloads the admin Inertia pages expect.
 */
class PesananPresenter
{
    public function __construct(
        private PesananService $pesananService,
    ) {}

    /**
     * Build the detail payload shared by the admin show and edit pages.
     *
     * @return array<string, mixed>
     */
    public function orderDetail(Order $order): array
    {
        $cashbackSummary = $this->pesananService->getCashbackSummary($order);

        return [
            'id' => $order->hashid,
            'order_number' => $order->order_number,
            'source' => $order->source ?? 'pembeli',
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'order_type' => $order->order_type,
            'booking_date' => $order->booking_date,
            'booking_time' => $order->booking_time,
            'pickup_time' => $order->pickup_time,
            'delivery_time' => $order->delivery_time,
            'delivery_address' => $order->delivery_address,
            'order_status' => $order->order_status,
            'notes' => $order->notes,
            'subtotal' => $order->subtotal,
            'total_amount' => $order->total_amount,
            'unique_code' => $order->unique_code,
            'dp_unique_code' => $order->dp_unique_code,
            'dp_percentage' => $order->dp_percentage,
            'dp_amount' => $order->dp_amount,
            'remaining_amount' => $order->remaining_amount,
            ...$cashbackSummary,
            'is_price_pending' => $order->is_price_pending,
            'editable_until' => $order->editable_until,
            'isEditable' => $order->isEditable(),
            'items' => $this->orderItems($order),
            'payments' => $this->paymentTimeline($order),
            'created_by' => $this->userSnapshot($order->createdBy),
            'user' => $this->userSnapshot($order->user),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function orderItems(Order $order): array
    {
        return $order->items->map(static function (OrderItem $item): array {
            return [
                'id' => $item->hashid,
                'order_id' => $item->order?->hashid,
                'menu_item_id' => $item->menuItem?->hashid,
                'menu_name' => $item->menu_name,
                'menu_image' => $item->menuItem?->image_url ?? $item->menuItem?->image,
                'menu_category_type' => $item->menu_category_type,
                'menu_sub_type' => $item->menuItem?->sub_type,
                'menu_unit' => $item->menu_unit,
                'kondisi_produk' => $item->kondisi_produk,
                'adat_type' => $item->adat_type,
                'qty' => (float) $item->quantity,
                'quantity' => (float) $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
                'notes' => $item->notes,
            ];
        })->values()->all();
    }

    /**
     * Merge the two payment sources the admin screens render as one list:
     * `payments` (kasir flow) and `payment_verifications` (customer uploads).
     *
     * @return array<int, array<string, mixed>>
     */
    private function paymentTimeline(Order $order): array
    {
        $payments = $order->payments->map(static function (Payment $payment): array {
            return [
                'id' => $payment->hashid,
                'order_id' => $payment->order?->hashid,
                'type' => $payment->type,
                'expected_amount' => $payment->expected_amount,
                'unique_code' => $payment->unique_code,
                'payment_proof' => $payment->payment_proof,
                'status' => $payment->status,
                'verified_by' => $payment->verified_by,
                'verified_at' => $payment->verified_at,
                'rejection_notes' => $payment->rejection_notes,
            ];
        })->values()->all();

        $verifications = $order->paymentVerifications
            ->map(static function (PaymentVerification $verification): array {
                return [
                    'id' => $verification->hashid,
                    'type' => $verification->payment_type,
                    'payment_type' => $verification->payment_type,
                    'expected_amount' => $verification->amount,
                    'unique_code' => null,
                    'payment_proof' => $verification->proof_image,
                    'status' => $verification->status,
                    'verified_at' => $verification->verified_at,
                    'rejection_notes' => null,
                    'is_verification' => true,
                ];
            })
            ->values()
            ->all();

        return [...$payments, ...$verifications];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function userSnapshot(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return [...$user->toArray(), 'id' => $user->hashid];
    }
}
