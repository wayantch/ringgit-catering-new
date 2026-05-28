<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePengaturanRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PengaturanController extends Controller
{
    public function index(): Response
    {
        $setting = Setting::current();

        return Inertia::render('Admin/Pengaturan/Index', [
            'setting' => [
                'id' => $setting->id,
                'business_name' => $setting->business_name,
                'whatsapp_number' => $setting->whatsapp_number,
                'bank_name' => $setting->bank_name,
                'bank_account_number' => $setting->bank_account_number,
                'bank_account_holder_name' => $setting->bank_account_holder_name,
                'dp_percentage' => $setting->dp_percentage,
                'order_edit_limit_days' => $setting->order_edit_limit_days,
                'otp_expiry_minutes' => $setting->otp_expiry_minutes,
            ],
        ]);
    }

    public function update(UpdatePengaturanRequest $request): RedirectResponse
    {
        $setting = Setting::current();

        $setting->update($request->validated());

        return back()->with('success', 'Pengaturan bisnis berhasil diperbarui.');
    }
}
