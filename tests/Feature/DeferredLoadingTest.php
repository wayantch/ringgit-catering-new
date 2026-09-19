<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Inertia\ResponseFactory;

uses(DatabaseTransactions::class);

/**
 * The heavy pages send their shell first and stream the aggregates in behind a
 * skeleton. These lock in that contract: the props must be absent from the
 * first response, and present when Inertia asks for them.
 */
it('keeps the admin dashboard aggregates out of the first response', function (): void {
    $admin = User::factory()->create([
        'email' => 'deferred-dash-'.Str::lower(Str::random(8)).'@example.com',
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Dashboard')
            ->missing('stats')
            ->missing('weekly_revenue')
            ->missing('order_status_distribution')
            ->missing('completion_rate')
            ->missing('recent_orders')
            ->missing('top_menus')
    );
});

it('returns the dashboard summary group when Inertia requests it', function (): void {
    $admin = User::factory()->create([
        'email' => 'deferred-part-'.Str::lower(Str::random(8)).'@example.com',
        'role' => 'admin',
    ]);

    // A partial reload is rejected with 409 unless it carries the asset
    // version. The middleware publishes it once a request has run.
    $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
    $version = app(ResponseFactory::class)->getVersion();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
        'X-Inertia-Partial-Component' => 'Admin/Dashboard',
        'X-Inertia-Partial-Data' => 'stats,weekly_revenue,order_status_distribution,completion_rate',
    ]);

    // A partial reload answers with the Inertia JSON payload rather than a
    // full page, so assert on that directly.
    $response->assertOk();
    $response->assertJsonPath('component', 'Admin/Dashboard');
    $response->assertJsonStructure([
        'props' => [
            'stats' => ['revenue_today', 'orders_today', 'total_customers'],
            'weekly_revenue',
            'order_status_distribution',
            'completion_rate',
        ],
    ]);

    expect($response->json('props.weekly_revenue'))->toHaveCount(7)
        ->and($response->json('props.order_status_distribution'))
        ->toHaveCount(4)
        ->and($response->json('props'))->not->toHaveKey('recent_orders');
});

it('keeps the production dashboard nav badge eager and its stats deferred', function (): void {
    $produksi = User::factory()->create([
        'email' => 'deferred-prod-'.Str::lower(Str::random(8)).'@example.com',
        'role' => 'produksi',
    ]);

    $response = $this->actingAs($produksi)->get(route('produksi.beranda'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Produksi/Beranda')
            // The badge count must not pop in late, so it stays eager.
            ->has('pesananDiprosesCount')
            ->has('user')
            ->missing('stats')
            ->missing('pesanan_aktif')
    );
});
