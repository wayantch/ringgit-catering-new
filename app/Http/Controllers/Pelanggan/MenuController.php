<?php

namespace App\Http\Controllers\Pelanggan;

use App\Services\Pelanggan\MenuService;
use Inertia\Inertia;
use Inertia\Response;

class MenuController
{
    public function __invoke(MenuService $service): Response
    {
        $eceran = $service->getEceranMenus();

        return Inertia::render('Pelanggan/Menu', [
            'timbang_hidup' => $service->getTimbangHidupMenus(),
            'eceran' => [
                'paket_pass' => $eceran['paket_pass'] ?? [],
                'paket_nasi_box' => $eceran['paket_nasi_box'] ?? [],
                'babi_adat' => $eceran['babi_adat'] ?? [],
            ],
        ]);
    }
}
