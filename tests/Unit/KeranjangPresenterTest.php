<?php

use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\MenuItemPriceTier;
use App\Models\MenuItemVariant;
use App\Services\Pelanggan\KeranjangPresenter;
use Tests\TestCase;

uses(TestCase::class);

function makeCartRow(MenuItem $menuItem, array $attributes): Cart
{
    $cart = Cart::make();
    $cart->setRawAttributes([
        'id' => 901,
        'user_id' => 7,
        'menu_item_id' => $menuItem->getKey(),
        'kondisi_produk' => 'mentah',
        'adat_type' => null,
        'portion' => null,
        'quantity' => 1,
        'notes' => null,
        ...$attributes,
    ], true);
    $cart->setRelation('menuItem', $menuItem);

    return $cart;
}

function makeTimbangHidupItem(): MenuItem
{
    $tier = MenuItemPriceTier::make();
    $tier->setRawAttributes([
        'id' => 11,
        'menu_item_id' => 3001,
        'kode' => 'B',
        'is_half' => false,
        'berat_min' => 5,
        'berat_max' => 10,
        'harga_mentah' => 90000,
        'harga_matang' => 110000,
        'cashback' => 15000,
        'sort_order' => 1,
    ], true);

    $menuItem = MenuItem::make();
    $menuItem->setRawAttributes([
        'id' => 3001,
        'name' => 'Babi Timbang Hidup',
        'menu_type' => 'timbang_hidup',
        'unit' => 'kg',
    ], true);
    $menuItem->setRelation('tiers', collect([$tier]));
    $menuItem->setRelation('variants', collect());
    $menuItem->setRelation('category', null);

    return $menuItem;
}

it('prices timbang hidup rows from the tier matching the weight', function (): void {
    $cart = makeCartRow(makeTimbangHidupItem(), [
        'kondisi_produk' => 'mentah',
        'quantity' => 6,
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['menu_type'])->toBe('timbang_hidup')
        ->and($mapped['tier']['kode'])->toBe('B')
        ->and($mapped['harga_per_kg'])->toBe(90000.0)
        ->and($mapped['subtotal'])->toBe(540000.0)
        ->and($mapped['berat'])->toBe(6.0)
        ->and($mapped)->not->toHaveKey('qty');
});

it('uses the matang tier price when the row is ordered mateng', function (): void {
    $cart = makeCartRow(makeTimbangHidupItem(), [
        'kondisi_produk' => 'mateng',
        'quantity' => 5,
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['harga_per_kg'])->toBe(110000.0)
        ->and($mapped['subtotal'])->toBe(550000.0);
});

it('leaves the price unresolved when no tier covers the weight', function (): void {
    $cart = makeCartRow(makeTimbangHidupItem(), [
        'quantity' => 30,
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['tier'])->toBeNull()
        ->and($mapped['harga_per_kg'])->toBeNull()
        ->and($mapped['subtotal'])->toBeNull();
});

it('prices an eceran row from its only variant', function (): void {
    $variant = MenuItemVariant::make();
    $variant->setRawAttributes([
        'id' => 21,
        'menu_item_id' => 3002,
        'label' => 'Porsi',
        'harga' => 35000,
        'sort_order' => 1,
    ], true);

    $menuItem = MenuItem::make();
    $menuItem->setRawAttributes([
        'id' => 3002,
        'name' => 'Paket PASS',
        'menu_type' => 'eceran',
        'sub_type' => 'paket_pass',
        'unit' => 'porsi',
    ], true);
    $menuItem->setRelation('tiers', collect());
    $menuItem->setRelation('variants', collect([$variant]));
    $menuItem->setRelation('category', null);

    $cart = makeCartRow($menuItem, [
        'kondisi_produk' => 'satuan',
        'quantity' => 4,
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['menu_type'])->toBe('eceran')
        ->and($mapped['tier'])->toBeNull()
        ->and($mapped['harga_per_kg'])->toBe(35000.0)
        ->and($mapped['subtotal'])->toBe(140000.0)
        ->and($mapped['qty'])->toBe(4.0)
        ->and($mapped)->not->toHaveKey('berat');
});

it('splits the stored note lines into adat parts, adat notes and user notes', function (): void {
    $cart = makeCartRow(makeTimbangHidupItem(), [
        'adat_type' => 'batak',
        'quantity' => 6,
        'notes' => "Batak detail: Kepala, Soit, Jeroan\nSisa daging: dibungkus terpisah\nCatatan: tolong dipotong kecil",
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['adat_group'])->toBe('batak')
        ->and($mapped['adat_parts'])->toBe(['batak_kepala', 'batak_soit', 'batak_jeroan'])
        ->and($mapped['adat_notes'])->toBe('dibungkus terpisah')
        ->and($mapped['notes'])->toBe('tolong dipotong kecil');
});

it('maps nias note labels to their adat codes', function (): void {
    $cart = makeCartRow(makeTimbangHidupItem(), [
        'adat_type' => 'nias',
        'quantity' => 6,
        'notes' => 'Nias detail: Simbi-Simbi, Nias Kota',
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['adat_parts'])->toBe(['nias_simbi_simbi', 'nias_kota'])
        ->and($mapped['adat_notes'])->toBeNull()
        ->and($mapped['notes'])->toBeNull();
});

it('reports no adat group for an unrecognised adat type', function (): void {
    $cart = makeCartRow(makeTimbangHidupItem(), [
        'adat_type' => 'batak_kepala',
        'quantity' => 6,
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItem($cart);

    expect($mapped['adat_group'])->toBeNull()
        ->and($mapped['adat_parts'])->toBe([]);
});

it('maps a whole cart collection in order', function (): void {
    $rows = collect([
        makeCartRow(makeTimbangHidupItem(), ['id' => 901, 'quantity' => 6]),
        makeCartRow(makeTimbangHidupItem(), ['id' => 902, 'quantity' => 7]),
    ]);

    $mapped = app(KeranjangPresenter::class)->cartItems($rows);

    expect($mapped)->toHaveCount(2)
        ->and($mapped[0]['berat'])->toBe(6.0)
        ->and($mapped[1]['berat'])->toBe(7.0);
});
