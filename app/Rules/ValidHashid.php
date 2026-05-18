<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidHashid implements ValidationRule
{
    public function __construct(
        private string $model,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $decoded = app('hashids')->decode((string) $value);

        if (empty($decoded)) {
            $fail('ID tidak valid.');

            return;
        }

        $id = (int) $decoded[0];

        if (! ($this->model)::query()->whereKey($id)->exists()) {
            $fail('Data tidak ditemukan.');
        }
    }
}
