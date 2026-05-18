<?php

namespace App\Http\Controllers\Produksi;

use App\Http\Controllers\Controller;
use App\Services\Produksi\PesananService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RiwayatController extends Controller
{
    public function __construct(private PesananService $service) {}

    public function __invoke(Request $request): Response
    {
        $filters = [
            'search' => $request->query('search', ''),
            'booking_date' => $request->query('booking_date', ''),
            'status' => $request->query('status', 'semua'),
            'page' => $request->query('page', 1),
        ];

        $data = $this->service->getRiwayatIndex($filters);

        return Inertia::render('Produksi/Riwayat', [
            'riwayat' => $data['riwayat'],
            'filters' => [
                'search' => $filters['search'],
                'booking_date' => $filters['booking_date'],
                'status' => $filters['status'],
            ],
            'pesananDiprosesCount' => $data['pesanan_diproses_count'],
        ]);
    }
}
