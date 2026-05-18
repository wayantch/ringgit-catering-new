<?php

use App\Models\User;
use App\Http\Requests\Pelanggan\StoreCartItemRequest;

test('exposes hashid route key behavior on models', function (): void {
    $user = User::make();
    $user->setRawAttributes(['id' => 123], true);

    expect($user->getRouteKeyName())->toBe('hashid');
    expect($user->getRouteKey())->toBe($user->hashid);
    expect(User::decodeHashid($user->hashid))->toBe(123);
    expect($user->hashid)->not->toBe((string) $user->id);
});

test('returns an empty hashid for unsaved models', function (): void {
    $user = User::make();

    expect($user->hashid)->toBe('');
});

test('cart item request rules can resolve hashid input without a builder error', function (): void {
    $request = StoreCartItemRequest::create('/user/keranjang', 'POST', [
        'menu_item_id' => 'invalid-hashid',
        'kondisi_produk' => 'mateng',
        'quantity' => 1,
    ]);

    $rules = $request->rules();

    expect($rules)->toHaveKeys([
        'menu_item_id',
        'kondisi_produk',
        'quantity',
        'notes',
    ]);
});
