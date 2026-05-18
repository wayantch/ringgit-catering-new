<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Production\PesananService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(private PesananService $service) {}

    public function beranda(): Response
    {
        $dashboardData = $this->service->getBerandaData();

        return Inertia::render('Production/Beranda', $dashboardData);
    }

    public function pesanan(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'period' => $request->string('period')->toString() ?: 'today',
        ];

        $data = $this->service->getPesananData($filters);

        return Inertia::render('Production/Pesanan', [
            ...$data,
            'filters' => $filters,
        ]);
    }

    public function riwayat(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'period' => $request->string('period')->toString() ?: 'week',
        ];

        $data = $this->service->getRiwayatData($filters);

        return Inertia::render('Production/Riwayat', [
            ...$data,
            'filters' => $filters,
        ]);
    }

    public function complete(Order $order): RedirectResponse
    {
        try {
            $this->service->completeOrder($order);
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pesanan ditandai selesai.');
    }

    public function updateStage(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'stage' => ['required', 'in:diproses,dimasak,siap'],
        ]);

        try {
            $this->service->updateStage($order, $validated['stage']);
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Tahap produksi diperbarui.');
    }

    public function togglePriority(Order $order): RedirectResponse
    {
        try {
            $this->service->togglePriority($order);
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Prioritas pesanan diperbarui.');
    }
}
