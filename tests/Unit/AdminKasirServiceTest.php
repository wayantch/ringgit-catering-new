<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Services\Admin\KasirService;
use Tests\TestCase;

uses(TestCase::class);

it('allows mentah and mateng for eceran babi adat orders', function (): void {
    $service = new KasirService;

    $menuItem = MenuItem::make([
        'menu_type' => 'eceran',
        'sub_type' => 'babi_adat',
    ]);
    $menuItem->setRelation('category', MenuCategory::make(['type' => 'eceran']));

    $reflection = new ReflectionClass($service);
    $method = $reflection->getMethod('resolveAllowedKondisi');
    $method->setAccessible(true);

    /** @var array<int, string> $allowedKondisi */
    $allowedKondisi = $method->invoke($service, $menuItem);

    expect($allowedKondisi)
        ->toContain('satuan')
        ->toContain('adat')
        ->toContain('mentah')
        ->toContain('mateng');
});
