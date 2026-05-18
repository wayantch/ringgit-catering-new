<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItemPriceTier extends Model
{
    protected $fillable = [
        'menu_item_id',
        'kode',
        'is_half',
        'berat_min',
        'berat_max',
        'harga_mentah',
        'harga_matang',
        'cashback',
        'sort_order',
    ];

    protected $casts = [
        'is_half' => 'boolean',
        'berat_min' => 'decimal:2',
        'berat_max' => 'decimal:2',
        'harga_mentah' => 'decimal:2',
        'harga_matang' => 'decimal:2',
        'cashback' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function matchesBerat(float $berat): bool
    {
        if ($berat < (float) $this->berat_min) {
            return false;
        }

        if ($this->berat_max !== null && $berat > (float) $this->berat_max) {
            return false;
        }

        return true;
    }
}
