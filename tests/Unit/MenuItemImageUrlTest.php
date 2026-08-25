<?php

use App\Models\MenuItem;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

it('builds a public image url when the file exists', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('menus/example.png', 'image');

    $menuItem = new MenuItem([
        'image' => 'menus/example.png',
    ]);

    expect($menuItem->image_url)->toBe('/storage/menus/example.png');
});

it('returns null for a missing image file', function (): void {
    Storage::fake('public');

    $menuItem = new MenuItem([
        'image' => 'menus/missing.png',
    ]);

    expect($menuItem->image_url)->toBeNull();
});
