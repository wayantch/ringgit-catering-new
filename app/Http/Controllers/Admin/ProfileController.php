<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProfileRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        return Inertia::render('Admin/Profil/Index', [
            'user' => [
                'name' => $user?->name,
                'email' => $user?->email,
                'phone' => $user?->phone,
                'role' => $user?->role,
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $profileData = array_filter([
            'name' => $validated['name'] ?? null,
            'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : null,
        ], static fn ($value) => $value !== null);

        if ($profileData !== []) {
            $user->fill($profileData)->save();
        }

        if (! empty($validated['password'])) {
            $user->forceFill([
                'password' => Hash::make($validated['password']),
            ])->save();

            return back()->with('success', 'Password admin berhasil diperbarui.');
        }

        return back()->with('success', 'Profil admin berhasil diperbarui.');
    }
}
