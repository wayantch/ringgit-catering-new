<?php

use App\Models\Cart;

test('cart hashid decodes to the primary key', function (): void {
    $cart = Cart::make();
    $cart->setRawAttributes(['id' => 42], true);

    expect(Cart::decodeHashid($cart->hashid))->toBe(42);
});

test('cart resolve route binding query decodes hashid instead of matching a hashid column', function (): void {
    $cart = Cart::make();
    $cart->setRawAttributes(['id' => 42], true);

    $sql = $cart->resolveRouteBindingQuery(Cart::query(), $cart->hashid)
        ->toSql();

    expect($sql)->toContain('"id" = ?')
        ->and($sql)->not->toContain('hashid');
});
