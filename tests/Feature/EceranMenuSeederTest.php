<?php

use App\Models\MenuItem;
use Database\Seeders\EceranMenuSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('seeds the eceran catalog with its prices', function (): void {
    (new EceranMenuSeeder)->run();

    $paketPass = MenuItem::query()->with(['category', 'variants'])->where('name', 'Paket PASS')->firstOrFail();

    expect($paketPass->category_type)->toBe('eceran')
        ->and($paketPass->sub_type)->toBe('paket_pass')
        ->and($paketPass->free_ongkir_km)->toBe(10)
        ->and($paketPass->min_price)->toBe(430000.0);

    expect(MenuItem::query()->where('name', 'Paket NAPASS')->firstOrFail()->min_price)->toBe(55000.0)
        ->and(MenuItem::query()->where('name', 'NASI SAKSANG')->firstOrFail()->min_price)->toBe(30000.0);

    $namargoar = MenuItem::query()->where('name', 'NAMARGOAR')->firstOrFail();

    expect($namargoar->sub_type)->toBe('babi_adat')
        ->and((float) $namargoar->babi_mentah_price)->toBe(975000.0)
        ->and((float) $namargoar->babi_matang_price)->toBe(1075000.0);

    expect((float) MenuItem::query()->where('name', 'SIMBI-SIMBI')->firstOrFail()->babi_matang_price)->toBe(1075000.0);
});

it('can run repeatedly without duplicating menu items', function (): void {
    (new EceranMenuSeeder)->run();
    (new EceranMenuSeeder)->run();

    $paketPass = MenuItem::query()->with('variants')->where('name', 'Paket PASS')->get();

    expect($paketPass)->toHaveCount(1)
        ->and($paketPass->first()->variants)->toHaveCount(1);
});

it('retires the old per-kondisi namargoar items', function (): void {
    MenuItem::create([
        'name' => 'NAMARGOAR (matang)',
        'menu_type' => 'eceran',
        'sub_type' => 'babi_adat',
        'is_available' => true,
    ]);

    (new EceranMenuSeeder)->run();

    expect(MenuItem::query()->where('name', 'NAMARGOAR (matang)')->exists())->toBeFalse()
        ->and(MenuItem::withTrashed()->where('name', 'NAMARGOAR (matang)')->exists())->toBeTrue();
});
