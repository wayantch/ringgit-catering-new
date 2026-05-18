<?php

namespace App\Helpers;

class HashidHelper
{
    public static function encode(int $id): string
    {
        return app('hashids')->encode($id);
    }

    public static function decode(string $hashid): ?int
    {
        $decoded = app('hashids')->decode($hashid);

        return ! empty($decoded) ? (int) $decoded[0] : null;
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
