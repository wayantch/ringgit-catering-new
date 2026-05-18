<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminLoginRequest;
use App\Http\Requests\UserLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class LoginController extends Controller
{
    public function showUserLoginForm(): Response
    {
        return inertia('Auth/OtpLogin');
    }

    public function loginUser(UserLoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'role' => 'user',
        ])) {
            return back()
                ->withErrors([
                    'email' => 'Email atau password tidak sesuai.',
                ])
                ->withInput($request->only('email'));
        }

        $request->session()->regenerate();

        return redirect()->route('user.beranda');
    }

    public function showAdminLoginForm(): Response
    {
        return inertia('Admin/Login');
    }

    public function loginAdmin(AdminLoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'role' => $credentials['role'],
        ])) {
            return back()
                ->withErrors([
                    'email' => 'Email, password, atau role yang dipilih tidak sesuai.',
                ])
                ->withInput($request->only('email', 'role'));
        }

        $request->session()->regenerate();

        $user = Auth::user();

        return match ($user?->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'produksi' => redirect()->route('produksi.beranda'),
            default => redirect()->route('home'),
        };
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('user.login');
    }
}
