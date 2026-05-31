<?php

namespace App\Services\Auth;

use App\Mail\OtpMail;
use App\Models\OtpToken;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    /**
     * Generate dan kirim OTP baru ke email.
     */
    public function sendOtp(string $email): OtpToken
    {
        // 1. Invalidasi semua OTP lama untuk email ini
        OtpToken::where('email', $email)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->update(['expires_at' => now()]);

        // 2. Generate token 6 digit
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // 3. Simpan ke DB
        $otp = OtpToken::create([
            'email' => $email,
            'token' => $token,
            'expires_at' => now()->addMinutes(config('auth.otp_expiry_minutes', 5)),
        ]);

        // 4. Kirim email
        try {
            Mail::to($email)->send(new OtpMail($token));
        } catch (\Throwable $e) {
            $otp->delete();

            throw $e;
        }

        return $otp;
    }

    /**
     * Verifikasi OTP dan proses login.
     */
    public function verifyOtp(string $email, string $token): User
    {
        // 1. Cari OTP yang valid
        $otp = OtpToken::where('email', $email)
            ->where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        // 2. Mark OTP sebagai used
        $otp->update(['used_at' => now()]);

        // 3. Cari atau buat user
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => explode('@', $email)[0],
                'role' => 'pembeli',
                'password' => null,
            ]
        );

        // 4. Verifikasi email jika belum
        if (! $user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }

        // 5. Login user
        auth()->login($user, remember: true);

        return $user;
    }
}
