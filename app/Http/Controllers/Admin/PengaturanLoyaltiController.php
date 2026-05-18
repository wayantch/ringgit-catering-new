<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLoyaltyConfigRequest;
use App\Http\Requests\Admin\UpdateLoyaltyConfigRequest;
use App\Models\LoyaltyConfig;
use App\Services\LoyaltyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PengaturanLoyaltiController extends Controller
{
    public function __construct(
        private LoyaltyService $loyaltyService,
    ) {}

    public function index(): Response
    {
        $config = LoyaltyConfig::query()->latest('id')->first();

        return Inertia::render('Admin/Pengaturan/Loyalti', [
            'config' => $this->formatConfig($config),
            'stats' => $this->loyaltyService->getAdminStats(),
            'eligible_customers' => $config ? $this->loyaltyService->getEligibleCustomers($config) : collect(),
        ]);
    }

    public function store(StoreLoyaltyConfigRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            if (! empty($validated['is_active'])) {
                LoyaltyConfig::query()->where('is_active', true)->update(['is_active' => false]);
            }

            LoyaltyConfig::create($validated);
        });

        return back()->with('success', 'Konfigurasi loyalti berhasil disimpan.');
    }

    public function update(
        UpdateLoyaltyConfigRequest $request,
        LoyaltyConfig $loyaltyConfig,
    ): RedirectResponse {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $loyaltyConfig): void {
            if (! empty($validated['is_active'])) {
                LoyaltyConfig::query()
                    ->where('is_active', true)
                    ->whereKeyNot($loyaltyConfig->id)
                    ->update(['is_active' => false]);
            }

            $loyaltyConfig->update($validated);
        });

        return back()->with('success', 'Konfigurasi loyalti berhasil diperbarui.');
    }

    private function formatConfig(?LoyaltyConfig $config): ?array
    {
        if (! $config) {
            return null;
        }

        return [
            'id' => $config->hashid,
            'is_active' => $config->is_active,
            'min_orders' => $config->min_orders,
            'discount_type' => $config->discount_type,
            'discount_value' => (float) $config->discount_value,
            'max_discount' => $config->max_discount !== null ? (float) $config->max_discount : null,
            'period_start' => $config->period_start?->toDateString(),
            'period_end' => $config->period_end?->toDateString(),
            'count_period' => $config->count_period,
            'count_from' => $config->count_from?->toDateString(),
            'count_to' => $config->count_to?->toDateString(),
            'description' => $config->description,
        ];
    }
}
