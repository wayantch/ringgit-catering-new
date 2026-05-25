<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Support\Facades\Auth;

it('redirects admin users to the admin dashboard via admin login', function (): void {
    $this->withoutMiddleware([
        RedirectIfAuthenticated::class,
        HandleInertiaRequests::class,
    ]);

    $admin = User::factory()->admin()->create();

    Auth::partialMock()
        ->shouldReceive('attempt')
        ->once()
        ->andReturnTrue();
    Auth::partialMock()
        ->shouldReceive('user')
        ->andReturn($admin);

    $response = $this->post('/admin/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
        'role' => 'admin',
    ]);

    $response->assertRedirect(route('admin.dashboard'));
    expect($admin->refresh()->last_login_at)->not->toBeNull();
});

it('redirects produksi users to the production dashboard via admin login', function (): void {
    $this->withoutMiddleware([
        RedirectIfAuthenticated::class,
        HandleInertiaRequests::class,
    ]);

    $produksi = User::factory()->produksi()->create();

    Auth::partialMock()
        ->shouldReceive('attempt')
        ->once()
        ->andReturnTrue();
    Auth::partialMock()
        ->shouldReceive('user')
        ->andReturn($produksi);

    $response = $this->post('/admin/login', [
        'email' => 'produksi@example.com',
        'password' => 'password',
        'role' => 'produksi',
    ]);

    $response->assertRedirect(route('produksi.beranda'));
    expect($produksi->refresh()->last_login_at)->not->toBeNull();
});

it('redirects buyers to the beranda via user login', function (): void {
    $this->withoutMiddleware([
        RedirectIfAuthenticated::class,
        HandleInertiaRequests::class,
    ]);

    $buyer = User::factory()->create([
        'role' => 'user',
    ]);

    Auth::partialMock()
        ->shouldReceive('attempt')
        ->once()
        ->andReturnTrue();
    Auth::partialMock()
        ->shouldReceive('user')
        ->andReturn($buyer);

    $response = $this->post('/user/login', [
        'email' => 'buyer@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect(route('user.beranda'));
    expect($buyer->refresh()->last_login_at)->not->toBeNull();
});

it('blocks guests from protected admin routes', function (): void {
    $this->get('/admin/dashboard')->assertRedirect(route('user.login'));
});

it('redirects authenticated buyers away from the login page to beranda', function (): void {
    $this->withoutMiddleware([
        HandleInertiaRequests::class,
    ]);

    $user = User::make([
        'role' => 'user',
    ]);

    $this->actingAs($user)
        ->get('/login')
        ->assertRedirect(route('user.beranda'));
});

it('redirects users with the wrong role away from protected routes', function (): void {
    $this->withoutMiddleware([
        HandleInertiaRequests::class,
    ]);

    $user = User::make([
        'role' => 'user',
    ]);

    $this->actingAs($user)
        ->get('/admin/dashboard')
        ->assertRedirect(route('user.login'));
});
