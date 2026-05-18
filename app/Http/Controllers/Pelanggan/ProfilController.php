<?php

namespace App\Http\Controllers\Pelanggan;

use App\Services\Pelanggan\ProfilService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController
{
    public function index(Request $request, ProfilService $service): Response
    {
        $user = $request->user();
        $stats = $service->getStats($user);

        return Inertia::render('Pelanggan/Profil/Index', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request, ProfilService $service): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $service->update($request->user(), $validated);

        return back()->with('success', 'Profil berhasil diperbarui');
    }
}
