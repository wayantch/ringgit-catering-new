<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Requests\Pelanggan\StoreCartItemRequest;
use App\Models\User;
use Illuminate\Http\Request;

test('exposes hashid route key behavior on models', function (): void {
    $user = User::make();
    $user->setRawAttributes(['id' => 123], true);

    expect($user->getRouteKeyName())->toBe('id');
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

test('inertia shared auth user omits hashid serialization', function (): void {
    $user = User::make();
    $user->setRawAttributes([
        'id' => 77,
        'name' => 'Admin Ringgit',
        'email' => 'admin@example.com',
        'role' => 'admin',
        'phone' => '08123456789',
        'address' => 'Denpasar',
    ], true);

    $request = Request::create('/admin/dashboard', 'GET');
    $request->setUserResolver(fn() => $user);
    $request->setLaravelSession(app('session.store'));

    $shared = new class extends HandleInertiaRequests
    {
        protected function cartCountForUser(?User $user): int
        {
            return 0;
        }

        protected function newOrdersCountForUser(?User $user): int
        {
            return 0;
        }
    };

    $shared = $shared->share($request);

    expect($shared['auth']['user'])->toBe([
        'id' => 77,
        'name' => 'Admin Ringgit',
        'email' => 'admin@example.com',
        'role' => 'admin',
        'phone' => '08123456789',
        'address' => 'Denpasar',
    ]);
});
