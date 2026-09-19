<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('renders the beranda with only the props the page reads', function (): void {
    $user = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $response = $this->actingAs($user)->get(route('user.beranda'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Pelanggan/Beranda/Index')
            ->has('recentOrders')
            ->has('user')
            // featuredMenus was queried and shipped but never rendered.
            ->missing('featuredMenus')
    );
});

it('shares the cart count with the customer navigation', function (): void {
    $user = User::factory()->create([
        'role' => 'pembeli',
    ]);

    $response = $this->actingAs($user)->get(route('user.beranda'));

    // Both TopNavbar and BottomNavbar read this shared prop for their badge.
    $response->assertInertia(fn ($page) => $page->where('cartCount', 0));
});
