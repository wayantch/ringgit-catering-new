<?php

namespace App\Helpers;

use App\Support\HashidEncoder;

class HashidHelper
{
    public static function encode(int $id): string
    {
        return HashidEncoder::encode($id);
    }

    public static function decode(string $hashid): ?int
    {
        return HashidEncoder::decode($hashid);
    }

    public static function decodeOrFail(string $hashid): int
    {
        $id = self::decode($hashid);

        if (! $id) {
            abort(404, 'ID tidak valid.');
        }

        return $id;
    }
}
