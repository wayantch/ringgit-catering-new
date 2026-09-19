<?php

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

/**
 * The "Beli Sekarang" button in AddToCartSheet stores the row through the
 * normal cart endpoint and then walks straight on to checkout, skipping the
 * keranjang page. These cover that two-step sequence at the HTTP level.
 */
it('reaches checkout straight after storing a single item', function (): void {
    $user = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $menuItem = MenuItem::query()
        ->where('menu_type', 'timbang_hidup')
        ->with('category')
        ->firstOrFail();

    $this->actingAs($user)
        ->post(route('user.keranjang.store'), [
            'menu_item_id' => $menuItem->hashid,
            'kondisi_produk' => 'mentah',
            'quantity' => 6,
        ])
        ->assertRedirect();

    expect(Cart::query()->where('user_id', $user->id)->count())->toBe(1);

    $response = $this->actingAs($user)->get(route('user.checkout'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Pelanggan/Checkout')
            ->has('cartItems', 1)
            ->has('summary.subtotal')
            ->has('summary.dp_total')
    );
});

it('sends an empty cart back to the keranjang page instead of checkout', function (): void {
    $user = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $response = $this->actingAs($user)->get(route('user.checkout'));

    $response->assertRedirect(route('user.keranjang.index'));
    $response->assertSessionHas('error', 'Keranjang kosong');
});

it('checks out the whole cart, not only the item just added', function (): void {
    $user = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $menuItem = MenuItem::query()
        ->where('menu_type', 'timbang_hidup')
        ->with('category')
        ->firstOrFail();

    // Kondisi is part of the cart row's identity, so mentah and mateng land as
    // two separate rows for the same menu item.
    foreach (['mentah', 'mateng'] as $index => $kondisi) {
        $this->actingAs($user)
            ->post(route('user.keranjang.store'), [
                'menu_item_id' => $menuItem->hashid,
                'kondisi_produk' => $kondisi,
                'quantity' => 6 + $index,
            ])
            ->assertRedirect();
    }

    expect(Cart::query()->where('user_id', $user->id)->count())->toBe(2);

    $response = $this->actingAs($user)->get(route('user.checkout'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Pelanggan/Checkout')
            ->has('cartItems', 2)
    );
});
