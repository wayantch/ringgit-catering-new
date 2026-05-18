<?php

use App\Models\User;
use App\Services\Pelanggan\MenuService;

it('renders the pelanggan menu page with the new section payloads', function (): void {
    $user = User::factory()->make([
        'role' => 'user',
    ]);

    $this->instance(MenuService::class, Mockery::mock(MenuService::class, function ($mock): void {
        $mock->shouldReceive('getTimbangHidupMenus')->once()->andReturn([
            [
                'id' => 'menu-timbang-1',
                'name' => 'Daging Timbang Premium',
                'description' => 'Pilihan utama untuk menu timbang hidup',
                'image' => null,
                'menu_type' => 'timbang_hidup',
                'sub_type' => null,
                'is_bundle' => false,
                'bundle_desc' => null,
                'is_available' => true,
                'min_price' => 120000,
                'category' => [
                    'id' => 'cat-1',
                    'name' => 'Timbang Hidup',
                    'type' => 'timbang_hidup',
                ],
                'tiers' => [
                    [
                        'id' => 'tier-1',
                        'kode' => 'Tier 1',
                        'is_half' => false,
                        'berat_min' => 0.5,
                        'berat_max' => 1.0,
                        'harga_mentah' => 120000,
                        'harga_matang' => 140000,
                        'cashback' => 0,
                    ],
                    [
                        'id' => 'tier-2',
                        'kode' => 'Tier 2',
                        'is_half' => false,
                        'berat_min' => 1.5,
                        'berat_max' => null,
                        'harga_mentah' => 180000,
                        'harga_matang' => 200000,
                        'cashback' => 0,
                    ],
                ],
                'variants' => [],
            ],
        ]);

        $mock->shouldReceive('getEceranMenus')->once()->andReturn([
            'saksang' => [
                [
                    'id' => 'menu-saksang-1',
                    'name' => 'Saksang Spesial',
                    'description' => 'Menu saksang andalan',
                    'image' => null,
                    'menu_type' => 'eceran',
                    'sub_type' => 'saksang',
                    'is_bundle' => true,
                    'bundle_desc' => 'Paket keluarga',
                    'is_available' => true,
                    'min_price' => 50000,
                    'category' => [
                        'id' => 'cat-2',
                        'name' => 'Eceran',
                        'type' => 'eceran',
                    ],
                    'tiers' => [],
                    'variants' => [
                        [
                            'id' => 'variant-1',
                            'label' => 'Porsi Kecil',
                            'harga' => 50000,
                        ],
                        [
                            'id' => 'variant-2',
                            'label' => 'Porsi Besar',
                            'harga' => 90000,
                        ],
                    ],
                ],
            ],
            'panggang' => [],
            'sop_tulang' => [],
            'paket_pass' => [],
        ]);
    }));

    $this->withoutMiddleware(\App\Http\Middleware\HandleInertiaRequests::class);

    $response = $this->actingAs($user)->get(route('user.menu'));

    $response->assertOk();
    $response->assertInertia(
        fn($page) => $page
            ->component('Pelanggan/Menu/Index')
            ->has('timbang_hidup', 1)
            ->has('timbang_hidup.0.tiers', 2)
            ->where('timbang_hidup.0.name', 'Daging Timbang Premium')
            ->where('timbang_hidup.0.min_price', 120000)
            ->has('eceran.saksang', 1)
            ->has('eceran.saksang.0.variants', 2)
            ->where('eceran.saksang.0.name', 'Saksang Spesial')
            ->where('eceran.saksang.0.bundle_desc', 'Paket keluarga')
    );
});
