<?php

namespace App\Http\Controllers\Produksi;

use App\Http\Controllers\Controller;
use App\Services\Produksi\PesananService;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController extends Controller
{
    public function __construct(private PesananService $service) {}

    public function __invoke(): Response
    {
        $data = $this->service->getBerandaData();

        return Inertia::render('Produksi/Beranda', [
            'user' => ['name' => auth()->user()->name],
            'stats' => $data['stats'],
            'pesanan_aktif' => $data['pesanan_aktif'],
            'pesananDiprosesCount' => $data['pesanan_diproses_count'],
        ]);
    }
}
