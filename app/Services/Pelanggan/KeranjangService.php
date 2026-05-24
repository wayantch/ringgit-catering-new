<?php

namespace App\Services\Pelanggan;

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class KeranjangService
{
    /**
     * Add item to cart
     */
    public function addItem(User $user, MenuItem $menuItem, array $details): Cart
    {
        $cart = Cart::updateOrCreate(
            [
                'user_id' => $user->id,
                'menu_item_id' => $menuItem->id,
                'kondisi_produk' => $details['kondisi_produk'],
                'adat_type' => $details['adat_type'] ?? null,
                'portion' => $details['portion'] ?? null,
            ],
            [
                'quantity' => (float) $details['quantity'],
                'notes' => $details['notes'] ?? null,
                'portion' => $details['portion'] ?? null,
            ]
        );

        return $cart;
    }

    /**
     * Get cart items with menu details
     */
    public function getCartItems(User $user): Collection
    {
        return Cart::where('user_id', $user->id)
            ->with(['menuItem.category', 'menuItem.tiers', 'menuItem.variants'])
            ->get()
            ->filter(fn (Cart $item): bool => $item->menuItem !== null)
            ->values();
    }

    /**
     * Get cart summary for user
     */
    public function getCartSummary(User $user): array
    {
        $cartItems = $this->getCartItems($user);

        $subtotal = 0;
        foreach ($cartItems as $item) {
            $itemSubtotal = $this->resolveItemSubtotal($item);

            if ($itemSubtotal !== null) {
                $subtotal += $itemSubtotal;
            }
        }

        // Generate unique code (last 3 digits of order number style)
        $uniqueCode = rand(100, 999);
        $dpAmount = round($subtotal * 0.25);
        $dpWithCode = $dpAmount + $uniqueCode;

        return [
            'subtotal' => $subtotal,
            'unique_code' => $uniqueCode,
            'total' => $subtotal + $uniqueCode,
            'dp_amount' => $dpAmount,
            'dp_unique_code' => $uniqueCode,
            'dp_total' => $dpWithCode,
            'remaining_amount' => $subtotal - $dpAmount,
        ];
    }

    /**
     * Update cart item details
     *
     * @param  array{quantity:float|int, adat_type?:string|null, notes?:string|null}  $data
     */
    public function updateItem(Cart $cart, array $data): Cart
    {
        $newAdat = $data['adat_type'] ?? $cart->adat_type;
        $newPortion = $data['portion'] ?? $cart->portion;
        $newQuantity = $data['quantity'];
        $newNotes = array_key_exists('notes', $data) ? $data['notes'] : $cart->notes;

        // If changing adat_type (or even keeping it) would collide with an existing cart
        // item (same user, menu_item, kondisi_produk, adat_type), merge quantities instead
        return DB::transaction(function () use ($cart, $newAdat, $newPortion, $newQuantity, $newNotes) {
            $existing = Cart::where('user_id', $cart->user_id)
                ->where('menu_item_id', $cart->menu_item_id)
                ->where('kondisi_produk', $cart->kondisi_produk)
                ->where('adat_type', $newAdat)
                ->where('portion', $newPortion)
                ->where('id', '!=', $cart->id)
                ->first();

            if ($existing) {
                // Merge quantities
                $existing->quantity = (float) ($existing->quantity ?? 0) + (float) ($newQuantity ?? 0);
                // Prefer existing notes; if new notes provided and existing empty, use them
                if (empty($existing->notes) && ! empty($newNotes)) {
                    $existing->notes = $newNotes;
                }
                $existing->save();

                // Remove the original cart row that was edited
                $cart->delete();

                return $existing;
            }

            // No collision, perform normal update
            $cart->update([
                'quantity' => $newQuantity,
                'adat_type' => $newAdat,
                'portion' => $newPortion,
                'notes' => $newNotes,
            ]);

            return $cart;
        });
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Cart $cart): bool
    {
        return $cart->delete();
    }

    /**
     * Clear cart for user
     */
    public function clearCart(User $user): int
    {
        return Cart::where('user_id', $user->id)->delete();
    }

    private function resolveItemSubtotal(Cart $item): ?float
    {
        $menuItem = $item->menuItem;

        if (! $menuItem) {
            return null;
        }

        $quantity = (float) $item->quantity;

        if ($menuItem->menu_type === 'timbang_hidup') {
            $tiers = $menuItem->relationLoaded('tiers')
                ? $menuItem->tiers
                : $menuItem->tiers()->orderBy('sort_order')->get();

            $tier = $tiers->first(static function (MenuItemPriceTier $tier) use ($quantity): bool {
                return $tier->matchesBerat($quantity);
            });

            if (! $tier) {
                return null;
            }

            $unitPrice = $item->kondisi_produk === 'mateng'
                ? (float) $tier->harga_matang
                : (float) $tier->harga_mentah;

            return $unitPrice * $quantity;
        }

        $unitPrice = $menuItem->min_price;

        if ($unitPrice === null) {
            return null;
        }

        return (float) $unitPrice * $quantity;
    }
}
