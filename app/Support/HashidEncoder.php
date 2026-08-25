<?php

namespace App\Support;

class HashidEncoder
{
    public static function encode(int|string $value): string
    {
        $id = (int) $value;

        if ($id < 0) {
            return '';
        }

        $alphabet = self::alphabet();
        $base = strlen($alphabet);

        if ($base < 2) {
            return (string) $id;
        }

        $encoded = '';

        do {
            $remainder = $id % $base;
            $encoded = $alphabet[$remainder].$encoded;
            $id = intdiv($id, $base);
        } while ($id > 0);

        $length = self::length();

        if ($length > 0) {
            $encoded = str_pad($encoded, $length, $alphabet[0], STR_PAD_LEFT);
        }

        return $encoded;
    }

    public static function decode(string $value): ?int
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $alphabet = self::alphabet();
        $base = strlen($alphabet);

        if ($base < 2) {
            return ctype_digit($value) ? (int) $value : null;
        }

        $map = array_flip(str_split($alphabet));
        $pad = $alphabet[0];
        $trimmed = ltrim($value, $pad);

        if ($trimmed === '') {
            return 0;
        }

        $decoded = 0;

        foreach (str_split($trimmed) as $character) {
            if (! isset($map[$character])) {
                return null;
            }

            $decoded = ($decoded * $base) + $map[$character];
        }

        return $decoded;
    }

    private static function alphabet(): string
    {
        $alphabet = (string) config('hashids.connections.main.alphabet', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

        return self::shuffleAlphabet($alphabet, (string) config('hashids.connections.main.salt', 'ringgit-catering-secret-2025'));
    }

    private static function length(): int
    {
        return (int) config('hashids.connections.main.length', 0);
    }

    private static function shuffleAlphabet(string $alphabet, string $salt): string
    {
        $characters = str_split($alphabet);
        $count = count($characters);

        if ($count < 2) {
            return $alphabet;
        }

        for ($index = $count - 1; $index > 0; $index--) {
            $hash = hash('sha256', $salt.':'.$index);
            $swapIndex = hexdec(substr($hash, 0, 8)) % ($index + 1);

            [$characters[$index], $characters[$swapIndex]] = [$characters[$swapIndex], $characters[$index]];
        }

        return implode('', $characters);
    }
}
