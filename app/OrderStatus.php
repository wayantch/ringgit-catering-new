<?php

namespace App;

enum OrderStatus: string
{
    case Baru = 'baru';
    case MenungguVerifikasi = 'menunggu_verifikasi';
    case Diproses = 'diproses';
    case Selesai = 'selesai';
}
