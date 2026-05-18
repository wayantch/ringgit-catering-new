<?php

namespace App\Enums;

class KondisiProduk
{
    // Per tipe kategori
    public const TIMBANG_HIDUP = ['adat', 'saksang', 'panggang', 'sop'];
    public const OLAHAN = ['mentah', 'mateng'];
    public const ECERAN = ['satuan', 'adat'];

    // Label display
    public const LABELS = [
        'batak' => 'Batak',
        'nias' => 'Nias',
        'tanpa_adat' => 'Tanpa Adat',
        'adat' => 'Adat',
        'saksang' => 'Saksang',
        'panggang' => 'Panggang',
        'sop' => 'Sop',
        'mentah' => 'Mentah',
        'mateng' => 'Mateng',
        'satuan' => 'Satuan',
    ];

    // ADAT options (values only) for backend validation
    public const ADAT_OPTIONS = [
        'batak',
        'nias',
        'tanpa_adat',
        'batak_lengkap',
        'batak_kepala',
        'batak_aliang',
        'batak_somba',
        'batak_soit',
        'batak_ekor',
        'batak_jeroan',
        'nias_barat',
        'nias_kota',
        'nias_sekitar',
        'nias_simbi_simbi',
        'lainnya',
    ];

    // Cek apakah kondisi butuh sub-pilihan adat
    public static function requiresAdat(string $kondisi): bool
    {
        return $kondisi === 'adat';
    }

    // Ambil opsi valid berdasarkan category type
    public static function forCategoryType(string $type): array
    {
        return match ($type) {
            'timbang_hidup' => self::TIMBANG_HIDUP,
            'olahan' => self::OLAHAN,
            'eceran' => self::ECERAN,
            default => self::OLAHAN,
        };
    }
}
