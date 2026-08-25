<?php

use App\Models\User;
use App\Services\Admin\PelangganService;

it('marks pelanggan as active when they have logged in within the last month', function (): void {
    $admin = User::factory()->admin()->create();

    $baselineActive = User::where('role', 'pembeli')
        ->whereNotNull('last_login_at')
        ->where('last_login_at', '>=', now()->subMonth())
        ->count();

    $baselineInactive = User::where('role', 'pembeli')
        ->where(function ($builder): void {
            $builder->whereNull('last_login_at')
                ->orWhere('last_login_at', '<', now()->subMonth());
        })
        ->count();

    $active = User::factory()->create([
        'role' => 'pembeli',
        'last_login_at' => now()->subDays(5),
    ]);

    $inactive = User::factory()->create([
        'role' => 'pembeli',
        'last_login_at' => now()->subMonths(2),
    ]);

    $neverLogin = User::factory()->create([
        'role' => 'pembeli',
        'last_login_at' => null,
    ]);

    User::whereKey($active->id)->update([
        'created_at' => now()->subMinutes(3),
        'updated_at' => now()->subMinutes(3),
    ]);

    User::whereKey($inactive->id)->update([
        'created_at' => now()->subMinutes(2),
        'updated_at' => now()->subMinutes(2),
    ]);

    User::whereKey($neverLogin->id)->update([
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);

    $response = $this->actingAs($admin)->get(route('admin.pelanggan.index'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Pelanggan/Index')
            ->where('stats.aktif_bulan_ini', $baselineActive + 1)
            ->where('stats.tidak_aktif', $baselineInactive + 2)
    );

    $activePayload = app(PelangganService::class)->getPaginatedPelanggan([
        'search' => $active->email,
    ]);
    $inactivePayload = app(PelangganService::class)->getPaginatedPelanggan([
        'search' => $inactive->email,
    ]);
    $neverLoginPayload = app(PelangganService::class)->getPaginatedPelanggan([
        'search' => $neverLogin->email,
    ]);

    expect($activePayload->items()[0]['status'])->toBe('aktif')
        ->and($inactivePayload->items()[0]['status'])->toBe('tidak_aktif')
        ->and($neverLoginPayload->items()[0]['status'])->toBe('tidak_aktif');
});
