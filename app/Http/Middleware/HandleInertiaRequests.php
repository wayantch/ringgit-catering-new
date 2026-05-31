<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $sharedUser = null;

        if ($user) {
            $sharedUser = $user->only([
                'id',
                'name',
                'email',
                'role',
                'phone',
                'address',
            ]);
        }

        $cartCount = $this->cartCountForUser($user);

        $newOrdersCount = $this->newOrdersCountForUser($user);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $sharedUser,
            ],
            'cartCount' => $cartCount,
            'newOrdersCount' => $newOrdersCount,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * Count the authenticated user's cart entries.
     */
    protected function cartCountForUser(?User $user): int
    {
        if (! $user) {
            return 0;
        }

        // Count distinct cart rows (number of menu entries in cart), not total quantity.
        return Cart::where('user_id', $user->id)->count();
    }

    /**
     * Count incoming orders visible to privileged users.
     */
    protected function newOrdersCountForUser(?User $user): int
    {
        if (! $user || ! in_array($user->role, ['admin', 'produksi'], true)) {
            return 0;
        }

        return Order::where('order_status', 'baru')
            ->where('source', 'pembeli')
            ->count();
    }
}
