<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    /**
     * Every panel here is an aggregate query, so the shell is sent first and
     * the numbers stream in behind a skeleton. Grouped so the summary panels
     * and the two lists each arrive in a single follow-up request.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => Inertia::defer(fn (): array => $this->service->getStats(), 'summary'),
            'weekly_revenue' => Inertia::defer(fn (): array => $this->service->getWeeklyRevenue(), 'summary'),
            'order_status_distribution' => Inertia::defer(fn (): array => $this->service->getOrderStatusDistribution(), 'summary'),
            'completion_rate' => Inertia::defer(fn (): int => $this->service->getCompletionRate(), 'summary'),
            'recent_orders' => Inertia::defer(fn (): array => $this->service->getRecentOrders(), 'lists'),
            'top_menus' => Inertia::defer(fn (): array => $this->service->getTopMenus(), 'lists'),
        ]);
    }
}
