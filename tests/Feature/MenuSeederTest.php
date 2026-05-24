<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use Database\Seeders\MenuSeeder;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('seeds the simplified timbang hidup and eceran menu catalog', function (): void {
    (new MenuSeeder)->run();

    expect(MenuCategory::query()->where('type', 'timbang_hidup')->exists())->toBeTrue();
    expect(MenuCategory::query()->where('type', 'eceran')->exists())->toBeTrue();

    $timbangHidup = MenuItem::query()
        ->with(['tiers'])
        ->where('name', 'Timbang Hidup')
        ->where('menu_type', 'timbang_hidup')
        ->firstOrFail();

    expect($timbangHidup->category_id)->not->toBeNull();
    expect($timbangHidup->tiers)->toHaveCount(3);

    expect(MenuItem::query()->where('name', 'Paket Pass')->where('sub_type', 'paket_pass')->exists())->toBeTrue();
    expect(MenuItem::query()->where('name', 'Paket Napass')->where('sub_type', 'paket_nasi_box')->exists())->toBeTrue();
    expect(MenuItem::query()->where('name', 'Babi Adat')->where('sub_type', 'babi_adat')->exists())->toBeTrue();

    $babiAdat = MenuItem::query()
        ->with(['variants'])
        ->where('name', 'Babi Adat')
        ->firstOrFail();

    expect($babiAdat->variants)->toHaveCount(1);
    expect($babiAdat->babi_mentah_price)->not->toBeNull();
    expect($babiAdat->babi_matang_price)->not->toBeNull();

    expect(
        MenuItemPriceTier::query()
            ->whereHas('menuItem', function ($query): void {
                $query->where('name', 'Timbang Hidup');
            })
            ->count()
    )->toBe(3);
});
