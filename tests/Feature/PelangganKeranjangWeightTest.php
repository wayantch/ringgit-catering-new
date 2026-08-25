<?php

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('stores timbang hidup cart quantities as decimals', function (): void {
    $user = User::factory()->create([
        'role' => 'user',
    ]);

    $menuItem = MenuItem::query()
        ->where('menu_type', 'timbang_hidup')
        ->with('category')
        ->firstOrFail();

    // Timbang hidup is sold as mentah/mateng — see KondisiProduk::TIMBANG_HIDUP
    // and the options AddToCartSheet offers for this menu type.
    $response = $this->actingAs($user)->post(route('user.keranjang.store'), [
        'menu_item_id' => $menuItem->hashid,
        'kondisi_produk' => 'mentah',
        'quantity' => 0.5,
        'notes' => 'Detail tambahan',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Item ditambahkan ke keranjang');

    $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $cart->quantity)->toBe(0.5);
    expect($cart->notes)->toContain('Detail tambahan');
});

it('accepts mentah condition for timbang hidup cart items', function (): void {
    $user = User::factory()->create([
        'role' => 'user',
    ]);

    $menuItem = MenuItem::query()
        ->where('menu_type', 'timbang_hidup')
        ->with('category')
        ->firstOrFail();

    $response = $this->actingAs($user)->post(route('user.keranjang.store'), [
        'menu_item_id' => $menuItem->hashid,
        'kondisi_produk' => 'mentah',
        'quantity' => 0.5,
        'notes' => 'Mentah test',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Item ditambahkan ke keranjang');

    $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();

    expect($cart->kondisi_produk)->toBe('mentah');
    expect((float) $cart->quantity)->toBe(0.5);
});

it('still renders the keranjang page when a cart menu item has been soft deleted', function (): void {
    $user = User::factory()->create([
        'role' => 'user',
    ]);

    $menuItem = MenuItem::query()
        ->where('menu_type', 'timbang_hidup')
        ->with('category')
        ->firstOrFail();

    Cart::query()->create([
        'user_id' => $user->id,
        'menu_item_id' => $menuItem->id,
        'kondisi_produk' => 'adat',
        'adat_type' => 'batak',
        'quantity' => 0.5,
        'notes' => 'Soft deleted item regression',
    ]);

    $menuItem->delete();

    $this->actingAs($user)
        ->get(route('user.keranjang.index'))
        ->assertSuccessful();
});
