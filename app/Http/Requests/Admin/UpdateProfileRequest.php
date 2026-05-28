<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required_without:current_password', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'current_password' => ['nullable', 'string', 'current_password', 'required_with:password'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed', 'required_with:current_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required_without' => 'Nama wajib diisi.',
            'current_password.current_password' => 'Password lama tidak cocok.',
            'password.confirmed' => 'Konfirmasi password baru tidak sesuai.',
        ];
    }
}
