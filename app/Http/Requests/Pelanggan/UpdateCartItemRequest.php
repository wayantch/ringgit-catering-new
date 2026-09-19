<?php

namespace App\Http\Requests\Pelanggan;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'numeric', 'min:0.5'],
            'adat_type' => ['nullable', 'string'],
            'portion' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
