<?php

use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use App\Services\Admin\MenuService;
use Tests\TestCase;

uses(TestCase::class);

it('calculates minimum price from timbang hidup tiers', function (): void {
    $item = MenuItem::make([
        'menu_type' => 'timbang_hidup',
    ]);

    $item->setRelation('tiers', collect([
        MenuItemPriceTier::make(['harga_mentah' => 100000]),
        MenuItemPriceTier::make(['harga_mentah' => 95000]),
        MenuItemPriceTier::make(['harga_mentah' => 120000]),
    ]));

    expect($item->min_price)->toBe(95000.0)
        ->and($item->is_price_pending)->toBeFalse();
});

it('calculates minimum price from eceran variants', function (): void {
    $item = MenuItem::make([
        'menu_type' => 'eceran',
    ]);

    $item->setRelation('variants', collect([
        MenuItemVariant::make(['harga' => 250000]),
        MenuItemVariant::make(['harga' => 190000]),
    ]));

    expect($item->min_price)->toBe(190000.0)
        ->and($item->is_price_pending)->toBeFalse();
});

it('matches weight and resolves pricing from the matching tier', function (): void {
    $service = new MenuService;
    $item = MenuItem::make([
        'menu_type' => 'timbang_hidup',
    ]);

    $tier = MenuItemPriceTier::make([
        'kode' => 'B',
        'is_half' => false,
        'berat_min' => 25,
        'berat_max' => 49,
        'harga_mentah' => 88000,
        'harga_matang' => 108000,
        'cashback' => 75000,
    ]);

    $item->setRelation('tiers', collect([$tier]));

    expect($tier->matchesBerat(30))->toBeTrue()
        ->and($tier->matchesBerat(10))->toBeFalse()
        ->and($service->resolveHarga($item, 30, 'matang'))->toMatchArray([
            'kode' => 'B',
            'is_half' => false,
            'harga_kg' => 108000.0,
            'cashback' => 75000.0,
        ]);
});
