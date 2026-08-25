<?php

namespace App\Http\Controllers\Pelanggan;

use App\Services\LoyaltyService;
use App\Services\Pelanggan\KeranjangService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController
{
    public function __invoke(
        Request $request,
        KeranjangService $service,
        LoyaltyService $loyaltyService,
    ): Response|RedirectResponse {
        $user = $request->user();
        $cartItems = $service->getCartItems($user);
        $summary = $service->getCartSummary($user);

        if ($cartItems->isEmpty()) {
            return redirect()->route('user.keranjang.index')->with('error', 'Keranjang kosong');
        }

        return Inertia::render('Pelanggan/Checkout', [
            'cartItems' => $cartItems,
            'summary' => $summary,
            'user' => $user,
            'loyalty' => $loyaltyService->getUserLoyaltyInfo($user, (float) $summary['subtotal']),
        ]);
    }
}
