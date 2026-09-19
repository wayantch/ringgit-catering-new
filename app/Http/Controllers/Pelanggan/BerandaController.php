<?php

namespace App\Http\Controllers\Pelanggan;

use App\Services\Pelanggan\BerandaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController
{
    public function __invoke(Request $request, BerandaService $service): Response
    {
        $user = $request->user();

        return Inertia::render('Pelanggan/Beranda/Index', [
            'recentOrders' => $service->getRecentOrders($user),
            'user' => $user,
        ]);
    }
}
