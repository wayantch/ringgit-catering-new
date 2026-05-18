<?php

namespace App;

enum AdatType: string
{
    case BatakLengkap = 'batak_lengkap';
    case BatakKepala = 'batak_kepala';
    case BatakAliang = 'batak_aliang';
    case BatakSomba = 'batak_somba';
    case BatakSoit = 'batak_soit';
    case BatakEkor = 'batak_ekor';
    case BatakJeroan = 'batak_jeroan';
    case NiasSimbiSimbi = 'nias_simbi_simbi';
    case Lainnya = 'lainnya';
}
