<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLoyaltyConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'is_active' => ['boolean'],
            'min_orders' => ['required', 'integer', 'min:1'],
            'discount_type' => ['required', Rule::in(['nominal', 'percentage'])],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'count_period' => ['required', Rule::in(['all_time', 'this_year', 'custom'])],
            'count_from' => ['nullable', 'date', 'required_if:count_period,custom'],
            'count_to' => ['nullable', 'date', 'required_if:count_period,custom', 'after_or_equal:count_from'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'min_orders.required' => 'Minimum pesanan harus diisi.',
            'discount_type.required' => 'Tipe diskon harus dipilih.',
            'discount_value.required' => 'Nilai diskon harus diisi.',
            'count_period.required' => 'Periode hitung pesanan harus dipilih.',
            'count_from.required_if' => 'Tanggal mulai wajib diisi jika periode hitung kustom.',
            'count_to.required_if' => 'Tanggal selesai wajib diisi jika periode hitung kustom.',
        ];
    }
}
