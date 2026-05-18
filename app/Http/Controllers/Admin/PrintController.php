<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\PrintService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrintController extends Controller
{
    public function __construct(private PrintService $printService) {}

    /**
     * Show print preview page with filters.
     */
    public function index(Request $request): Response
    {
        $data = $this->printService->getDataPrint(
            tanggalDari: $request->get('dari'),
            tanggalSampai: $request->get('sampai'),
            tanggalSpesifik: $request->get('tanggal'),
        );

        return Inertia::render('Admin/Print/Index', [ 
            'printData' => $data,
            'filters'   => $request->only(['dari', 'sampai', 'tanggal']),
        ]);
    }
}
