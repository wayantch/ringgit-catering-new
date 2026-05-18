<?php

namespace App\Http\Controllers\Produksi;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Produksi\PesananService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(private PesananService $service) {}

    public function index(Request $request): Response
    {
        $filter_status = $request->query('status', 'semua');
        $page = $request->query('page', 1);

        $data = $this->service->getPesananIndex($filter_status, (int) $page);

        return Inertia::render('Produksi/Pesanan', [
            'pesanan' => $data['pesanan'],
            'filter_status' => $filter_status,
            'pesananDiprosesCount' => $data['pesanan_diproses_count'],
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('Produksi/PesananDetail', [
            'order' => $this->service->formatOrderDetail($order),
        ]);
    }

    public function proses(Order $order): RedirectResponse
    {
        try {
            $this->service->markAsProses($order);
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pesanan dimulai proses.');
    }

    public function selesai(Order $order): RedirectResponse
    {
        try {
            $this->service->markAsSelesai($order);
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pesanan ditandai selesai.');
    }
}
