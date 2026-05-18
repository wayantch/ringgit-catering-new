<?php

namespace App\Models;

use App\Traits\HasHashid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class MenuItem extends Model
{
    use SoftDeletes;
    use HasHashid;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'image',
        'menu_type',
        'sub_type',
        'is_bundle',
        'bundle_desc',
        'free_ongkir_km',
        'ongkir_subsidi',
        'is_available',
        'sort_order',
    ];

    protected $casts = [
        'is_bundle' => 'boolean',
        'is_available' => 'boolean',
        'ongkir_subsidi' => 'array',
        'free_ongkir_km' => 'integer',
    ];

    protected $appends = [
        'category_type',
        'min_price',
        'is_price_pending',
        'image_url',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class);
    }

    public function tiers(): HasMany
    {
        return $this->hasMany(MenuItemPriceTier::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(MenuItemVariant::class);
    }

    public function getCategoryTypeAttribute(): ?string
    {
        return $this->category?->type;
    }

    public function getMinPriceAttribute(): ?float
    {
        if ($this->menu_type === 'timbang_hidup') {
            $prices = $this->relationLoaded('tiers')
                ? $this->getRelation('tiers')
                : $this->tiers()->get();

            if ($prices instanceof Collection) {
                $price = $prices->min('harga_mentah');

                return $price !== null ? (float) $price : null;
            }

            return null;
        }

        if ($this->menu_type === 'eceran') {
            $prices = $this->relationLoaded('variants')
                ? $this->getRelation('variants')
                : $this->variants()->get();

            if ($prices instanceof Collection) {
                $price = $prices->min('harga');

                return $price !== null ? (float) $price : null;
            }

            return null;
        }

        return null;
    }

    public function getIsPricePendingAttribute(): bool
    {
        return $this->min_price === null;
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image === null || $this->image === '') {
            return null;
        }

        if (! Storage::disk('public')->exists($this->image)) {
            return null;
        }

        return Storage::url($this->image);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot('kondisi_produk', 'adat_type', 'quantity', 'unit_price', 'subtotal')
            ->withTimestamps();
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }

    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }
}
