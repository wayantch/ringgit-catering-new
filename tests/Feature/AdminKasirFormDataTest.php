<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use App\Models\User;
use App\Services\Admin\KasirService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

uses(DatabaseTransactions::class);

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('builds the kasir form data with hashids, tiers and variants', function (): void {
    $category = MenuCategory::query()->firstOrCreate(
        ['type' => 'timbang_hidup'],
        [
            'name' => 'Timbang Hidup',
            'slug' => 'timbang-hidup-'.Str::lower(Str::random(8)),
            'description' => null,
            'sort_order' => 1,
            'is_active' => true,
        ],
    );

    $timbangItem = MenuItem::query()->create([
        'category_id' => $category->id,
        'name' => 'Babi Kasir '.Str::lower(Str::random(6)),
        'menu_type' => 'timbang_hidup',
        'unit' => 'kg',
        'base_price' => null,
        'is_available' => true,
        'sort_order' => 1,
    ]);

    MenuItemPriceTier::query()->create([
        'menu_item_id' => $timbangItem->id,
        'kode' => 'A',
        'is_half' => false,
        'berat_min' => 1,
        'berat_max' => 10,
        'harga_mentah' => 95000,
        'harga_matang' => 115000,
        'cashback' => 20000,
        'sort_order' => 1,
    ]);

    $eceranItem = MenuItem::query()->create([
        'category_id' => $category->id,
        'name' => 'Paket Kasir '.Str::lower(Str::random(6)),
        'menu_type' => 'eceran',
        'sub_type' => 'paket_pass',
        'unit' => 'porsi',
        'base_price' => null,
        'is_available' => true,
        'sort_order' => 2,
    ]);

    MenuItemVariant::query()->create([
        'menu_item_id' => $eceranItem->id,
        'label' => 'Porsi',
        'harga' => 30000,
        'sort_order' => 1,
    ]);

    $hiddenItem = MenuItem::query()->create([
        'category_id' => $category->id,
        'name' => 'Menu Nonaktif '.Str::lower(Str::random(6)),
        'menu_type' => 'eceran',
        'sub_type' => 'paket_pass',
        'unit' => 'porsi',
        'base_price' => null,
        'is_available' => false,
        'sort_order' => 3,
    ]);

    $customer = User::factory()->create([
        'email' => 'kasir-form-'.Str::lower(Str::random(8)).'@example.com',
        'role' => 'pembeli',
    ]);

    $formData = app(KasirService::class)->getFormData();

    $menuIds = collect($formData['menuItems'])->pluck('id');

    expect($menuIds)->toContain($timbangItem->hashid)
        ->and($menuIds)->toContain($eceranItem->hashid)
        ->and($menuIds)->not->toContain($hiddenItem->hashid);

    $timbangPayload = collect($formData['menuItems'])
        ->firstWhere('id', $timbangItem->hashid);

    expect($timbangPayload['menu_type'])->toBe('timbang_hidup')
        ->and($timbangPayload['category']['id'])->toBe($category->hashid)
        ->and($timbangPayload['tiers'])->toHaveCount(1)
        ->and($timbangPayload['tiers'][0]['harga_mentah'])->toBe(95000.0)
        ->and($timbangPayload['tiers'][0]['cashback'])->toBe(20000.0);

    $eceranPayload = collect($formData['menuItems'])
        ->firstWhere('id', $eceranItem->hashid);

    expect($eceranPayload['sub_type'])->toBe('paket_pass')
        ->and($eceranPayload['variants'])->toHaveCount(1)
        ->and($eceranPayload['variants'][0]['harga'])->toBe(30000.0);

    expect(collect($formData['customers'])->pluck('id'))
        ->toContain($customer->hashid);
});

it('returns slim menu options for the order edit form', function (): void {
    $category = MenuCategory::query()->firstOrCreate(
        ['type' => 'eceran'],
        [
            'name' => 'Eceran',
            'slug' => 'eceran-'.Str::lower(Str::random(8)),
            'description' => null,
            'sort_order' => 1,
            'is_active' => true,
        ],
    );

    $item = MenuItem::query()->create([
        'category_id' => $category->id,
        'name' => 'Menu Edit '.Str::lower(Str::random(6)),
        'menu_type' => 'eceran',
        'sub_type' => 'paket_pass',
        'unit' => 'porsi',
        'base_price' => 42000,
        'is_available' => true,
        'sort_order' => 1,
    ]);

    $option = collect(app(KasirService::class)->getMenuOptions())
        ->firstWhere('id', $item->hashid);

    expect($option)->not->toBeNull()
        ->and($option['category_type'])->toBe('eceran')
        ->and($option['unit'])->toBe('porsi')
        ->and($option['base_price'])->toBe(42000.0)
        ->and(array_keys($option))
        ->toBe(['id', 'name', 'category_type', 'unit', 'base_price']);
});
