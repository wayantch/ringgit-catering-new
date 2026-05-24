<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\User;
use App\Services\Auth\OtpService;
use App\Services\LoyaltyService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PelangganService
{
    public function __construct(
        private OtpService $otpService,
        private LoyaltyService $loyaltyService,
    ) {}

    /**
     * Get paginated pelanggan dengan filter.
     */
    public function getPaginatedPelanggan(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $activeConfig = $this->loyaltyService->getActiveConfig();

        $query = User::where('role', 'pembeli');

        // Search by name or email
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if (! empty($filters['status']) && $filters['status'] !== 'semua') {
            if ($filters['status'] === 'aktif') {
                $query->whereNotNull('email_verified_at');
            } elseif ($filters['status'] === 'belum_login') {
                $query->whereNull('email_verified_at');
            }
        }

        return $query
            ->withCount([
                'orders as total_orders',
            ])
            ->withCount([
                'orders as orders_count' => static function ($builder): void {
                    $builder->where('order_status', 'selesai');
                },
            ])
            ->withSum([
                'orders as orders_sum_total_amount' => static function ($builder): void {
                    $builder->where('order_status', 'selesai');
                },
            ], 'total_amount')
            ->when($activeConfig !== null, function ($builder) use ($activeConfig): void {
                $builder->withCount([
                    'loyaltyRedemptions as active_loyalty_redemptions_count' => static function ($redemptions) use ($activeConfig): void {
                        $redemptions->where('loyalty_config_id', $activeConfig->id);
                    },
                ]);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->through(function (User $user) use ($activeConfig): array {
                $orderCount = (int) $user->orders_count;
                $hasRedeemed = (int) ($user->active_loyalty_redemptions_count ?? 0) > 0;

                return [
                    'id' => $user->hashid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at,
                    'orders_count' => $user->orders_count,
                    'total_orders' => $user->total_orders,
                    'orders_sum_total_amount' => $user->orders_sum_total_amount,
                    'tier' => $this->loyaltyService->getTier($orderCount),
                    'is_eligible' => $activeConfig ? $orderCount >= $activeConfig->min_orders : false,
                    'has_redeemed' => $hasRedeemed,
                    'created_at' => $user->created_at,
                ];
            });
    }

    /**
     * Get statistics untuk dashboard admin pelanggan.
     */
    public function getStats(): array
    {
        $totalPelanggan = User::where('role', 'pembeli')->count();
        $aktifBulanIni = User::where('role', 'pembeli')
            ->where('email_verified_at', '>=', now()->subDays(30))
            ->count();
        $belumLogin = User::where('role', 'pembeli')
            ->whereNull('email_verified_at')
            ->count();

        $totalRevenue = Order::where('order_status', 'selesai')
            ->whereNotNull('user_id')
            ->sum('total_amount');

        return [
            'total_pelanggan' => $totalPelanggan,
            'aktif_bulan_ini' => $aktifBulanIni,
            'belum_login' => $belumLogin,
            'total_revenue' => $totalRevenue,
        ];
    }

    /**
     * Create pelanggan baru.
     */
    public function createPelanggan(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role' => 'pembeli',
            'password' => null,
        ]);
    }

    /**
     * Update pelanggan.
     */
    public function updatePelanggan(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
        ]);

        return $user;
    }

    /**
     * Send OTP invite ke pelanggan.
     */
    public function sendInviteOtp(User $user): void
    {
        $this->otpService->sendOtp($user->email);
    }

    /**
     * Get detail pelanggan dengan orders.
     */
    public function getPelangganDetail(User $user, int $perPage = 10, int $page = 1): array
    {
        $activeConfig = $this->loyaltyService->getActiveConfig();
        $completedOrderCount = $user->orders()->where('order_status', 'selesai')->count();
        $hasRedeemed = $activeConfig !== null
            ? $user->loyaltyRedemptions()
                ->where('loyalty_config_id', $activeConfig->id)
                ->exists()
            : false;

        return [
            'id' => $user->hashid,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'total_orders' => $user->orders()->count(),
            'total_spent' => $user->orders()->where('order_status', 'selesai')->sum('total_amount'),
            'tier' => $this->loyaltyService->getTier($completedOrderCount),
            'loyalty_completed_orders' => $completedOrderCount,
            'loyalty_min_orders' => $activeConfig?->min_orders,
            'loyalty_progress_percent' => $activeConfig !== null
                ? min(100, (int) round(($completedOrderCount / max(1, $activeConfig->min_orders)) * 100))
                : null,
            'is_eligible' => $activeConfig ? $completedOrderCount >= $activeConfig->min_orders : false,
            'has_redeemed' => $hasRedeemed,
            'orders' => $user->orders()
                ->latest('booking_date')
                ->latest('id')
                ->paginate($perPage, ['*'], 'page', $page)
                ->through(function (Order $order): array {
                    return [
                        'id' => $order->hashid,
                        'order_number' => $order->order_number,
                        'booking_date' => $order->booking_date,
                        'order_type' => $order->order_type,
                        'status' => $order->order_status,
                        'total_amount' => $order->total_amount,
                        'is_price_pending' => $order->is_price_pending,
                        'items_count' => $order->items()->count(),
                    ];
                }),
        ];
    }
}
