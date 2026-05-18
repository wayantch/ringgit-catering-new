<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class EceranMenuSeeder extends Seeder
{
    public function run(): void
    {
        // Paket Pass
        $paketPass = MenuItem::create([
            'name' => 'Paket PASS',
            'menu_type' => 'eceran',
            'sub_type' => 'paket_pass',
            'description' => 'Menggunakan daging babi muda yang pastinya akan membuat masakan jadi terasa lebih NIKMAT!! • PASS untuk 8 porsi',
            'is_bundle' => true,
            'bundle_desc' => 'Paket lengkap untuk 8 porsi',
            'free_ongkir_km' => 10,
            'is_available' => true,
        ]);
        $paketPass->variants()->create(['label' => 'Paket PASS', 'harga' => 430000]);

        $paketPassMini = MenuItem::create([
            'name' => 'Paket PASS mini',
            'menu_type' => 'eceran',
            'sub_type' => 'paket_pass',
            'description' => 'Menggunakan daging babi muda yang pastinya akan membuat masakan jadi terasa lebih NIKMAT!!',
            'is_bundle' => true,
            'free_ongkir_km' => 10,
            'is_available' => true,
        ]);
        $paketPassMini->variants()->create(['label' => 'Paket PASS mini', 'harga' => 225000]);

        $panggangBox = MenuItem::create([
            'name' => 'PANGGANG BOX',
            'menu_type' => 'eceran',
            'sub_type' => 'paket_pass',
            'description' => 'Menggunakan daging babi muda dipadu dengan sambal andaliman khas Ringgit',
            'is_available' => true,
        ]);
        $panggangBox->variants()->create(['label' => 'PANGGANG BOX', 'harga' => 220000]);

        // Paket Nasi Box
        $napass = MenuItem::create([
            'name' => 'Paket NAPASS',
            'menu_type' => 'eceran',
            'sub_type' => 'paket_nasi_box',
            'description' => 'Menggunakan daging babi muda dipadu dengan bumbu racikan KONG RINGGIT membuat masakan jadi terasa NIKMAT!!',
            'is_available' => true,
        ]);
        $napass->variants()->create(['label' => 'Paket NAPASS', 'harga' => 55000]);

        $nasiBipang = MenuItem::create([
            'name' => 'NASI BIPANG',
            'menu_type' => 'eceran',
            'sub_type' => 'paket_nasi_box',
            'description' => 'Menggunakan daging babi muda dipadu dengan bumbu racikan khas',
            'is_available' => true,
        ]);
        $nasiBipang->variants()->create(['label' => 'NASI BIPANG', 'harga' => 35000]);

        $nasiSaksang = MenuItem::create([
            'name' => 'NASI SAKSANG',
            'menu_type' => 'eceran',
            'sub_type' => 'paket_nasi_box',
            'description' => 'Menggunakan daging babi muda dipadu dengan bumbu racikan khas',
            'is_available' => true,
        ]);
        $nasiSaksang->variants()->create(['label' => 'NASI SAKSANG', 'harga' => 30000]);

        // Babi Adat
        $namargoarMatang = MenuItem::create([
            'name' => 'NAMARGOAR (matang)',
            'menu_type' => 'eceran',
            'sub_type' => 'babi_adat',
            'description' => '• Namargoar adat batak • Harga sudah termasuk jeroan • Timbang hidup kisaran 25Kg',
            'is_available' => true,
        ]);
        $namargoarMatang->variants()->create(['label' => 'NAMARGOAR matang', 'harga' => 1075000]);

        $namargoarMentah = MenuItem::create([
            'name' => 'NAMARGOAR (mentah)',
            'menu_type' => 'eceran',
            'sub_type' => 'babi_adat',
            'description' => '• Namargoar adat batak • Harga sudah termasuk jeroan • Timbang hidup kisaran 25Kg',
            'is_available' => true,
        ]);
        $namargoarMentah->variants()->create(['label' => 'NAMARGOAR mentah', 'harga' => 0]);

        $simbiSimbi = MenuItem::create([
            'name' => 'SIMBI-SIMBI',
            'menu_type' => 'eceran',
            'sub_type' => 'babi_adat',
            'description' => '• Adat Nias • Simbi-simbi',
            'is_available' => true,
        ]);
        $simbiSimbi->variants()->create(['label' => 'Simbi-simbi', 'harga' => 0]);
    }
}
