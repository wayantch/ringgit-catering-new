<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StoreCartItemRequest;
use App\Http\Requests\Pelanggan\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\MenuItem;
use App\Services\Pelanggan\KeranjangPresenter;
use App\Services\Pelanggan\KeranjangService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeranjangController extends Controller
{
    public function __construct(
        private KeranjangService $service,
        private KeranjangPresenter $presenter,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Pelanggan/Keranjang', [
            'cartItems' => $this->presenter->cartItems($this->service->getCartItems($user)),
            'summary' => $this->service->getCartSummary($user),
        ]);
    }

    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->service->addItem(
            $request->user(),
            MenuItem::findByHashid($validated['menu_item_id']),
            $validated,
        );

        return back()->with('success', 'Item ditambahkan ke keranjang');
    }

    public function update(UpdateCartItemRequest $request, string $cart): RedirectResponse
    {
        $cartModel = Cart::findByHashid($cart);

        $this->authorize('update', $cartModel);

        $this->service->updateItem($cartModel, $request->validated());

        return back()->with('success', 'Keranjang diperbarui');
    }

    public function destroy(string $cart): RedirectResponse
    {
        $cartModel = Cart::findByHashid($cart);

        $this->authorize('delete', $cartModel);

        $this->service->removeItem($cartModel);

        return back()->with('success', 'Item dihapus dari keranjang');
    }
}
