<?php

namespace App\Rules;

use App\Support\HashidEncoder;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidHashid implements ValidationRule
{
    public function __construct(
        private string $model,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $id = HashidEncoder::decode((string) $value);

        if ($id === null) {
            $fail('ID tidak valid.');

            return;
        }

        if (! ($this->model)::query()->whereKey($id)->exists()) {
            $fail('Data tidak ditemukan.');
        }
    }
}
