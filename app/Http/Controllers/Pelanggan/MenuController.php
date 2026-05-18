<?php

namespace App\Http\Controllers\Pelanggan;

use App\Services\Pelanggan\MenuService;
use Inertia\Inertia;
use Inertia\Response;

class MenuController
{
    public function __invoke(MenuService $service): Response
    {
        return Inertia::render('Pelanggan/Menu', [
            'timbang_hidup' => $service->getTimbangHidupMenus(),
            'eceran' => [
                'paket_pass' => $service->getEceranMenus()['paket_pass'] ?? [],
                'paket_nasi_box' => $service->getEceranMenus()['paket_nasi_box'] ?? [],
                'babi_adat' => $service->getEceranMenus()['babi_adat'] ?? [],
            ],
        ]);
    }
}
