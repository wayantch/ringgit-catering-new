<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->service->getStats(),
            'weekly_revenue' => $this->service->getWeeklyRevenue(),
            'order_status_distribution' => $this->service->getOrderStatusDistribution(),
            'completion_rate' => $this->service->getCompletionRate(),
            'recent_orders' => $this->service->getRecentOrders(),
            'top_menus' => $this->service->getTopMenus(),
        ]);
    }
}
