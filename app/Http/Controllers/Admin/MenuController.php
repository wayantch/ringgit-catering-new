<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMenuItemRequest;
use App\Http\Requests\Admin\UpdateMenuItemRequest;
use App\Models\MenuItem;
use App\Services\Admin\MenuService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function __construct(private readonly MenuService $menuService) {}

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'is_available' => $request->string('is_available')->toString(),
        ];

        return Inertia::render('Admin/Menu/Index', [
            'items' => $this->menuService->getPaginatedMenus($filters),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Menu/Create', []);
    }

    public function store(StoreMenuItemRequest $request): RedirectResponse
    {
        $this->menuService->createItem($request->validated());

        return redirect()
            ->route('admin.menu.index')
            ->with('success', 'Menu berhasil ditambahkan.');
    }

    public function edit(MenuItem $menu): Response
    {
        return Inertia::render('Admin/Menu/Edit', [
            'menu' => $menu->load(['tiers', 'variants']),
        ]);
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $menu): RedirectResponse
    {
        $this->menuService->updateItem($menu, $request->validated());

        return redirect()
            ->route('admin.menu.index')
            ->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(MenuItem $menu): RedirectResponse
    {
        $this->menuService->deleteItem($menu);

        return back()->with('success', 'Menu berhasil dihapus.');
    }

    public function toggle(MenuItem $menu): RedirectResponse
    {
        $this->menuService->toggleAvailability($menu);

        return back();
    }
}
