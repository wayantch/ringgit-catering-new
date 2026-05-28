<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePengaturanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'business_name' => ['required', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_holder_name' => ['nullable', 'string', 'max:255'],
            'dp_percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'order_edit_limit_days' => ['required', 'integer', 'min:0', 'max:3650'],
            'otp_expiry_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
        ];
    }
}
