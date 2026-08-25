<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        try {
            $topMenuCounts = DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->where('orders.order_status', '!=', 'dibatalkan')
                ->selectRaw('order_items.menu_item_id, COUNT(DISTINCT order_items.order_id) as order_count')
                ->whereNotNull('order_items.menu_item_id')
                ->groupBy('order_items.menu_item_id')
                ->orderByDesc('order_count')
                ->limit(3)
                ->pluck('order_count', 'menu_item_id');

            $menuIds = $topMenuCounts->keys()->all();

            $menuItems = MenuItem::query()
                ->available()
                ->when(
                    count($menuIds) > 0,
                    static fn ($query) => $query->whereIn('id', $menuIds),
                    static fn ($query) => $query->orderBy('sort_order', 'asc')->orderByDesc('created_at')->limit(3),
                )
                ->with('category')
                ->get()
                ->keyBy('id')
                ->map(function ($item) use ($topMenuCounts): array {
                    $orderCount = (int) ($topMenuCounts[$item->id] ?? 0);
                    $minPrice = $item->min_price !== null ? (float) $item->min_price : null;
                    $resolvedPrice = $item->base_price !== null
                        ? (float) $item->base_price
                        : $minPrice;
                    $priceLabel = $resolvedPrice !== null
                        ? 'Rp '.number_format($resolvedPrice, 0, ',', '.')
                        : 'Harga menyusul';

                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'description' => $item->description,
                        'image' => $item->image,
                        'base_price' => $item->base_price,
                        'min_price' => $minPrice,
                        'price_label' => $priceLabel,
                        'unit' => $item->unit,
                        'menu_type' => $item->menu_type,
                        'sub_type' => $item->sub_type,
                        'category_type' => $item->category_type,
                        'badge' => $orderCount > 0 ? 'Terlaris' : null,
                        'category' => [
                            'name' => $item->category?->name,
                            'type' => $item->category?->type,
                        ],
                    ];
                })
                ->when(
                    count($menuIds) > 0,
                    static fn ($collection) => collect($menuIds)
                        ->map(fn (int $menuId) => $collection->get($menuId))
                        ->filter()
                        ->values(),
                    static fn ($collection) => $collection->values(),
                );
        } catch (QueryException) {
            // If database query fails, return empty array
            $menuItems = [];
        }

        return Inertia::render('LandingPage/Index', [
            'menuItems' => $menuItems,
        ]);
    }
}
