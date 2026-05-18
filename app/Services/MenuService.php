<?php

namespace App\Services;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MenuService
{
    public function getMenusForAdmin(): LengthAwarePaginator
    {
        $query = MenuItem::query()
            ->with('category')
            ->orderBy('sort_order')
            ->orderBy('name');

        $filters = request()->only([
            'category',
            'status',
            'search',
            'per_page',
            'view',
        ]);

        if (filled($filters['search'] ?? null)) {
            $search = trim((string) $filters['search']);
            $query->where('name', 'like', '%'.$search.'%');
        }

        if (filled($filters['category'] ?? null) && ($filters['category'] !== 'all')) {
            $query->whereHas('category', function ($categoryQuery) use ($filters): void {
                $categoryQuery->where('type', $filters['category']);
            });
        }

        if (($filters['status'] ?? null) === 'available') {
            $query->where('is_available', true);
        }

        if (($filters['status'] ?? null) === 'unavailable') {
            $query->where('is_available', false);
        }

        $perPage = (int) ($filters['per_page'] ?? 12);
        if ($perPage < 6) {
            $perPage = 12;
        }
        if ($perPage > 24) {
            $perPage = 24;
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function createCategory(array $data): MenuCategory
    {
        return DB::transaction(function () use ($data): MenuCategory {
            return MenuCategory::create([
                'name' => $data['name'],
                'type' => $data['type'],
                'slug' => $this->generateUniqueSlug($data['name']),
                'description' => $data['description'] ?? null,
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'is_active' => (bool) ($data['is_active'] ?? true),
            ]);
        });
    }

    public function updateCategory(MenuCategory $category, array $data): MenuCategory
    {
        return DB::transaction(function () use ($category, $data): MenuCategory {
            $category->update([
                'name' => $data['name'],
                'type' => $data['type'],
                'slug' => $this->generateUniqueSlug($data['name'], $category),
                'description' => $data['description'] ?? null,
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'is_active' => (bool) ($data['is_active'] ?? true),
            ]);

            return $category->refresh();
        });
    }

    public function createItem(array $data): MenuItem
    {
        return DB::transaction(function () use ($data): MenuItem {
            $category = $this->resolveCategory($data['category']);

            return MenuItem::create([
                'category_id' => $category->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'image' => $this->storeImage($data['image'] ?? null),
                'base_price' => $this->resolveBasePrice($data),
                'unit' => $data['unit'] ?? 'kg',
                'is_available' => (bool) ($data['is_available'] ?? true),
                'stock_quantity' => $this->resolveStockQuantity($data),
                'min_order_hours' => $this->resolveMinOrderHours($category->type, $data),
                'sort_order' => (int) ($data['sort_order'] ?? 0),
            ]);
        });
    }

    public function updateItem(MenuItem $item, array $data): MenuItem
    {
        return DB::transaction(function () use ($item, $data): MenuItem {
            $category = $this->resolveCategory($data['category']);
            $imagePath = $item->image;

            if (($data['remove_image'] ?? false) === true && $imagePath !== null) {
                Storage::disk('public')->delete($imagePath);
                $imagePath = null;
            }

            if (! empty($data['image']) && $data['image'] instanceof UploadedFile) {
                if ($imagePath !== null) {
                    Storage::disk('public')->delete($imagePath);
                }

                $imagePath = $this->storeImage($data['image']);
            }

            $item->update([
                'category_id' => $category->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'image' => $imagePath,
                'base_price' => $this->resolveBasePrice($data),
                'unit' => $data['unit'] ?? 'kg',
                'is_available' => (bool) ($data['is_available'] ?? true),
                'stock_quantity' => $this->resolveStockQuantity($data),
                'min_order_hours' => $this->resolveMinOrderHours($category->type, $data),
                'sort_order' => (int) ($data['sort_order'] ?? 0),
            ]);

            return $item->refresh()->load('category');
        });
    }

    public function toggleAvailability(MenuItem $item): MenuItem
    {
        $item->update([
            'is_available' => ! $item->is_available,
        ]);

        return $item->refresh()->load('category');
    }

    public function deleteItem(MenuItem $item): void
    {
        $item->delete();
    }

    public function updateSortOrder(array $itemIds): void
    {
        DB::transaction(function () use ($itemIds): void {
            foreach (array_values($itemIds) as $index => $itemId) {
                MenuItem::query()
                    ->whereKey($itemId)
                    ->update(['sort_order' => $index]);
            }
        });
    }

    private function storeImage(?UploadedFile $image): ?string
    {
        if ($image === null) {
            return null;
        }

        return $image->store('menus', 'public');
    }

    private function resolveBasePrice(array $data): ?string
    {
        if (($data['price_pending'] ?? false) === true) {
            return null;
        }

        return isset($data['base_price']) && $data['base_price'] !== ''
            ? (string) $data['base_price']
            : null;
    }

    private function resolveStockQuantity(array $data): ?string
    {
        if (($data['track_stock'] ?? false) !== true) {
            return null;
        }

        return isset($data['stock_quantity']) && $data['stock_quantity'] !== ''
            ? (string) $data['stock_quantity']
            : null;
    }

    private function resolveMinOrderHours(string $categoryType, array $data): ?int
    {
        if ($categoryType !== 'eceran') {
            return null;
        }

        if (! isset($data['min_order_hours']) || $data['min_order_hours'] === '') {
            return null;
        }

        return (int) $data['min_order_hours'];
    }

    private function resolveCategory(string $categoryType): MenuCategory
    {
        $category = MenuCategory::query()
            ->where('type', $categoryType)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->first();

        if ($category !== null) {
            return $category;
        }

        $label = match ($categoryType) {
            'timbang_hidup' => 'Timbang Hidup',
            'olahan' => 'Olahan',
            'eceran' => 'Eceran',
            default => $categoryType,
        };

        return MenuCategory::create([
            'name' => $label,
            'type' => $categoryType,
            'slug' => Str::slug($label) ?: $categoryType,
            'description' => null,
            'sort_order' => 0,
            'is_active' => true,
        ]);
    }

    private function generateUniqueSlug(string $name, ?MenuCategory $ignoreCategory = null): string
    {
        $baseSlug = Str::slug($name) ?: 'menu';
        $slug = $baseSlug;
        $suffix = 2;

        while (
            MenuCategory::query()
                ->when($ignoreCategory !== null, function ($query) use ($ignoreCategory): void {
                    $query->whereKeyNot($ignoreCategory->getKey());
                })
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
