<?php

namespace App\Http\Controllers\Produksi;

use App\Http\Controllers\Controller;
use App\Services\Produksi\PesananService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController extends Controller
{
    public function __construct(private PesananService $service) {}

    /**
     * The stats and the active-order list are aggregates over today's orders,
     * so they stream in behind a skeleton. The nav badge count stays eager to
     * keep it from flashing zero.
     */
    public function __invoke(): Response
    {
        $berandaData = null;

        $resolve = function () use (&$berandaData): array {
            return $berandaData ??= $this->service->getBerandaData();
        };

        return Inertia::render('Produksi/Beranda', [
            'user' => ['name' => Auth::user()->name],
            'pesananDiprosesCount' => $this->service->countDiproses(),
            'stats' => Inertia::defer(fn (): array => $resolve()['stats'], 'beranda'),
            'pesanan_aktif' => Inertia::defer(fn (): array => $resolve()['pesanan_aktif'], 'beranda'),
        ]);
    }
}
