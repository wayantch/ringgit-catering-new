<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class OtpController extends Controller
{
    public function __construct(
        private OtpService $otpService,
    ) {}

    public function showLogin(): Response
    {
        return inertia('Auth/OtpLogin');
    }

    public function requestOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = $validated['email'];

        // Check rate limit
        $key = "otp:{$email}";
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        RateLimiter::hit($key, 10 * 60); // 10 menit

        try {
            $this->otpService->sendOtp($email);
        } catch (\Throwable $e) {
            Log::error('OTP request failed.', [
                'email' => $email,
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'Gagal mengirim OTP. Coba lagi beberapa saat.',
            ]);
        }

        $request->session()->put('otp_email', $email);

        return redirect()->route('otp.verify.show', ['email' => $email])
            ->with('success', 'Kode OTP telah dikirim ke email kamu.');
    }

    public function showVerify(Request $request): Response|RedirectResponse
    {
        $email = $request->query('email', session('otp_email'));

        if (! $email) {
            return redirect()->route('login');
        }

        return inertia('Auth/OtpVerify', [
            'email' => $email,
        ]);
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string|size:6',
        ]);

        $email = strtolower(trim($validated['email']));
        $token = preg_replace('/\s+/', '', $validated['token']);

        if (! $email) {
            return redirect()->route('login');
        }

        try {
            $user = $this->otpService->verifyOtp($email, $token);

            $request->session()->forget('otp_email');

            return match ($user->role) {
                'pembeli' => redirect()->route('user.beranda'),
                'admin' => redirect()->route('admin.dashboard'),
                'produksi' => redirect()->route('produksi.beranda'),
                default => redirect()->route('user.beranda'),
            };
        } catch (\Throwable $e) {
            Log::warning('OTP verification failed.', [
                'email' => $email,
                'token' => $token,
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'token' => 'Kode OTP salah atau sudah kadaluarsa. Coba lagi atau minta kode baru.',
            ]);
        }
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $email = strtolower(trim((string) $request->input('email', session('otp_email'))));

        if (! $email) {
            return redirect()->route('login');
        }

        // Check rate limit
        $key = "otp-resend:{$email}";
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'resend' => "Terlalu banyak percobaan. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        RateLimiter::hit($key, 10 * 60); // 10 menit

        try {
            $this->otpService->sendOtp($email);
        } catch (\Throwable $e) {
            Log::error('OTP resend failed.', [
                'email' => $email,
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'resend' => 'Gagal mengirim OTP baru. Coba lagi beberapa saat.',
            ]);
        }

        return back()->with('success', 'Kode OTP baru telah dikirim ke email kamu.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
