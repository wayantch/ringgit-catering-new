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

    public function index(Request $request): Response
    {
        $printData = $this->printService->getPrintData(
            tanggal: $request->string('tanggal')->toString() ?: null,
            dari: $request->string('dari')->toString() ?: null,
            sampai: $request->string('sampai')->toString() ?: null,
        );

        return Inertia::render('Admin/Print/Index', [
            'printData' => $printData,
            'filters' => $request->only(['dari', 'sampai', 'tanggal']),
        ]);
    }
}
