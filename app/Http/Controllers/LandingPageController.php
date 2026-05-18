<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Database\QueryException;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        try {
            // Fetch top 3 featured menu items sorted by sort_order (priority) or latest created
            $menuItems = MenuItem::available()
                ->orderBy('sort_order', 'asc')
                ->orderByDesc('created_at')
                ->limit(3)
                ->with('category')
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'image' => $item->image,
                    'base_price' => $item->base_price,
                    'unit' => $item->unit,
                    'category_type' => $item->category_type,
                    'category' => [
                        'name' => $item->category?->name,
                        'type' => $item->category?->type,
                    ],
                ]);
        } catch (QueryException) {
            // If database query fails, return empty array
            $menuItems = [];
        }

        return Inertia::render('LandingPage/Index', [
            'menuItems' => $menuItems,
        ]);
    }
}
